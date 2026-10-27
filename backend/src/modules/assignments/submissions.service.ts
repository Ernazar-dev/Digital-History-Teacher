import { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { assertCanAccessStudent, studentScope } from '../../shared/utils/access';
import { buildMeta } from '../../shared/utils/http';
import { COMPONENT, componentIdByCode, recordEvidence } from '../assessments/competence.service';
import { upsertPortfolioItem } from '../portfolios/portfolio.writer';
import { getVisibleAssignment } from './assignments.service';
import { gradeSimulator, missingInAnswer, publicSimulator, simulatorAnswerSchema, simulatorSchema } from './simulator';
import type { feedbackSchema, listSubmissionsQuery, saveSubmissionSchema } from './assignments.schemas';

const include = {
  student: { select: { id: true, fullName: true, username: true, email: true } },
  assignment: {
    select: {
      id: true, title: true, type: true, maxScore: true, dueDate: true, evidenceKind: true, createdById: true, simulator: true,
      rubric: { include: { criteria: { orderBy: { sortOrder: 'asc' } } } },
      sources: { select: { sourceId: true } },
    },
  },
  lessonPlan: { select: { id: true, title: true, status: true, currentVersion: true } },
  revisions: { orderBy: { version: 'desc' } },
  feedbacks: {
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { id: true, fullName: true } }, scores: true },
  },
} satisfies Prisma.AssignmentSubmissionInclude;

const EDITABLE = ['NOT_STARTED', 'IN_PROGRESS', 'RETURNED'];

type Full = Prisma.AssignmentSubmissionGetPayload<{ include: typeof include }>;

/** Talaba to'g'ri javoblarni va avtomatik tekshiruvni o'qituvchi ko'rib chiqmaguncha ko'rmaydi */
const forStudent = (actor: Express.AuthUser, s: Full) => {
  if (actor.role !== 'STUDENT') return s;
  const reviewed = ['GRADED', 'RETURNED'].includes(s.status);
  return {
    ...s,
    assignment: { ...s.assignment, simulator: s.assignment.simulator ? publicSimulator(s.assignment.simulator) : null },
    ...(reviewed ? {} : { autoScore: null, autoDetails: null }),
  };
};

const getAccessible = async (actor: Express.AuthUser, id: string) => {
  const submission = await prisma.assignmentSubmission.findUnique({ where: { id }, include });
  if (!submission) throw AppError.notFound('Topshiriq javobi topilmadi');
  await assertCanAccessStudent(actor, submission.studentId).catch(() => {
    // Topshiriq muallifi (o'qituvchi) o'z topshirig'iga kelgan javoblarni ko'ra oladi
    if (submission.assignment.createdById !== actor.id) throw AppError.forbidden();
  });
  return forStudent(actor, submission);
};

export const submissionsService = {
  async list(actor: Express.AuthUser, q: z.infer<typeof listSubmissionsQuery>) {
    const where: Prisma.AssignmentSubmissionWhereInput = {};
    if (actor.role === 'STUDENT') where.studentId = actor.id;
    else {
      // O'qituvchi va admin talabaning qoralamasini ko'rmaydi — faqat topshirilgan ishlarni
      if (actor.role === 'TEACHER') where.OR = [{ studentId: await studentScope(actor) }, { assignment: { createdById: actor.id } }];
      where.status = { notIn: ['NOT_STARTED', 'IN_PROGRESS'] };
    }
    if (q.assignmentId) where.assignmentId = q.assignmentId;
    if (q.studentId) where.AND = [{ studentId: q.studentId }];
    if (q.status) where.status = q.status;
    const [total, items] = await prisma.$transaction([
      prisma.assignmentSubmission.count({ where }),
      prisma.assignmentSubmission.findMany({
        where,
        select: {
          id: true, status: true, score: true, version: true, submittedAt: true, updatedAt: true,
          student: { select: { id: true, fullName: true } },
          assignment: { select: { id: true, title: true, type: true, maxScore: true, dueDate: true } },
        },
        orderBy: [{ submittedAt: { sort: 'desc', nulls: 'last' } }, { updatedAt: 'desc' }],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return { items, meta: buildMeta(q.page, q.pageSize, total) };
  },

  get: getAccessible,

  /** Talaba javobini saqlaydi (qoralama). Topshirilgan yoki baholangan javob tahrirlanmaydi. */
  async save(actor: Express.AuthUser, assignmentId: string, input: z.infer<typeof saveSubmissionSchema>) {
    await getVisibleAssignment(actor, assignmentId);
    const existing = await prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId: actor.id } },
    });
    if (existing && !EDITABLE.includes(existing.status)) {
      throw AppError.badRequest('Topshirilgan javobni o‘qituvchi qaytarmaguncha tahrirlab bo‘lmaydi');
    }
    if (input.lessonPlanId) {
      const lesson = await prisma.lessonPlan.findFirst({ where: { id: input.lessonPlanId, authorId: actor.id, deletedAt: null } });
      if (!lesson) throw AppError.badRequest('Dars ishlanmasi topilmadi');
    }
    const data = {
      content: input.content,
      lessonPlanId: input.lessonPlanId ?? null,
      ...(input.simulatorAnswer !== undefined
        ? { simulatorAnswer: input.simulatorAnswer === null ? Prisma.DbNull : (input.simulatorAnswer as Prisma.InputJsonValue) }
        : {}),
      status: existing?.status === 'RETURNED' ? ('RETURNED' as const) : ('IN_PROGRESS' as const),
    };
    const saved = await prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId: actor.id } },
      create: { ...data, assignmentId, studentId: actor.id },
      update: data,
      include,
    });
    return forStudent(actor, saved);
  },

  async submit(actor: Express.AuthUser, assignmentId: string) {
    const assignment = await getVisibleAssignment(actor, assignmentId);
    const existing = await prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId: actor.id } },
      include: { lessonPlan: { select: { id: true, resources: { select: { sourceId: true } } } } },
    });
    if (!existing) throw AppError.badRequest('Avval javobni saqlang');
    if (!EDITABLE.includes(existing.status)) throw AppError.badRequest('Javob allaqachon topshirilgan');
    // Raqamli simulyator: javob to'liq bo'lishi kerak; avtomatik tekshiruv o'qituvchiga tavsiya sifatida saqlanadi
    const simulator = assignment.simulator ? simulatorSchema.safeParse(assignment.simulator) : null;
    let auto: ReturnType<typeof gradeSimulator> | null = null;
    if (simulator?.success) {
      const answer = simulatorAnswerSchema.safeParse(existing.simulatorAnswer);
      const missing = missingInAnswer(simulator.data, answer.success ? answer.data : null);
      if (missing.length) throw AppError.unprocessable('Simulyator topshirig‘ini yakunlang', { missing });
      auto = gradeSimulator(simulator.data, answer.data!);
    } else if (!existing.content.trim() && !existing.lessonPlanId) {
      throw AppError.unprocessable('Javob bo‘sh');
    }
    if (assignment.type === 'LESSON_PLAN' && !existing.lessonPlanId) {
      throw AppError.unprocessable('Bu topshiriq uchun dars ishlanmasini biriktiring');
    }
    const version = existing.version + 1;
    const sourceIds = new Set([
      ...assignment.sources.map((s) => s.source.id),
      ...(existing.lessonPlan?.resources.flatMap((r) => (r.sourceId ? [r.sourceId] : [])) ?? []),
    ]);
    await prisma.$transaction(async (tx) => {
      await tx.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          status: 'SUBMITTED', version, submittedAt: new Date(),
          ...(auto ? { autoScore: auto.score, autoDetails: auto as unknown as Prisma.InputJsonValue } : {}),
        },
      });
      await tx.submissionRevision.create({ data: { submissionId: existing.id, version, content: existing.content } });
      await upsertPortfolioItem(
        {
          studentId: actor.id,
          type: 'ASSIGNMENT',
          title: `Topshiriq: ${assignment.title}`,
          description: version > 1 ? `Qayta ishlangan javob (${version}-versiya)` : 'Metodik topshiriq javobi',
          refType: 'AssignmentSubmission',
          refId: existing.id,
          sourceIds: [...sourceIds],
          version,
        },
        tx,
      );
    });
    return getAccessible(actor, existing.id);
  },

  async startReview(actor: Express.AuthUser, id: string) {
    const submission = await getAccessible(actor, id);
    if (submission.status !== 'SUBMITTED') throw AppError.badRequest('Faqat topshirilgan javobni tekshirishni boshlash mumkin');
    await prisma.assignmentSubmission.update({ where: { id }, data: { status: 'UNDER_REVIEW' } });
    return getAccessible(actor, id);
  },

  /**
   * O'qituvchi fikr-mulohazasi: izoh, qayta ishlashga qaytarish yoki rubrika bo'yicha baholash.
   * Baholashda har bir mezon bog'langan kompetensiya komponentiga dalil sifatida yoziladi.
   */
  async feedback(actor: Express.AuthUser, id: string, input: z.infer<typeof feedbackSchema>) {
    const submission = await getAccessible(actor, id);
    if (actor.role === 'STUDENT') throw AppError.forbidden();
    const reviewable = ['SUBMITTED', 'UNDER_REVIEW'].includes(submission.status);
    if (input.decision !== 'COMMENT' && !reviewable) {
      throw AppError.badRequest('Faqat topshirilgan javobni qaytarish yoki baholash mumkin');
    }
    if (input.decision === 'COMMENT' && ['NOT_STARTED', 'IN_PROGRESS'].includes(submission.status)) {
      throw AppError.badRequest('Javob hali topshirilmagan');
    }

    const { assignment } = submission;
    const criteria = assignment.rubric?.criteria ?? [];
    let percent: number | null = null;
    let totalScore: number | null = null;

    if (input.decision === 'GRADE') {
      if (criteria.length) {
        for (const c of criteria) {
          const s = input.criterionScores.find((x) => x.criterionId === c.id);
          if (!s) throw AppError.unprocessable(`"${c.title}" mezoni bo‘yicha ball kiritilmagan`);
          if (s.score > c.maxScore) throw AppError.unprocessable(`"${c.title}" uchun maksimal ball — ${c.maxScore}`);
        }
        const raw = criteria.reduce((sum, c) => sum + input.criterionScores.find((x) => x.criterionId === c.id)!.score, 0);
        const max = criteria.reduce((sum, c) => sum + c.maxScore, 0);
        percent = (raw / max) * 100;
        totalScore = Math.round((percent / 100) * assignment.maxScore * 10) / 10;
      } else {
        if (input.totalScore === undefined) throw AppError.unprocessable('Umumiy ballni kiriting');
        if (input.totalScore > assignment.maxScore) throw AppError.unprocessable(`Maksimal ball — ${assignment.maxScore}`);
        totalScore = input.totalScore;
        percent = (input.totalScore / assignment.maxScore) * 100;
      }
    }

    const nextStatus =
      input.decision === 'GRADE' ? 'GRADED' : input.decision === 'RETURN_FOR_REVISION' ? 'RETURNED' : submission.status;

    await prisma.$transaction(async (tx) => {
      await tx.assignmentFeedback.create({
        data: {
          submissionId: id,
          authorId: actor.id,
          decision: input.decision,
          comment: input.comment,
          version: submission.version,
          totalScore,
          scores: {
            create: input.criterionScores
              .filter((s) => criteria.some((c) => c.id === s.criterionId))
              .map((s) => ({ criterionId: s.criterionId, score: s.score, comment: s.comment })),
          },
        },
      });
      await tx.assignmentSubmission.update({
        where: { id },
        data: {
          status: nextStatus,
          ...(input.decision === 'GRADE' ? { score: totalScore, gradedAt: new Date() } : {}),
        },
      });
      if (input.decision !== 'GRADE' || percent === null) return;

      // Kompetensiya dalillari: mezon → komponent; bog'lanmagan mezonlar standart komponentga
      const defaultCode = ['SOURCE_COMPARISON', 'CHRONOLOGY', 'MAP_IDENTIFICATION', 'PERSONALITY_ANALYSIS', 'EVIDENCE_CONCLUSION']
        .includes(assignment.type) ? COMPONENT.COGNITIVE : COMPONENT.ACTIVITY;
      const defaultComponentId = await componentIdByCode(defaultCode, tx);
      const buckets = new Map<string, { raw: number; max: number }>();
      if (criteria.length) {
        for (const c of criteria) {
          const target = c.componentId ?? defaultComponentId;
          if (!target) continue;
          const score = input.criterionScores.find((x) => x.criterionId === c.id)!.score;
          const b = buckets.get(target) ?? { raw: 0, max: 0 };
          buckets.set(target, { raw: b.raw + score, max: b.max + c.maxScore });
        }
      } else if (defaultComponentId) {
        buckets.set(defaultComponentId, { raw: percent, max: 100 });
      }
      for (const [componentId, b] of buckets) {
        await recordEvidence(
          {
            studentId: submission.studentId,
            componentId,
            evidenceKind: assignment.evidenceKind,
            assessorRole: actor.role === 'ADMIN' ? 'EXPERT' : 'TEACHER',
            assessorId: actor.id,
            score: (b.raw / b.max) * 100,
            note: `Topshiriq: ${assignment.title} (${submission.version}-versiya)`,
            refType: 'AssignmentSubmission',
            refId: id,
          },
          tx,
        );
      }
    });
    return getAccessible(actor, id);
  },
};

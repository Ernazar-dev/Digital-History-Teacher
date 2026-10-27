import { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { assertCanAccessStudent, studentScope } from '../../shared/utils/access';
import { buildMeta } from '../../shared/utils/http';
import { COMPONENT, componentIdByCode, recordEvidence } from '../assessments/competence.service';
import { upsertPortfolioItem } from '../portfolios/portfolio.writer';
import type { lessonBodySchema, lessonReviewSchema, listLessonsQuery, updateLessonSchema } from './lessons.schemas';

type Db = Prisma.TransactionClient | typeof prisma;

export const lessonInclude = {
  author: { select: { id: true, fullName: true } },
  reviewedBy: { select: { id: true, fullName: true } },
  assignment: { select: { id: true, title: true, rubricId: true } },
  topicRef: { select: { id: true, name: true, slug: true, period: { select: { id: true, name: true } } } },
  rubric: { select: { id: true, title: true } },
  stages: { orderBy: { sortOrder: 'asc' } },
  resources: {
    include: {
      source: { select: { id: true, title: true, slug: true, type: true, dateLabel: true, license: true, originalUrl: true } },
      virtualObject: { select: { id: true, title: true, slug: true, type: true, externalUrl: true, license: true } },
    },
  },
  versions: { select: { id: true, version: true, note: true, createdAt: true }, orderBy: { version: 'desc' } },
} satisfies Prisma.LessonPlanInclude;

export type LessonFull = Prisma.LessonPlanGetPayload<{ include: typeof lessonInclude }>;

/** Versiya tarixi uchun to'liq snapshot */
const snapshotOf = (l: LessonFull) => ({
  title: l.title, topic: l.topic, topicId: l.topicId, gradeLevel: l.gradeLevel, durationMinutes: l.durationMinutes,
  goals: l.goals, objectives: l.objectives, learningOutcomes: l.learningOutcomes,
  problemQuestions: l.problemQuestions, individualTasks: l.individualTasks, groupTasks: l.groupTasks,
  interactiveMethods: l.interactiveMethods, assessmentCriteria: l.assessmentCriteria,
  reflectionQuestions: l.reflectionQuestions, methodicalRationale: l.methodicalRationale,
  stages: l.stages.map(({ id: _id, lessonPlanId: _l, ...s }) => s),
  resources: l.resources.map((r) => ({
    sourceId: r.sourceId, virtualObjectId: r.virtualObjectId, purpose: r.purpose,
    title: r.source?.title ?? r.virtualObject?.title ?? null,
  })),
});

export const getAccessibleLesson = async (actor: Express.AuthUser, id: string, db: Db = prisma) => {
  const lesson = await db.lessonPlan.findFirst({ where: { id, deletedAt: null }, include: lessonInclude });
  if (!lesson) throw AppError.notFound('Dars ishlanmasi topilmadi');
  await assertCanAccessStudent(actor, lesson.authorId).catch(() => {
    // Admin/o'qituvchi o'zi yaratgan namunaviy ishlanmalarga ham kira oladi
    if (lesson.authorId !== actor.id) throw AppError.forbidden();
  });
  return lesson;
};

const assertResources = async (resources: z.infer<typeof lessonBodySchema>['resources']) => {
  const sourceIds = resources.flatMap((r) => (r.sourceId ? [r.sourceId] : []));
  const objectIds = resources.flatMap((r) => (r.virtualObjectId ? [r.virtualObjectId] : []));
  const [sources, objects] = await Promise.all([
    prisma.historicalSource.count({ where: { id: { in: sourceIds }, deletedAt: null } }),
    prisma.virtualObject.count({ where: { id: { in: objectIds }, deletedAt: null } }),
  ]);
  if (sources !== new Set(sourceIds).size || objects !== new Set(objectIds).size) {
    throw AppError.badRequest('Tanlangan resurslardan ba’zilari mavjud emas');
  }
};

const assertTopic = async (topicId?: string | null) => {
  if (topicId && !(await prisma.historicalTopic.findUnique({ where: { id: topicId }, select: { id: true } }))) {
    throw AppError.badRequest('Tanlangan mavzu katalogda topilmadi');
  }
};

/** Rubrika mezonlari bo'yicha ballarni tekshiradi va umumiy foizni hisoblaydi */
const scoreByRubric = async (
  rubricId: string,
  input: NonNullable<z.infer<typeof lessonReviewSchema>['criterionScores']>,
  db: Db,
) => {
  const rubric = await db.rubric.findUnique({ where: { id: rubricId }, include: { criteria: { orderBy: { sortOrder: 'asc' } } } });
  if (!rubric || rubric.criteria.length === 0) throw AppError.badRequest('Rubrika topilmadi yoki unda mezonlar yo‘q');
  const byId = new Map(input.map((s) => [s.criterionId, s]));
  const missing = rubric.criteria.filter((c) => !byId.has(c.id)).map((c) => c.title);
  if (missing.length) throw AppError.unprocessable('Barcha mezonlar bo‘yicha ball qo‘ying', { missing });
  if (input.some((s) => !rubric.criteria.some((c) => c.id === s.criterionId))) {
    throw AppError.badRequest('Ballar boshqa rubrikaga tegishli mezonni o‘z ichiga oladi');
  }
  const over = rubric.criteria.filter((c) => byId.get(c.id)!.score > c.maxScore).map((c) => c.title);
  if (over.length) throw AppError.unprocessable('Ball mezonning maksimal qiymatidan oshmasligi kerak', { over });

  const snapshot = rubric.criteria.map((c) => ({
    criterionId: c.id, title: c.title, maxScore: c.maxScore, score: byId.get(c.id)!.score, comment: byId.get(c.id)!.comment ?? null,
  }));
  const max = snapshot.reduce((s, c) => s + c.maxScore, 0);
  const total = snapshot.reduce((s, c) => s + c.score, 0);
  return { snapshot, percent: Math.round((total / max) * 1000) / 10 };
};

const writeChildren = async (
  tx: Prisma.TransactionClient,
  lessonPlanId: string,
  stages?: z.infer<typeof lessonBodySchema>['stages'],
  resources?: z.infer<typeof lessonBodySchema>['resources'],
) => {
  if (stages) {
    await tx.lessonStage.deleteMany({ where: { lessonPlanId } });
    await tx.lessonStage.createMany({ data: stages.map((s, i) => ({ ...s, lessonPlanId, sortOrder: i })) });
  }
  if (resources) {
    await tx.lessonResource.deleteMany({ where: { lessonPlanId } });
    await tx.lessonResource.createMany({
      data: resources.map((r) => ({
        lessonPlanId, sourceId: r.sourceId ?? null, virtualObjectId: r.virtualObjectId ?? null, purpose: r.purpose,
      })),
    });
  }
};

const saveVersion = async (tx: Prisma.TransactionClient, id: string, version: number, note?: string) => {
  const full = await tx.lessonPlan.findUniqueOrThrow({ where: { id }, include: lessonInclude });
  await tx.lessonPlanVersion.create({
    data: { lessonPlanId: id, version, snapshot: snapshotOf(full) as Prisma.InputJsonValue, note },
  });
};

export const lessonsService = {
  async list(actor: Express.AuthUser, q: z.infer<typeof listLessonsQuery>) {
    const where: Prisma.LessonPlanWhereInput = { deletedAt: null };
    if (actor.role === 'STUDENT') where.authorId = actor.id;
    else if (actor.role === 'TEACHER') {
      const scope = await studentScope(actor);
      where.OR = [{ authorId: scope }, { authorId: actor.id }];
      // O'qituvchi talabaning qoralamalarini ko'rmaydi
      where.NOT = { AND: [{ status: 'DRAFT' }, { authorId: { not: actor.id } }] };
    }
    if (q.authorId) where.AND = [{ authorId: q.authorId }];
    if (q.status) where.status = q.status;
    if (q.q) where.title = { contains: q.q, mode: 'insensitive' };
    const [total, items] = await prisma.$transaction([
      prisma.lessonPlan.count({ where }),
      prisma.lessonPlan.findMany({
        where,
        select: {
          id: true, title: true, topic: true, gradeLevel: true, durationMinutes: true, status: true,
          currentVersion: true, score: true, updatedAt: true, submittedAt: true,
          author: { select: { id: true, fullName: true } },
          _count: { select: { resources: true, stages: true } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return { items, meta: buildMeta(q.page, q.pageSize, total) };
  },

  get: (actor: Express.AuthUser, id: string) => getAccessibleLesson(actor, id),

  async create(actor: Express.AuthUser, input: z.infer<typeof lessonBodySchema>) {
    await assertResources(input.resources);
    await assertTopic(input.topicId);
    const { stages, resources, ...data } = input;
    const id = await prisma.$transaction(async (tx) => {
      const lesson = await tx.lessonPlan.create({ data: { ...data, authorId: actor.id, currentVersion: 1 } });
      await writeChildren(tx, lesson.id, stages, resources);
      await saveVersion(tx, lesson.id, 1, 'Dastlabki versiya');
      return lesson.id;
    });
    return getAccessibleLesson(actor, id);
  },

  async update(actor: Express.AuthUser, id: string, input: z.infer<typeof updateLessonSchema>) {
    const lesson = await getAccessibleLesson(actor, id);
    if (lesson.authorId !== actor.id) throw AppError.forbidden('Faqat muallif tahrirlay oladi');
    if (!['DRAFT', 'RETURNED'].includes(lesson.status)) {
      throw AppError.badRequest('Topshirilgan ishlanmani tahrirlab bo‘lmaydi');
    }
    const { stages, resources, versionNote, ...data } = input;
    if (resources) await assertResources(resources);
    await assertTopic(data.topicId);
    await prisma.$transaction(async (tx) => {
      const nextVersion = lesson.currentVersion + 1;
      await tx.lessonPlan.update({ where: { id }, data: { ...data, currentVersion: nextVersion } });
      await writeChildren(tx, id, stages, resources);
      await saveVersion(tx, id, nextVersion, versionNote);
    });
    return getAccessibleLesson(actor, id);
  },

  /**
   * Topshirishdan oldin metodik to'liqlik tekshiruvi (tayyor dars berilmaydi — faqat tekshiruv).
   * Bandlar hujjatdagi 3-modul ro'yxatiga mos: maqsad va vazifalar, manbalar, muammoli savollar,
   * individual va guruhli topshiriqlar, interaktiv metodlar, baholash mezonlari, metodik qaror asosnomasi.
   */
  validateForSubmit(lesson: LessonFull) {
    const problems: string[] = [];
    if (!lesson.goals.trim()) problems.push('Dars maqsadlari kiritilmagan');
    if (!lesson.objectives.trim()) problems.push('Dars vazifalari kiritilmagan');
    if (!lesson.learningOutcomes.trim()) problems.push('O‘quv natijalari kiritilmagan');
    if (lesson.resources.length === 0) problems.push('Kamida bitta tarixiy manba yoki virtual obyekt tanlang');
    if (lesson.resources.some((r) => !r.purpose.trim())) problems.push('Har bir manbaning darsdagi maqsadini yozing');
    if ((lesson.problemQuestions as unknown[]).length === 0) problems.push('Kamida bitta muammoli savol tuzing');
    if (!lesson.individualTasks.trim()) problems.push('Individual topshiriqlar kiritilmagan');
    if (!lesson.groupTasks.trim()) problems.push('Guruhli topshiriqlar kiritilmagan');
    if ((lesson.interactiveMethods as unknown[]).length === 0) problems.push('Kamida bitta interaktiv metod tanlang');
    if (lesson.stages.length === 0) problems.push('Dars bosqichlarini belgilang');
    const total = lesson.stages.reduce((s, st) => s + st.durationMinutes, 0);
    if (total > lesson.durationMinutes) {
      problems.push(`Bosqichlar davomiyligi (${total} daq.) dars vaqtidan (${lesson.durationMinutes} daq.) oshib ketdi`);
    }
    if (!lesson.assessmentCriteria.trim()) problems.push('Baholash mezonlari kiritilmagan');
    if (!lesson.reflectionQuestions.trim()) problems.push('Refleksiya savollari kiritilmagan');
    if (!lesson.methodicalRationale.trim()) problems.push('Metodik qarorlaringiz asosnomasi kiritilmagan');
    return problems;
  },

  async submit(actor: Express.AuthUser, id: string) {
    const lesson = await getAccessibleLesson(actor, id);
    if (lesson.authorId !== actor.id) throw AppError.forbidden();
    if (!['DRAFT', 'RETURNED'].includes(lesson.status)) throw AppError.badRequest('Ishlanma allaqachon topshirilgan');
    const problems = this.validateForSubmit(lesson);
    if (problems.length) throw AppError.unprocessable('Dars ishlanmasi to‘liq emas', { problems });
    await prisma.$transaction(async (tx) => {
      await tx.lessonPlan.update({ where: { id }, data: { status: 'SUBMITTED', submittedAt: new Date() } });
      if (actor.role === 'STUDENT') {
        await upsertPortfolioItem(
          {
            studentId: actor.id,
            type: 'LESSON_PLAN',
            title: `Dars ishlanmasi: ${lesson.title}`,
            description: `${lesson.gradeLevel}-sinf, ${lesson.durationMinutes} daqiqa. Mavzu: ${lesson.topic}`,
            refType: 'LessonPlan',
            refId: id,
            sourceIds: lesson.resources.flatMap((r) => (r.sourceId ? [r.sourceId] : [])),
            version: lesson.currentVersion,
          },
          tx,
        );
      }
    });
    return getAccessibleLesson(actor, id);
  },

  async review(actor: Express.AuthUser, id: string, input: z.infer<typeof lessonReviewSchema>) {
    const lesson = await getAccessibleLesson(actor, id);
    if (actor.role === 'STUDENT' || lesson.authorId === actor.id) throw AppError.forbidden();
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(lesson.status)) throw AppError.badRequest('Ishlanma topshirilmagan');
    const accepted = input.decision === 'ACCEPT';
    // Mezonlar bo'yicha baholanganda umumiy ball rubrikadan hisoblanadi (qo'lda kiritilgan ball e'tiborga olinmaydi)
    const rubric = accepted && input.rubricId && input.criterionScores?.length
      ? await scoreByRubric(input.rubricId, input.criterionScores, prisma)
      : null;
    const score = rubric ? rubric.percent : input.score;
    await prisma.$transaction(async (tx) => {
      await tx.lessonPlan.update({
        where: { id },
        data: {
          status: accepted ? 'REVIEWED' : 'RETURNED',
          teacherComment: input.comment,
          score: accepted ? score : null,
          rubricId: rubric ? input.rubricId : null,
          criterionScores: rubric ? (rubric.snapshot as Prisma.InputJsonValue) : Prisma.DbNull,
          reviewedById: actor.id,
          reviewedAt: new Date(),
        },
      });
      if (!accepted) return;
      const assessorRole = actor.role === 'ADMIN' ? 'EXPERT' : 'TEACHER';
      const activityId = await componentIdByCode(COMPONENT.ACTIVITY, tx);
      if (activityId && score !== undefined) {
        await recordEvidence(
          {
            studentId: lesson.authorId, componentId: activityId, evidenceKind: 'LESSON_PLAN', assessorRole,
            assessorId: actor.id, score, note: `Dars ishlanmasi ekspertizasi: ${lesson.title}`,
            refType: 'LessonPlan', refId: id,
          },
          tx,
        );
      }
      const reflectiveId = await componentIdByCode(COMPONENT.REFLECTIVE, tx);
      if (reflectiveId && input.reflectiveScore !== undefined) {
        await recordEvidence(
          {
            studentId: lesson.authorId, componentId: reflectiveId, evidenceKind: 'EXPERT', assessorRole,
            assessorId: actor.id, score: input.reflectiveScore,
            note: `Metodik qarorlar asosnomasi: ${lesson.title}`, refType: 'LessonPlan', refId: id,
          },
          tx,
        );
      }
    });
    return getAccessibleLesson(actor, id);
  },

  async remove(actor: Express.AuthUser, id: string) {
    const lesson = await getAccessibleLesson(actor, id);
    if (lesson.authorId !== actor.id) throw AppError.forbidden();
    if (lesson.status !== 'DRAFT') throw AppError.badRequest('Faqat qoralamani o‘chirish mumkin');
    await prisma.lessonPlan.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async getVersion(actor: Express.AuthUser, id: string, version: number) {
    await getAccessibleLesson(actor, id);
    const row = await prisma.lessonPlanVersion.findUnique({ where: { lessonPlanId_version: { lessonPlanId: id, version } } });
    if (!row) throw AppError.notFound('Versiya topilmadi');
    return row;
  },
};

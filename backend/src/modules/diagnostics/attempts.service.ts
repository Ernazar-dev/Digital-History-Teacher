import type { DiagnosticQuestion, EvidenceKind, Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { assertCanAccessStudent } from '../../shared/utils/access';
import { recordEvidence } from '../assessments/competence.service';
import { upsertPortfolioItem } from '../portfolios/portfolio.writer';
import type { answerValue, gradeAttemptSchema } from './diagnostics.schemas';
import type { Option } from './diagnostics.service';

type Answer = z.infer<typeof answerValue>;
const KIND_TO_EVIDENCE: Record<string, EvidenceKind> = { TEST: 'TEST', SURVEY: 'SURVEY', REFLECTION: 'REFLECTION' };
/**
 * Kompleks keysda har bir savol o'z komponentiga mos dalil beradi (hujjat, 5-modul: tarixiy bilim va pedagogik qaror
 * alohida hisobga olinadi): tahlil → manba tahlili, topshiriq tuzish → amaliy topshiriq, qaror asosnomasi → refleksiya.
 */
const CASE_EVIDENCE: Record<string, EvidenceKind> = {
  COGNITIVE: 'SOURCE_ANALYSIS', ACTIVITY: 'PRACTICAL_TASK', REFLECTIVE: 'REFLECTION', MOTIVATIONAL: 'REFLECTION',
};
const evidenceKindFor = (kind: string, componentCode: string): EvidenceKind =>
  kind === 'CASE' ? CASE_EVIDENCE[componentCode] ?? 'PRACTICAL_TASK' : KIND_TO_EVIDENCE[kind];

/** Avtomatik baholash. TEXT savollar o'qituvchi tomonidan baholanadi (score = null). */
export const autoScore = (
  q: Pick<DiagnosticQuestion, 'type' | 'options' | 'correct' | 'points'>,
  answer: Answer | undefined,
): { score: number | null; isCorrect: boolean | null } => {
  const empty = answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0);
  if (q.type === 'TEXT') return { score: empty ? 0 : null, isCorrect: null };
  if (empty) return { score: 0, isCorrect: q.type === 'LIKERT' ? null : false };
  const correct = (q.correct as string[] | null) ?? [];
  switch (q.type) {
    case 'SINGLE_CHOICE': {
      const ok = typeof answer === 'string' && correct.includes(answer);
      return { score: ok ? q.points : 0, isCorrect: ok };
    }
    case 'MULTIPLE_CHOICE': {
      const chosen = new Set(Array.isArray(answer) ? answer : [String(answer)]);
      const ok = chosen.size === correct.length && correct.every((c) => chosen.has(c));
      return { score: ok ? q.points : 0, isCorrect: ok };
    }
    case 'LIKERT': {
      // Variantlar tartibi shkalani bildiradi: birinchi = eng past, oxirgi = eng yuqori
      const options = (q.options as Option[] | null) ?? [];
      const idx = options.findIndex((o) => o.id === String(answer));
      if (idx < 0 || options.length < 2) return { score: 0, isCorrect: null };
      return { score: (idx / (options.length - 1)) * q.points, isCorrect: null };
    }
    default:
      return { score: null, isCorrect: null };
  }
};

const loadAttempt = (id: string) =>
  prisma.diagnosticAttempt.findUnique({
    where: { id },
    include: { diagnostic: { include: { questions: true } }, responses: true },
  });

/**
 * Komponentlar bo'yicha natijani hisoblab kompetensiya dalili sifatida yozadi.
 * Komponentning barcha savollari baholangandagina yoziladi.
 */
const finalize = async (attemptId: string, assessorId: string | null, tx: Prisma.TransactionClient) => {
  const attempt = await tx.diagnosticAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { diagnostic: { include: { questions: { include: { component: { select: { code: true } } } } } }, responses: true },
  });
  const codes = new Map(attempt.diagnostic.questions.map((q) => [q.componentId, q.component.code]));
  const byComponent = new Map<string, { score: number; max: number; pending: boolean; hasText: boolean }>();
  for (const q of attempt.diagnostic.questions) {
    const r = attempt.responses.find((x) => x.questionId === q.id);
    const entry = byComponent.get(q.componentId) ?? { score: 0, max: 0, pending: false, hasText: false };
    entry.max += q.points;
    if (r?.score === null || r?.score === undefined) entry.pending = true;
    else entry.score += r.score;
    if (q.type === 'TEXT') entry.hasText = true;
    byComponent.set(q.componentId, entry);
  }
  let allDone = true;
  for (const [componentId, e] of byComponent) {
    if (e.pending) {
      allDone = false;
      continue;
    }
    await recordEvidence(
      {
        studentId: attempt.studentId,
        componentId,
        stage: attempt.diagnostic.stage,
        evidenceKind: evidenceKindFor(attempt.diagnostic.kind, codes.get(componentId) ?? ''),
        assessorRole: e.hasText ? 'TEACHER' : 'AUTO',
        assessorId: e.hasText ? assessorId : null,
        score: e.max > 0 ? (e.score / e.max) * 100 : 0,
        note: attempt.diagnostic.title,
        refType: 'DiagnosticAttempt',
        refId: attempt.id,
      },
      tx,
    );
  }
  const total = attempt.responses.reduce((s, r) => s + (r.score ?? 0), 0);
  const max = attempt.diagnostic.questions.reduce((s, q) => s + q.points, 0);
  await tx.diagnosticAttempt.update({
    where: { id: attemptId },
    data: { status: allDone ? 'REVIEWED' : 'SUBMITTED', autoScore: total, maxAutoScore: max },
  });
};

export const attemptsService = {
  /** Har bir diagnostika uchun talabaga bitta urinish (oldingi-keyingi taqqoslash izchilligi uchun) */
  async start(actor: Express.AuthUser, diagnosticId: string) {
    const diagnostic = await prisma.diagnostic.findFirst({ where: { id: diagnosticId, deletedAt: null, isActive: true } });
    if (!diagnostic) throw AppError.notFound('Diagnostika topilmadi');
    const existing = await prisma.diagnosticAttempt.findFirst({ where: { diagnosticId, studentId: actor.id } });
    if (existing) return existing;
    return prisma.diagnosticAttempt.create({ data: { diagnosticId, studentId: actor.id } });
  },

  async saveAnswers(actor: Express.AuthUser, attemptId: string, answers: Record<string, Answer>) {
    const attempt = await loadAttempt(attemptId);
    if (!attempt || attempt.studentId !== actor.id) throw AppError.notFound('Urinish topilmadi');
    if (attempt.status !== 'IN_PROGRESS') throw AppError.badRequest('Urinish yakunlangan');
    const limit = attempt.diagnostic.timeLimitMinutes;
    if (limit && Date.now() > attempt.startedAt.getTime() + (limit + 2) * 60_000) {
      throw AppError.badRequest('Ajratilgan vaqt tugadi. Javoblarni topshiring.');
    }
    const questionIds = new Set(attempt.diagnostic.questions.map((q) => q.id));
    const entries = Object.entries(answers).filter(([qid]) => questionIds.has(qid));
    await prisma.$transaction(
      entries.map(([questionId, answer]) =>
        prisma.diagnosticResponse.upsert({
          where: { attemptId_questionId: { attemptId, questionId } },
          create: { attemptId, questionId, answer: answer as Prisma.InputJsonValue },
          update: { answer: answer as Prisma.InputJsonValue },
        }),
      ),
    );
    return { saved: entries.length };
  },

  async submit(actor: Express.AuthUser, attemptId: string) {
    const attempt = await loadAttempt(attemptId);
    if (!attempt || attempt.studentId !== actor.id) throw AppError.notFound('Urinish topilmadi');
    if (attempt.status !== 'IN_PROGRESS') throw AppError.badRequest('Urinish allaqachon topshirilgan');
    await prisma.$transaction(async (tx) => {
      for (const q of attempt.diagnostic.questions) {
        const r = attempt.responses.find((x) => x.questionId === q.id);
        const { score, isCorrect } = autoScore(q, r?.answer as Answer | undefined);
        await tx.diagnosticResponse.upsert({
          where: { attemptId_questionId: { attemptId, questionId: q.id } },
          create: { attemptId, questionId: q.id, answer: (r?.answer ?? '') as Prisma.InputJsonValue, score, isCorrect },
          update: { score, isCorrect },
        });
      }
      await tx.diagnosticAttempt.update({ where: { id: attemptId }, data: { status: 'SUBMITTED', submittedAt: new Date() } });
      await finalize(attemptId, null, tx);
      await upsertPortfolioItem(
        {
          studentId: actor.id,
          type: 'DIAGNOSTIC',
          title: `Diagnostika: ${attempt.diagnostic.title}`,
          description: `Bosqich: ${attempt.diagnostic.stage}`,
          refType: 'DiagnosticAttempt',
          refId: attemptId,
        },
        tx,
      );
    });
    return { id: attemptId };
  },

  async grade(actor: Express.AuthUser, attemptId: string, input: z.infer<typeof gradeAttemptSchema>) {
    const attempt = await loadAttempt(attemptId);
    if (!attempt) throw AppError.notFound('Urinish topilmadi');
    await assertCanAccessStudent(actor, attempt.studentId);
    if (attempt.status === 'IN_PROGRESS') throw AppError.badRequest('Urinish hali topshirilmagan');
    await prisma.$transaction(async (tx) => {
      for (const g of input.grades) {
        const q = attempt.diagnostic.questions.find((x) => x.id === g.questionId);
        if (!q) throw AppError.badRequest('Savol bu diagnostikaga tegishli emas');
        if (q.type !== 'TEXT') throw AppError.badRequest('Faqat matnli javoblar qo‘lda baholanadi');
        if (g.score > q.points) throw AppError.badRequest(`Maksimal ball — ${q.points}`);
        await tx.diagnosticResponse.update({
          where: { attemptId_questionId: { attemptId, questionId: q.id } },
          data: { score: g.score, teacherComment: g.comment },
        });
      }
      await finalize(attemptId, actor.id, tx);
    });
    return { id: attemptId };
  },
};

import type { PortfolioItem } from '@prisma/client';
import { prisma } from '../../config/prisma';

/** Portfolio elementining natijasi: holat, foizdagi ball, oxirgi o'qituvchi izohi va (diagnostika uchun) bosqich */
export interface ItemOutcome {
  status: string | null;
  percent: number | null;
  teacherComment: string | null;
  stage?: string | null;
}

const pct = (score: number | null | undefined, max = 100) =>
  score === null || score === undefined || !max ? null : Math.round((score / max) * 1000) / 10;

/**
 * Hujjat, 7-modul: shaxsiy kabinetda ishlar natijasi va o'qituvchi izohlari bir joyda ko'rinishi uchun
 * har bir turdagi bog'langan ishlar bitta so'rov bilan o'qiladi (N+1 so'rovsiz).
 */
export const resolveOutcomes = async (items: PortfolioItem[]): Promise<Map<string, ItemOutcome>> => {
  const ids = (type: string) => items.filter((i) => i.refType === type).map((i) => i.refId);
  const [analyses, comparisons, lessons, submissions, responses, attempts] = await Promise.all([
    prisma.sourceAnalysis.findMany({ where: { id: { in: ids('SourceAnalysis') } }, select: { id: true, status: true, score: true, teacherComment: true } }),
    prisma.sourceComparison.findMany({ where: { id: { in: ids('SourceComparison') } }, select: { id: true, status: true, score: true, teacherComment: true } }),
    prisma.lessonPlan.findMany({ where: { id: { in: ids('LessonPlan') } }, select: { id: true, status: true, score: true, teacherComment: true } }),
    prisma.assignmentSubmission.findMany({
      where: { id: { in: ids('AssignmentSubmission') } },
      select: {
        id: true, status: true, score: true, assignment: { select: { maxScore: true } },
        feedbacks: { orderBy: { createdAt: 'desc' }, take: 1, select: { comment: true } },
      },
    }),
    prisma.virtualObjectResponse.findMany({ where: { id: { in: ids('VirtualObjectResponse') } }, select: { id: true, status: true, score: true, teacherComment: true } }),
    prisma.diagnosticAttempt.findMany({
      where: { id: { in: ids('DiagnosticAttempt') } },
      select: { id: true, status: true, autoScore: true, maxAutoScore: true, diagnostic: { select: { stage: true } } },
    }),
  ]);

  const byRef = new Map<string, ItemOutcome>();
  for (const r of [...analyses, ...comparisons, ...lessons, ...responses]) {
    byRef.set(r.id, { status: r.status, percent: pct(r.score), teacherComment: r.teacherComment });
  }
  for (const s of submissions) {
    byRef.set(s.id, { status: s.status, percent: pct(s.score, s.assignment.maxScore), teacherComment: s.feedbacks[0]?.comment ?? null });
  }
  for (const a of attempts) {
    byRef.set(a.id, {
      status: a.status,
      percent: a.status === 'REVIEWED' ? pct(a.autoScore, a.maxAutoScore ?? 0) : null,
      teacherComment: null,
      stage: a.diagnostic.stage,
    });
  }
  return new Map(items.map((i) => [i.id, byRef.get(i.refId) ?? { status: null, percent: null, teacherComment: null }]));
};

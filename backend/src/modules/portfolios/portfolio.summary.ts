import type { PortfolioItem } from '@prisma/client';
import { prisma } from '../../config/prisma';

/** Portfolio elementining natijasi: holat, foizdagi ball va oxirgi o'qituvchi izohi */
export interface ItemOutcome {
  status: string | null;
  percent: number | null;
  teacherComment: string | null;
}

const pct = (score: number | null | undefined, max = 100) =>
  score === null || score === undefined || !max ? null : Math.round((score / max) * 1000) / 10;

/**
 * Hujjat, 7-modul: shaxsiy kabinetda ishlar natijasi va o'qituvchi izohlari bir joyda ko'rinishi uchun
 * har bir turdagi bog'langan ishlar bitta so'rov bilan o'qiladi (N+1 so'rovsiz).
 */
export const resolveOutcomes = async (items: PortfolioItem[]): Promise<Map<string, ItemOutcome>> => {
  const ids = (type: string) => items.filter((i) => i.refType === type).map((i) => i.refId);
  const [lessons, responses] = await Promise.all([
    prisma.lessonPlan.findMany({ where: { id: { in: ids('LessonPlan') } }, select: { id: true, status: true, score: true, teacherComment: true } }),
    prisma.virtualObjectResponse.findMany({ where: { id: { in: ids('VirtualObjectResponse') } }, select: { id: true, status: true, score: true, teacherComment: true } }),
  ]);

  const byRef = new Map<string, ItemOutcome>();
  for (const r of [...lessons, ...responses]) {
    byRef.set(r.id, { status: r.status, percent: pct(r.score), teacherComment: r.teacherComment });
  }
  return new Map(items.map((i) => [i.id, byRef.get(i.refId) ?? { status: null, percent: null, teacherComment: null }]));
};

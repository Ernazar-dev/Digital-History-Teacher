import { prisma } from '../../config/prisma';
import { studentScope } from '../../shared/utils/access';

export interface ReviewItem {
  kind: 'SUBMISSION' | 'ANALYSIS' | 'COMPARISON' | 'LESSON' | 'VIRTUAL' | 'DIAGNOSTIC';
  id: string;
  title: string;
  student: { id: string; fullName: string };
  submittedAt: Date | null;
}

/** O'qituvchi tekshirishi kerak bo'lgan barcha ishlar — yagona navbat */
export const reviewQueue = async (actor: Express.AuthUser): Promise<ReviewItem[]> => {
  const scope = await studentScope(actor);
  const student = { select: { id: true, fullName: true } };
  const [subs, analyses, comparisons, lessons, virtual, attempts] = await Promise.all([
    prisma.assignmentSubmission.findMany({
      where: {
        status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
        OR: [{ studentId: scope }, ...(actor.role === 'TEACHER' ? [{ assignment: { createdById: actor.id } }] : [])],
      },
      select: { id: true, submittedAt: true, student, assignment: { select: { title: true } } },
    }),
    prisma.sourceAnalysis.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] }, studentId: scope },
      select: { id: true, submittedAt: true, student, source: { select: { title: true } } },
    }),
    prisma.sourceComparison.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] }, studentId: scope },
      select: { id: true, title: true, submittedAt: true, student },
    }),
    prisma.lessonPlan.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] }, authorId: scope, deletedAt: null, NOT: { authorId: actor.id } },
      select: { id: true, title: true, submittedAt: true, author: { select: { id: true, fullName: true } } },
    }),
    prisma.virtualObjectResponse.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] }, studentId: scope },
      select: { id: true, submittedAt: true, student, virtualObject: { select: { title: true } } },
    }),
    prisma.diagnosticAttempt.findMany({
      where: { status: 'SUBMITTED', studentId: scope },
      select: { id: true, submittedAt: true, student, diagnostic: { select: { title: true } } },
    }),
  ]);
  const items: ReviewItem[] = [
    ...subs.map((s) => ({ kind: 'SUBMISSION' as const, id: s.id, title: s.assignment.title, student: s.student, submittedAt: s.submittedAt })),
    ...analyses.map((a) => ({ kind: 'ANALYSIS' as const, id: a.id, title: `Tahlil: ${a.source.title}`, student: a.student, submittedAt: a.submittedAt })),
    ...comparisons.map((c) => ({ kind: 'COMPARISON' as const, id: c.id, title: `Taqqoslash: ${c.title}`, student: c.student, submittedAt: c.submittedAt })),
    ...lessons.map((l) => ({ kind: 'LESSON' as const, id: l.id, title: `Dars: ${l.title}`, student: l.author, submittedAt: l.submittedAt })),
    ...virtual.map((v) => ({ kind: 'VIRTUAL' as const, id: v.id, title: `Virtual obyekt: ${v.virtualObject.title}`, student: v.student, submittedAt: v.submittedAt })),
    ...attempts.map((a) => ({ kind: 'DIAGNOSTIC' as const, id: a.id, title: `Diagnostika (matnli javoblar): ${a.diagnostic.title}`, student: a.student, submittedAt: a.submittedAt })),
  ];
  return items.sort((a, b) => (a.submittedAt?.getTime() ?? 0) - (b.submittedAt?.getTime() ?? 0));
};

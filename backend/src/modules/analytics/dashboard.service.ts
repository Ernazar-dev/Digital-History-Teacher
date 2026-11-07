import { prisma } from '../../config/prisma';
import { studentScope } from '../../shared/utils/access';

const DAY = 24 * 60 * 60 * 1000;

/** O'qituvchi ko'rib chiqishi kerak bo'lgan ishlar: dars ishlanmalari va virtual obyekt javoblari */
const pendingReviews = async (actor: Express.AuthUser) => {
  const scope = await studentScope(actor);
  const waiting = { in: ['SUBMITTED', 'UNDER_REVIEW'] as ('SUBMITTED' | 'UNDER_REVIEW')[] };
  const [lessons, virtual] = await Promise.all([
    prisma.lessonPlan.findMany({
      where: { status: waiting, authorId: scope, deletedAt: null, NOT: { authorId: actor.id } },
      select: { id: true, title: true, submittedAt: true, author: { select: { id: true, fullName: true } } },
    }),
    prisma.virtualObjectResponse.findMany({
      where: { status: waiting, studentId: scope },
      select: { id: true, submittedAt: true, student: { select: { id: true, fullName: true } }, virtualObject: { select: { title: true, slug: true } } },
    }),
  ]);
  return [
    ...lessons.map((l) => ({ kind: 'LESSON' as const, id: l.id, title: `Dars: ${l.title}`, student: l.author, submittedAt: l.submittedAt, slug: null })),
    ...virtual.map((v) => ({ kind: 'VIRTUAL' as const, id: v.id, title: `Virtual obyekt: ${v.virtualObject.title}`, student: v.student, submittedAt: v.submittedAt, slug: v.virtualObject.slug })),
  ].sort((a, b) => (a.submittedAt?.getTime() ?? 0) - (b.submittedAt?.getTime() ?? 0));
};

/** Barcha ko'rsatkichlar faqat ma'lumotlar bazasidagi real yozuvlardan hisoblanadi */
export const dashboardService = {
  async student(actor: Express.AuthUser) {
    const [tests, portfolio] = await Promise.all([
      prisma.test.findMany({
        where: { deletedAt: null, isPublished: true },
        select: {
          id: true, title: true, questionCount: true, createdAt: true,
          source: { select: { title: true, slug: true } },
          attempts: { where: { studentId: actor.id }, select: { percent: true, correctCount: true, total: true, submittedAt: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.portfolio.findUnique({ where: { studentId: actor.id }, include: { items: { orderBy: { updatedAt: 'desc' }, take: 6 } } }),
    ]);
    const done = tests.filter((t) => t.attempts.length);
    const average = done.length ? Math.round((done.reduce((s, t) => s + t.attempts[0].percent, 0) / done.length) * 10) / 10 : null;
    return {
      pendingTests: tests.filter((t) => !t.attempts.length).slice(0, 8).map(({ attempts: _a, ...t }) => t),
      recentResults: done
        .sort((a, b) => b.attempts[0].submittedAt.getTime() - a.attempts[0].submittedAt.getTime())
        .slice(0, 5)
        .map(({ attempts, ...t }) => ({ ...t, attempt: attempts[0] })),
      testStats: { total: tests.length, done: done.length, averagePercent: average },
      recentActivity: (portfolio?.items ?? []).map((i) => ({ id: i.id, type: i.type, title: i.title, updatedAt: i.updatedAt })),
    };
  },

  async teacher(actor: Express.AuthUser) {
    const groups = await prisma.group.findMany({
      where: { deletedAt: null, ...(actor.role === 'TEACHER' ? { teacherId: actor.id } : {}) },
      include: { _count: { select: { members: true } }, members: { select: { studentId: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const studentIds = [...new Set(groups.flatMap((g) => g.members.map((m) => m.studentId)))];
    const [queue, tests] = await Promise.all([
      pendingReviews(actor),
      prisma.test.findMany({
        where: { deletedAt: null, ...(actor.role === 'TEACHER' ? { createdById: actor.id } : {}) },
        select: { id: true, title: true, isPublished: true, questionCount: true, _count: { select: { attempts: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);
    return {
      groups: groups.map((g) => ({ id: g.id, name: g.name, kind: g.kind, members: g._count.members })),
      totalStudents: studentIds.length,
      pendingReviewCount: queue.length,
      pendingReviews: queue.slice(0, 8),
      tests: tests.map(({ _count, ...t }) => ({ ...t, attemptCount: _count.attempts })),
    };
  },

  async admin() {
    const since = new Date(Date.now() - 30 * DAY);
    const [usersByRole, usersByStatus, topics, books, objects, tests, attempts, lessons, recentAudit, activity] = await Promise.all([
      prisma.user.groupBy({ by: ['role'], where: { deletedAt: null }, _count: true }),
      prisma.user.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
      prisma.historicalSource.count({ where: { deletedAt: null, pages: { none: {} } } }),
      prisma.historicalSource.count({ where: { deletedAt: null, pages: { some: {} } } }),
      prisma.virtualObject.groupBy({ by: ['type'], where: { deletedAt: null }, _count: true }),
      prisma.test.count({ where: { deletedAt: null } }),
      prisma.testAttempt.count(),
      prisma.lessonPlan.count({ where: { deletedAt: null } }),
      prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { actor: { select: { fullName: true } } } }),
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', "submittedAt") AS day, COUNT(*)::bigint AS count
        FROM "TestAttempt" WHERE "submittedAt" >= ${since}
        GROUP BY 1 ORDER BY 1`,
    ]);
    const toMap = <T extends { _count: number }>(rows: T[], key: keyof T) =>
      Object.fromEntries(rows.map((r) => [String(r[key]), r._count]));
    return {
      users: { byRole: toMap(usersByRole, 'role'), byStatus: toMap(usersByStatus, 'status') },
      virtualObjects: toMap(objects, 'type'),
      counts: { topics, books, tests, testAttempts: attempts, lessonPlans: lessons },
      activity: activity.map((a) => ({ day: a.day, count: Number(a.count) })),
      recentAudit,
    };
  },
};

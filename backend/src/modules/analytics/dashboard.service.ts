import { prisma } from '../../config/prisma';
import { computeProfile } from '../assessments/competence.service';
import { studentAssignmentWhere } from '../assignments/assignments.service';
import { reviewQueue } from './review-queue.service';

const DAY = 24 * 60 * 60 * 1000;

/** Barcha ko'rsatkichlar faqat ma'lumotlar bazasidagi real yozuvlardan hisoblanadi */
export const dashboardService = {
  async student(actor: Express.AuthUser) {
    const assignments = await prisma.assignment.findMany({
      where: studentAssignmentWhere(actor.id),
      select: {
        id: true, title: true, type: true, dueDate: true,
        submissions: { where: { studentId: actor.id }, select: { status: true, score: true } },
      },
      orderBy: { dueDate: { sort: 'asc', nulls: 'last' } },
    });
    const withStatus = assignments.map(({ submissions, ...a }) => ({ ...a, status: submissions[0]?.status ?? 'NOT_STARTED', score: submissions[0]?.score ?? null }));
    const active = withStatus.filter((a) => ['NOT_STARTED', 'IN_PROGRESS', 'RETURNED'].includes(a.status));
    const now = Date.now();
    const upcoming = active.filter((a) => a.dueDate && a.dueDate.getTime() >= now && a.dueDate.getTime() <= now + 14 * DAY);

    const [portfolio, profile, recentFeedback] = await Promise.all([
      prisma.portfolio.findUnique({ where: { studentId: actor.id }, include: { items: { orderBy: { updatedAt: 'desc' } } } }),
      computeProfile(actor.id),
      prisma.assignmentFeedback.findMany({
        where: { submission: { studentId: actor.id } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, comment: true, decision: true, createdAt: true, submission: { select: { assignment: { select: { id: true, title: true } } } } },
      }),
    ]);
    const itemCounts: Record<string, number> = {};
    for (const i of portfolio?.items ?? []) itemCounts[i.type] = (itemCounts[i.type] ?? 0) + 1;

    return {
      activeAssignments: active.slice(0, 8),
      upcomingDeadlines: upcoming,
      assignmentStats: {
        total: withStatus.length,
        graded: withStatus.filter((a) => a.status === 'GRADED').length,
        active: active.length,
      },
      recentActivity: (portfolio?.items ?? []).slice(0, 6).map((i) => ({ id: i.id, type: i.type, title: i.title, updatedAt: i.updatedAt })),
      recentFeedback,
      portfolio: { total: portfolio?.items.length ?? 0, byType: itemCounts },
      competence: { overall: profile.overall, level: profile.overallLevel, components: profile.components.map((c) => ({ code: c.code, name: c.name, score: c.score, level: c.level })) },
    };
  },

  async teacher(actor: Express.AuthUser) {
    const groups = await prisma.group.findMany({
      where: { deletedAt: null, ...(actor.role === 'TEACHER' ? { teacherId: actor.id } : {}) },
      include: { _count: { select: { members: true } }, members: { select: { studentId: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const studentIds = [...new Set(groups.flatMap((g) => g.members.map((m) => m.studentId)))];
    const queue = await reviewQueue(actor);
    const assignments = await prisma.assignment.findMany({
      where: { deletedAt: null, ...(actor.role === 'TEACHER' ? { createdById: actor.id } : {}) },
      select: { id: true, title: true, status: true, dueDate: true, submissions: { select: { status: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    const groupStats = await Promise.all(
      groups.map(async (g) => {
        const profiles = await Promise.all(g.members.map((m) => computeProfile(m.studentId)));
        const scored = profiles.map((p) => p.overall).filter((x): x is number => x !== null);
        return {
          id: g.id, name: g.name, kind: g.kind, members: g._count.members,
          averageOverall: scored.length ? Math.round((scored.reduce((a, b) => a + b, 0) / scored.length) * 10) / 10 : null,
          assessedStudents: scored.length,
        };
      }),
    );
    return {
      groups: groupStats,
      totalStudents: studentIds.length,
      pendingReviewCount: queue.length,
      pendingReviews: queue.slice(0, 8),
      assignments: assignments.map(({ submissions, ...a }) => {
        const counts: Record<string, number> = {};
        for (const s of submissions) counts[s.status] = (counts[s.status] ?? 0) + 1;
        return { ...a, counts, total: submissions.length };
      }),
    };
  },

  async admin() {
    const since = new Date(Date.now() - 30 * DAY);
    const [usersByRole, usersByStatus, sourcesByStatus, objects, assignments, submissions, attempts, lessons, analyses, recentAudit, activity] =
      await Promise.all([
        prisma.user.groupBy({ by: ['role'], where: { deletedAt: null }, _count: true }),
        prisma.user.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
        prisma.historicalSource.groupBy({ by: ['status'], where: { deletedAt: null }, _count: true }),
        prisma.virtualObject.groupBy({ by: ['type'], where: { deletedAt: null }, _count: true }),
        prisma.assignment.count({ where: { deletedAt: null } }),
        prisma.assignmentSubmission.count({ where: { status: { notIn: ['NOT_STARTED', 'IN_PROGRESS'] } } }),
        prisma.diagnosticAttempt.count({ where: { status: { not: 'IN_PROGRESS' } } }),
        prisma.lessonPlan.count({ where: { deletedAt: null } }),
        prisma.sourceAnalysis.count(),
        prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { actor: { select: { fullName: true } } } }),
        prisma.$queryRaw<{ day: Date; count: bigint }[]>`
          SELECT date_trunc('day', "updatedAt") AS day, COUNT(*)::bigint AS count
          FROM "PortfolioItem" WHERE "updatedAt" >= ${since}
          GROUP BY 1 ORDER BY 1`,
      ]);
    const toMap = <T extends { _count: number }>(rows: T[], key: keyof T) =>
      Object.fromEntries(rows.map((r) => [String(r[key]), r._count]));
    return {
      users: { byRole: toMap(usersByRole, 'role'), byStatus: toMap(usersByStatus, 'status') },
      sources: toMap(sourcesByStatus, 'status'),
      virtualObjects: toMap(objects, 'type'),
      counts: { assignments, submissions, diagnosticAttempts: attempts, lessonPlans: lessons, sourceAnalyses: analyses },
      activity: activity.map((a) => ({ day: a.day, count: Number(a.count) })),
      recentAudit,
    };
  },
};

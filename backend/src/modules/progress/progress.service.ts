import { prisma } from '../../config/prisma';
import { assertCanAccessStudent } from '../../shared/utils/access';

/**
 * Talabaning o'quv yo'li: kutubxonadagi mavzular tartibida — har bir mavzu bo'yicha testlar va natijalar.
 * Hammasi mavjud ma'lumotlardan hisoblanadi (alohida jadval yo'q).
 */
export const progressService = {
  async get(actor: Express.AuthUser, studentId: string) {
    await assertCanAccessStudent(actor, studentId);
    const [topics, attempts, otherTests, groups] = await Promise.all([
      prisma.historicalSource.findMany({
        // Tarixiy kitoblar (sahifa matni bor) faqat testi bo'lsa o'quv yo'lida chiqadi — aks holda bo'sh qator bo'lardi
        where: {
          deletedAt: null,
          status: 'PUBLISHED',
          OR: [{ pages: { none: {} } }, { tests: { some: { deletedAt: null, isPublished: true } } }],
        },
        select: {
          id: true, title: true, slug: true, bookLabel: true,
          tests: { where: { deletedAt: null, isPublished: true }, select: { id: true, title: true, questionCount: true }, orderBy: { createdAt: 'asc' } },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      }),
      prisma.testAttempt.findMany({
        where: { studentId, test: { deletedAt: null } },
        select: { testId: true, correctCount: true, total: true, percent: true, submittedAt: true },
      }),
      prisma.test.findMany({
        where: { deletedAt: null, isPublished: true, sourceId: null },
        select: { id: true, title: true, questionCount: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.groupMembership.findMany({
        where: { studentId, group: { deletedAt: null } },
        select: { group: { select: { id: true, name: true } } },
      }),
    ]);
    const byTest = new Map(attempts.map((a) => [a.testId, a]));
    const withAttempt = <T extends { id: string }>(t: T) => ({ ...t, attempt: byTest.get(t.id) ?? null });

    const allTests = [...topics.flatMap((t) => t.tests), ...otherTests];
    const done = allTests.filter((t) => byTest.has(t.id));
    const average = done.length
      ? Math.round((done.reduce((s, t) => s + byTest.get(t.id)!.percent, 0) / done.length) * 10) / 10
      : null;

    return {
      summary: { testsTotal: allTests.length, testsDone: done.length, averagePercent: average },
      topics: topics.map((t) => ({ ...t, tests: t.tests.map(withAttempt) })),
      otherTests: otherTests.map(withAttempt),
      groups: groups.map((g) => g.group),
    };
  },
};

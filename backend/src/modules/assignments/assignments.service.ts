import { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { buildMeta } from '../../shared/utils/http';
import type { assignmentBodySchema, listAssignmentsQuery, rubricSchema, updateAssignmentSchema } from './assignments.schemas';
import { assertSimulatorType, publicSimulator, type Simulator } from './simulator';

const detailInclude = {
  createdBy: { select: { id: true, fullName: true } },
  rubric: { include: { criteria: { orderBy: { sortOrder: 'asc' }, include: { component: { select: { id: true, code: true, name: true } } } } } },
  groups: { select: { group: { select: { id: true, name: true, kind: true } } } },
  sources: { select: { source: { select: { id: true, title: true, slug: true, type: true, dateLabel: true } } } },
  virtualObjects: { select: { virtualObject: { select: { id: true, title: true, slug: true, type: true, thumbnailUrl: true } } } },
  _count: { select: { submissions: true } },
} satisfies Prisma.AssignmentInclude;

type Detail = Prisma.AssignmentGetPayload<{ include: typeof detailInclude }>;

/** Talabaga simulyatorning to'g'ri javoblari (yillar, koordinatalar) ko'rsatilmaydi */
const forActor = <T extends { simulator: Prisma.JsonValue | null }>(a: T, actor: Express.AuthUser) =>
  actor.role === 'STUDENT' && a.simulator ? { ...a, simulator: publicSimulator(a.simulator) } : a;
const simulatorJson = (s: Simulator | null | undefined) =>
  s === undefined ? undefined : s === null ? Prisma.DbNull : (s as Prisma.InputJsonValue);
const flatten = (a: Detail) => ({
  ...a,
  groups: a.groups.map((g) => g.group),
  sources: a.sources.map((s) => s.source),
  virtualObjects: a.virtualObjects.map((v) => v.virtualObject),
});

/** Talabaga ko'rinadigan topshiriqlar: nashr etilgan va (guruhsiz yoki talaba guruhiga biriktirilgan) */
export const studentAssignmentWhere = (studentId: string): Prisma.AssignmentWhereInput => ({
  deletedAt: null,
  status: 'PUBLISHED',
  OR: [{ groups: { none: {} } }, { groups: { some: { group: { deletedAt: null, members: { some: { studentId } } } } } }],
});

const staffWhere = (actor: Express.AuthUser): Prisma.AssignmentWhereInput =>
  actor.role === 'ADMIN'
    ? { deletedAt: null }
    : { deletedAt: null, OR: [{ createdById: actor.id }, { groups: { some: { group: { teacherId: actor.id } } } }] };

export const getVisibleAssignment = async (actor: Express.AuthUser, id: string) => {
  const where = actor.role === 'STUDENT' ? studentAssignmentWhere(actor.id) : staffWhere(actor);
  const assignment = await prisma.assignment.findFirst({ where: { AND: [where, { id }] }, include: detailInclude });
  if (!assignment) throw AppError.notFound('Topshiriq topilmadi');
  return assignment;
};

const assertEditable = async (actor: Express.AuthUser, id: string) => {
  const a = await prisma.assignment.findFirst({ where: { id, deletedAt: null } });
  if (!a) throw AppError.notFound('Topshiriq topilmadi');
  if (actor.role !== 'ADMIN' && a.createdById !== actor.id) throw AppError.forbidden('Faqat muallif tahrirlay oladi');
  return a;
};

const assertGroups = async (actor: Express.AuthUser, groupIds: string[]) => {
  if (!groupIds.length) return;
  const where: Prisma.GroupWhereInput = { id: { in: groupIds }, deletedAt: null };
  if (actor.role === 'TEACHER') where.teacherId = actor.id;
  if ((await prisma.group.count({ where })) !== new Set(groupIds).size) {
    throw AppError.badRequest('Faqat o‘zingizning guruhlaringizga topshiriq biriktira olasiz');
  }
};

export const assignmentsService = {
  async list(actor: Express.AuthUser, q: z.infer<typeof listAssignmentsQuery>) {
    const base = actor.role === 'STUDENT' ? studentAssignmentWhere(actor.id) : staffWhere(actor);
    const filters: Prisma.AssignmentWhereInput[] = [base];
    if (q.status && actor.role !== 'STUDENT') filters.push({ status: q.status });
    if (q.type) filters.push({ type: q.type });
    if (q.q) filters.push({ title: { contains: q.q, mode: 'insensitive' } });
    const where = { AND: filters };
    const [total, rows] = await prisma.$transaction([
      prisma.assignment.count({ where }),
      prisma.assignment.findMany({
        where,
        include: {
          ...detailInclude,
          submissions: actor.role === 'STUDENT'
            ? { where: { studentId: actor.id }, select: { id: true, status: true, score: true, version: true, updatedAt: true } }
            : { select: { id: true, status: true } },
        },
        orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    const items = rows.map((r) => {
      const { submissions, ...rest } = r;
      const base = forActor(flatten(rest as Detail), actor);
      if (actor.role === 'STUDENT') {
        const mine = submissions[0];
        return { ...base, mySubmission: mine ?? null, myStatus: mine?.status ?? 'NOT_STARTED' };
      }
      const counts: Record<string, number> = {};
      for (const s of submissions) counts[s.status] = (counts[s.status] ?? 0) + 1;
      return { ...base, submissionCounts: counts };
    });
    return { items, meta: buildMeta(q.page, q.pageSize, total) };
  },

  async get(actor: Express.AuthUser, id: string) {
    const assignment = forActor(flatten(await getVisibleAssignment(actor, id)), actor);
    if (actor.role !== 'STUDENT') return assignment;
    const mySubmission = await prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId: id, studentId: actor.id } },
      include: {
        feedbacks: { orderBy: { createdAt: 'desc' }, include: { author: { select: { id: true, fullName: true } }, scores: true } },
        revisions: { orderBy: { version: 'desc' } },
        lessonPlan: { select: { id: true, title: true, status: true } },
      },
    });
    // Avtomatik tekshiruv natijasi talabaga o'qituvchi ko'rib chiqqandan keyin ko'rsatiladi
    const reviewed = mySubmission && ['GRADED', 'RETURNED'].includes(mySubmission.status);
    return { ...assignment, mySubmission: mySubmission && !reviewed ? { ...mySubmission, autoScore: null, autoDetails: null } : mySubmission };
  },

  async create(actor: Express.AuthUser, input: z.infer<typeof assignmentBodySchema>) {
    await assertGroups(actor, input.groupIds);
    assertSimulatorType(input.type, input.simulator);
    const { groupIds, sourceIds, virtualObjectIds, simulator, ...data } = input;
    const assignment = await prisma.assignment.create({
      data: {
        ...data,
        simulator: simulatorJson(simulator),
        createdById: actor.id,
        groups: { create: groupIds.map((groupId) => ({ groupId })) },
        sources: { create: sourceIds.map((sourceId) => ({ sourceId })) },
        virtualObjects: { create: virtualObjectIds.map((virtualObjectId) => ({ virtualObjectId })) },
      },
    });
    return this.get(actor, assignment.id);
  },

  async update(actor: Express.AuthUser, id: string, input: z.infer<typeof updateAssignmentSchema>) {
    const existing = await assertEditable(actor, id);
    assertSimulatorType(input.type ?? existing.type, input.simulator !== undefined ? input.simulator : (existing.simulator as Simulator | null));
    const { groupIds, sourceIds, virtualObjectIds, simulator, ...data } = input;
    if (groupIds) await assertGroups(actor, groupIds);
    await prisma.$transaction(async (tx) => {
      await tx.assignment.update({ where: { id }, data: { ...data, simulator: simulatorJson(simulator) } });
      if (groupIds) {
        await tx.assignmentGroup.deleteMany({ where: { assignmentId: id } });
        await tx.assignmentGroup.createMany({ data: groupIds.map((groupId) => ({ assignmentId: id, groupId })) });
      }
      if (sourceIds) {
        await tx.assignmentSource.deleteMany({ where: { assignmentId: id } });
        await tx.assignmentSource.createMany({ data: sourceIds.map((sourceId) => ({ assignmentId: id, sourceId })) });
      }
      if (virtualObjectIds) {
        await tx.assignmentVirtualObject.deleteMany({ where: { assignmentId: id } });
        await tx.assignmentVirtualObject.createMany({
          data: virtualObjectIds.map((virtualObjectId) => ({ assignmentId: id, virtualObjectId })),
        });
      }
    });
    return this.get(actor, id);
  },

  async remove(actor: Express.AuthUser, id: string) {
    await assertEditable(actor, id);
    await prisma.assignment.update({ where: { id }, data: { deletedAt: new Date(), status: 'ARCHIVED' } });
  },

  // ───── Rubrikalar ─────
  listRubrics() {
    return prisma.rubric.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        criteria: { orderBy: { sortOrder: 'asc' }, include: { component: { select: { id: true, code: true, name: true } } } },
        _count: { select: { assignments: true } },
      },
    });
  },

  createRubric(actor: Express.AuthUser, input: z.infer<typeof rubricSchema>) {
    return prisma.rubric.create({
      data: {
        title: input.title,
        description: input.description,
        createdById: actor.id,
        criteria: { create: input.criteria.map((c, i) => ({ ...c, sortOrder: i })) },
      },
      include: { criteria: { orderBy: { sortOrder: 'asc' } } },
    });
  },

  async updateRubric(actor: Express.AuthUser, id: string, input: z.infer<typeof rubricSchema>) {
    const rubric = await prisma.rubric.findUnique({ where: { id }, include: { _count: { select: { assignments: true } } } });
    if (!rubric) throw AppError.notFound('Rubrika topilmadi');
    if (actor.role !== 'ADMIN' && rubric.createdById !== actor.id) throw AppError.forbidden();
    const graded = await prisma.criterionScore.count({ where: { criterion: { rubricId: id } } });
    if (graded > 0) {
      // Baholash tarixini buzmaslik uchun ishlatilgan rubrika mezonlari o'zgartirilmaydi
      throw AppError.conflict('Bu rubrika bo‘yicha baholar mavjud. Yangi rubrika yarating.');
    }
    return prisma.$transaction(async (tx) => {
      await tx.rubricCriterion.deleteMany({ where: { rubricId: id } });
      return tx.rubric.update({
        where: { id },
        data: {
          title: input.title,
          description: input.description,
          criteria: { create: input.criteria.map((c, i) => ({ ...c, sortOrder: i })) },
        },
        include: { criteria: { orderBy: { sortOrder: 'asc' } } },
      });
    });
  },

  async deleteRubric(actor: Express.AuthUser, id: string) {
    const rubric = await prisma.rubric.findUnique({ where: { id } });
    if (!rubric) throw AppError.notFound('Rubrika topilmadi');
    if (actor.role !== 'ADMIN' && rubric.createdById !== actor.id) throw AppError.forbidden();
    const graded = await prisma.criterionScore.count({ where: { criterion: { rubricId: id } } });
    if (graded > 0) throw AppError.conflict('Bu rubrika bo‘yicha baholar mavjud — o‘chirib bo‘lmaydi');
    await prisma.rubric.delete({ where: { id } });
  },
};

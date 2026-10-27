import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { assertCanAccessStudent, studentScope } from '../../shared/utils/access';
import { buildMeta } from '../../shared/utils/http';
import { COMPONENT, componentIdByCode, recordEvidence } from '../assessments/competence.service';
import { upsertPortfolioItem } from '../portfolios/portfolio.writer';
import type { createComparisonSchema, listWorkQuery, reviewSchema, updateComparisonSchema } from './analysis.schemas';

/** Topshirishda majburiy maydonlar — hujjat, 2-modul misoli: taqqoslash, dalillar, xulosa va darsda qo'llash savoli */
const REQUIRED_FIELDS = [
  { key: 'similarities', label: 'O‘xshash jihatlar' },
  { key: 'differences', label: 'Farqli jihatlar' },
  { key: 'evidence', label: 'Dalillar' },
  { key: 'conclusion', label: 'Xulosa' },
  { key: 'teachingUse', label: 'Manbalarni maktab darsida qo‘llash va o‘quvchilar uchun topshiriqlar' },
] as const;

const include = {
  student: { select: { id: true, fullName: true } },
  reviewedBy: { select: { id: true, fullName: true } },
  items: {
    orderBy: { sortOrder: 'asc' },
    include: {
      source: {
        select: {
          id: true, title: true, slug: true, type: true, dateLabel: true, author: true, summary: true,
          origin: true, reliabilityNotes: true, limitations: true, mediaUrl: true,
        },
      },
    },
  },
} satisfies Prisma.SourceComparisonInclude;

const getOwned = async (actor: Express.AuthUser, id: string) => {
  const item = await prisma.sourceComparison.findUnique({ where: { id }, include });
  if (!item) throw AppError.notFound('Taqqoslash topilmadi');
  await assertCanAccessStudent(actor, item.studentId);
  return item;
};

const assertSources = async (ids: string[]) => {
  const count = await prisma.historicalSource.count({ where: { id: { in: ids }, deletedAt: null, status: 'PUBLISHED' } });
  if (count !== new Set(ids).size) throw AppError.badRequest('Tanlangan manbalardan ba’zilari mavjud emas');
};

export const comparisonService = {
  async list(actor: Express.AuthUser, q: z.infer<typeof listWorkQuery>) {
    const where: Prisma.SourceComparisonWhereInput = { studentId: await studentScope(actor) };
    if (q.studentId) where.AND = [{ studentId: q.studentId }];
    if (q.status) where.status = q.status;
    const [total, items] = await prisma.$transaction([
      prisma.sourceComparison.count({ where }),
      prisma.sourceComparison.findMany({ where, include, orderBy: { updatedAt: 'desc' }, skip: (q.page - 1) * q.pageSize, take: q.pageSize }),
    ]);
    return { items, meta: buildMeta(q.page, q.pageSize, total) };
  },

  get: getOwned,

  async create(actor: Express.AuthUser, input: z.infer<typeof createComparisonSchema>) {
    await assertSources(input.sourceIds);
    const { sourceIds, notes, ...data } = input;
    return prisma.sourceComparison.create({
      data: {
        ...data,
        studentId: actor.id,
        items: { create: sourceIds.map((sourceId, i) => ({ sourceId, sortOrder: i, notes: notes[sourceId] ?? null })) },
      },
      include,
    });
  },

  async update(actor: Express.AuthUser, id: string, input: z.infer<typeof updateComparisonSchema>) {
    const existing = await getOwned(actor, id);
    if (existing.studentId !== actor.id) throw AppError.forbidden();
    if (!['DRAFT', 'RETURNED'].includes(existing.status)) throw AppError.badRequest('Topshirilgan ishni tahrirlab bo‘lmaydi');
    const { sourceIds, notes, ...data } = input;
    if (sourceIds) await assertSources(sourceIds);
    await prisma.$transaction(async (tx) => {
      await tx.sourceComparison.update({ where: { id }, data });
      const ids = sourceIds ?? existing.items.map((i) => i.sourceId);
      if (sourceIds || notes) {
        await tx.sourceComparisonItem.deleteMany({ where: { comparisonId: id } });
        await tx.sourceComparisonItem.createMany({
          data: ids.map((sourceId, i) => ({
            comparisonId: id,
            sourceId,
            sortOrder: i,
            notes: notes?.[sourceId] ?? existing.items.find((x) => x.sourceId === sourceId)?.notes ?? null,
          })),
        });
      }
    });
    return getOwned(actor, id);
  },

  async submit(actor: Express.AuthUser, id: string) {
    const existing = await getOwned(actor, id);
    if (existing.studentId !== actor.id) throw AppError.forbidden();
    if (!['DRAFT', 'RETURNED'].includes(existing.status)) throw AppError.badRequest('Ish allaqachon topshirilgan');
    const missing = REQUIRED_FIELDS.filter((f) => !existing[f.key].trim()).map((f) => f.label);
    if (missing.length) throw AppError.unprocessable('Majburiy maydonlarni to‘ldiring', { missing });
    return prisma.$transaction(async (tx) => {
      const updated = await tx.sourceComparison.update({
        where: { id }, data: { status: 'SUBMITTED', submittedAt: new Date() }, include,
      });
      await upsertPortfolioItem(
        {
          studentId: actor.id,
          type: 'SOURCE_COMPARISON',
          title: `Manbalarni taqqoslash: ${existing.title}`,
          refType: 'SourceComparison',
          refId: id,
          sourceIds: existing.items.map((i) => i.sourceId),
        },
        tx,
      );
      return updated;
    });
  },

  async review(actor: Express.AuthUser, id: string, input: z.infer<typeof reviewSchema>) {
    const existing = await getOwned(actor, id);
    if (actor.role === 'STUDENT') throw AppError.forbidden();
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(existing.status)) throw AppError.badRequest('Ish topshirilmagan');
    return prisma.$transaction(async (tx) => {
      const updated = await tx.sourceComparison.update({
        where: { id },
        data: {
          status: input.decision === 'ACCEPT' ? 'REVIEWED' : 'RETURNED',
          teacherComment: input.comment,
          score: input.decision === 'ACCEPT' ? input.score : null,
          reviewedById: actor.id,
          reviewedAt: new Date(),
        },
        include,
      });
      const componentId = await componentIdByCode(COMPONENT.COGNITIVE, tx);
      if (input.decision === 'ACCEPT' && input.score !== undefined && componentId) {
        await recordEvidence(
          {
            studentId: existing.studentId, componentId, evidenceKind: 'SOURCE_ANALYSIS',
            assessorRole: actor.role === 'ADMIN' ? 'EXPERT' : 'TEACHER', assessorId: actor.id,
            score: input.score, note: `Manbalarni taqqoslash: ${existing.title}`,
            refType: 'SourceComparison', refId: id,
          },
          tx,
        );
      }
      return updated;
    });
  },

  async remove(actor: Express.AuthUser, id: string) {
    const existing = await getOwned(actor, id);
    if (existing.studentId !== actor.id || existing.status !== 'DRAFT') {
      throw AppError.badRequest('Faqat o‘zingizning qoralamangizni o‘chirishingiz mumkin');
    }
    await prisma.sourceComparison.delete({ where: { id } });
  },
};

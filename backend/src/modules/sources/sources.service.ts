import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { buildMeta } from '../../shared/utils/http';
import { uniqueSlug } from '../../shared/utils/slug';
import type { listSourcesQuery, sourceBodySchema, updateSourceSchema } from './sources.schemas';

type Actor = Express.AuthUser | undefined;
const isStaff = (u: Actor) => u?.role === 'ADMIN' || u?.role === 'TEACHER';

/** Talaba va mehmonlar faqat nashr etilgan manbalarni ko'radi */
export const visibleSourceWhere = (actor: Actor): Prisma.HistoricalSourceWhereInput =>
  isStaff(actor) ? { deletedAt: null } : { deletedAt: null, status: 'PUBLISHED' };

const listSelect = {
  id: true, title: true, slug: true, summary: true, type: true, format: true, dateLabel: true,
  yearFrom: true, yearTo: true, author: true, status: true, isDemo: true, mediaUrl: true,
  mediaFileId: true, mediaFile: { select: { id: true, mimeType: true } }, createdAt: true, updatedAt: true, latitude: true, longitude: true,
  period: { select: { id: true, name: true } },
  topics: { select: { topic: { select: { id: true, name: true } } } },
} satisfies Prisma.HistoricalSourceSelect;

const ORDER: Record<string, Prisma.HistoricalSourceOrderByWithRelationInput[]> = {
  newest: [{ createdAt: 'desc' }],
  oldest: [{ createdAt: 'asc' }],
  title: [{ title: 'asc' }],
  year: [{ yearFrom: { sort: 'asc', nulls: 'last' } }, { title: 'asc' }],
};

const flattenTopics = <T extends { topics: { topic: { id: string; name: string } }[] }>(s: T) => ({
  ...s,
  topics: s.topics.map((t) => t.topic),
});

const assertCanEdit = async (actor: Express.AuthUser, id: string) => {
  const source = await prisma.historicalSource.findFirst({ where: { id, deletedAt: null } });
  if (!source) throw AppError.notFound('Manba topilmadi');
  if (actor.role === 'TEACHER' && source.createdById !== actor.id) {
    throw AppError.forbidden('O‘qituvchi faqat o‘zi qo‘shgan manbani tahrirlay oladi');
  }
  return source;
};

/** Biriktirilayotgan fayllar mavjudligini tekshiradi (FK xatosi o'rniga tushunarli javob) */
const assertMediaExists = async (ids: string[]) => {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return;
  const found = await prisma.mediaFile.count({ where: { id: { in: unique } } });
  if (found !== unique.length) throw AppError.badRequest('Biriktirilgan fayllardan biri topilmadi');
};

export const sourcesService = {
  async list(actor: Actor, q: z.infer<typeof listSourcesQuery>) {
    const where: Prisma.HistoricalSourceWhereInput = { ...visibleSourceWhere(actor) };
    if (q.type) where.type = q.type;
    if (q.periodId) where.periodId = q.periodId;
    if (q.topicId) where.topics = { some: { topicId: q.topicId } };
    if (q.format) where.format = { equals: q.format, mode: 'insensitive' };
    if (q.status && isStaff(actor)) where.status = q.status;
    if (q.q) {
      where.OR = [
        { title: { contains: q.q, mode: 'insensitive' } },
        { summary: { contains: q.q, mode: 'insensitive' } },
        { author: { contains: q.q, mode: 'insensitive' } },
        { description: { contains: q.q, mode: 'insensitive' } },
      ];
    }
    const [total, rows] = await prisma.$transaction([
      prisma.historicalSource.count({ where }),
      prisma.historicalSource.findMany({
        where,
        select: listSelect,
        orderBy: ORDER[q.sort],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return { items: rows.map(flattenTopics), meta: buildMeta(q.page, q.pageSize, total) };
  },

  async get(actor: Actor, idOrSlug: string) {
    const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);
    const source = await prisma.historicalSource.findFirst({
      where: { ...visibleSourceWhere(actor), ...(isUuid ? { id: idOrSlug } : { slug: idOrSlug }) },
      include: {
        period: true,
        topics: { select: { topic: { select: { id: true, name: true } } } },
        variants: { orderBy: [{ kind: 'asc' }, { createdAt: 'asc' }] },
        createdBy: { select: { id: true, fullName: true } },
        mediaFile: { select: { id: true, originalName: true, mimeType: true, size: true } },
        files: {
          orderBy: { sortOrder: 'asc' },
          select: { mediaFile: { select: { id: true, originalName: true, mimeType: true, size: true } } },
        },
        virtualObjects: {
          where: { virtualObject: { deletedAt: null, isActive: true } },
          select: { virtualObject: { select: { id: true, title: true, slug: true, type: true, thumbnailUrl: true } } },
        },
        assignments: {
          where: { assignment: { deletedAt: null, status: 'PUBLISHED' } },
          select: { assignment: { select: { id: true, title: true, type: true } } },
        },
      },
    });
    if (!source) throw AppError.notFound('Manba topilmadi');
    return {
      ...flattenTopics(source),
      virtualObjects: source.virtualObjects.map((v) => v.virtualObject),
      assignments: source.assignments.map((a) => a.assignment),
      files: source.files.map((f) => f.mediaFile),
    };
  },

  async create(actor: Express.AuthUser, input: z.infer<typeof sourceBodySchema>) {
    const { topicIds, variants, fileIds = [], ...data } = input;
    await assertMediaExists([...fileIds, ...(data.mediaFileId ? [data.mediaFileId] : [])]);
    const slug = await uniqueSlug(input.title, async (s) =>
      Boolean(await prisma.historicalSource.findUnique({ where: { slug: s } })),
    );
    const source = await prisma.historicalSource.create({
      data: {
        ...data,
        slug,
        createdById: actor.id,
        topics: { create: topicIds.map((topicId) => ({ topicId })) },
        variants: { create: variants },
        files: { create: fileIds.map((mediaFileId, sortOrder) => ({ mediaFileId, sortOrder })) },
      },
    });
    return this.get(actor, source.id);
  },

  async update(actor: Express.AuthUser, id: string, input: z.infer<typeof updateSourceSchema>) {
    await assertCanEdit(actor, id);
    const { topicIds, variants, fileIds, ...data } = input;
    await assertMediaExists([...(fileIds ?? []), ...(data.mediaFileId ? [data.mediaFileId] : [])]);
    if (data.yearFrom != null && data.yearTo != null && data.yearFrom > data.yearTo) {
      throw AppError.badRequest('Boshlanish yili tugash yilidan katta bo‘lmasligi kerak');
    }
    await prisma.$transaction(async (tx) => {
      await tx.historicalSource.update({ where: { id }, data });
      if (topicIds) {
        await tx.sourceTopic.deleteMany({ where: { sourceId: id } });
        await tx.sourceTopic.createMany({ data: topicIds.map((topicId) => ({ sourceId: id, topicId })) });
      }
      if (fileIds) {
        await tx.sourceFile.deleteMany({ where: { sourceId: id } });
        await tx.sourceFile.createMany({ data: fileIds.map((mediaFileId, sortOrder) => ({ sourceId: id, mediaFileId, sortOrder })) });
      }
      if (variants) {
        await tx.sourceVariant.deleteMany({ where: { sourceId: id } });
        await tx.sourceVariant.createMany({ data: variants.map((v) => ({ ...v, sourceId: id })) });
      }
    });
    return this.get(actor, id);
  },

  async remove(actor: Express.AuthUser, id: string) {
    await assertCanEdit(actor, id);
    // Soft delete — talabalar tahlillari va dars ishlanmalaridagi bog'lanishlar buzilmaydi
    await prisma.historicalSource.update({ where: { id }, data: { deletedAt: new Date() } });
  },
};

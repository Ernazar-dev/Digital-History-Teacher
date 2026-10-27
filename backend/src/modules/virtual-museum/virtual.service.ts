import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { isAllowedEmbedUrl, sketchfabEmbedFromUrl } from '../../shared/utils/embed';
import { buildMeta } from '../../shared/utils/http';
import { uniqueSlug } from '../../shared/utils/slug';
import type { listObjectsQuery, objectBodySchema, updateObjectSchema } from './virtual.schemas';

type Actor = Express.AuthUser | undefined;
const isStaff = (u: Actor) => u?.role === 'ADMIN' || u?.role === 'TEACHER';

export const visibleObjectWhere = (actor: Actor): Prisma.VirtualObjectWhereInput =>
  isStaff(actor) ? { deletedAt: null } : { deletedAt: null, status: 'PUBLISHED', isActive: true };

/**
 * Provayderga mos embed manzilini tekshiradi.
 * Sketchfab: faqat rasmiy /models/<32 belgili ID>/embed formati (ID taxmin qilinmaydi —
 * model sahifasi URL'idan olinadi). Uzbekistan360: faqat uzbekistan360.uz domeni.
 */
export const resolveEmbed = (provider: string, externalUrl: string, embedUrl: string | null | undefined) => {
  let embed = embedUrl ?? null;
  if (provider === 'SKETCHFAB') {
    embed = embed ? sketchfabEmbedFromUrl(embed) : sketchfabEmbedFromUrl(externalUrl);
    if (embedUrl && !embed) throw AppError.badRequest('Sketchfab embed manzili noto‘g‘ri formatda');
  }
  if (provider === 'UZBEKISTAN360' && embed && !new URL(embed).hostname.endsWith('uzbekistan360.uz')) {
    throw AppError.badRequest('Uzbekistan360 uchun faqat uzbekistan360.uz manzili qabul qilinadi');
  }
  if (embed && !isAllowedEmbedUrl(embed)) throw AppError.badRequest('Embed domeni ruxsat etilmagan');
  return embed;
};

const listSelect = {
  id: true, title: true, slug: true, type: true, provider: true, periodLabel: true, location: true,
  latitude: true, longitude: true, description: true, thumbnailUrl: true, isDemo: true, isActive: true,
  status: true, license: true, authorOrOrganization: true, updatedAt: true,
  period: { select: { id: true, name: true } },
  _count: { select: { tasks: true } },
} satisfies Prisma.VirtualObjectSelect;

export const virtualService = {
  async list(actor: Actor, q: z.infer<typeof listObjectsQuery>) {
    const where: Prisma.VirtualObjectWhereInput = { ...visibleObjectWhere(actor) };
    if (q.type) where.type = q.type;
    if (q.provider) where.provider = q.provider;
    if (q.periodId) where.periodId = q.periodId;
    if (q.status && isStaff(actor)) where.status = q.status;
    if (q.q) {
      where.OR = [
        { title: { contains: q.q, mode: 'insensitive' } },
        { description: { contains: q.q, mode: 'insensitive' } },
        { location: { contains: q.q, mode: 'insensitive' } },
      ];
    }
    const [total, items] = await prisma.$transaction([
      prisma.virtualObject.count({ where }),
      prisma.virtualObject.findMany({
        where, select: listSelect, orderBy: [{ title: 'asc' }],
        skip: (q.page - 1) * q.pageSize, take: q.pageSize,
      }),
    ]);
    return { items, meta: buildMeta(q.page, q.pageSize, total) };
  },

  async get(actor: Actor, idOrSlug: string) {
    const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);
    const object = await prisma.virtualObject.findFirst({
      where: { ...visibleObjectWhere(actor), ...(isUuid ? { id: idOrSlug } : { slug: idOrSlug }) },
      include: {
        period: { select: { id: true, name: true } },
        tasks: { orderBy: { sortOrder: 'asc' } },
        sources: {
          where: { source: { deletedAt: null, status: 'PUBLISHED' } },
          // Rasm maydonlari — obyekt sahifasidagi yodgorlik fotosuratlari galereyasi uchun (4-modul)
          select: {
            source: {
              select: {
                id: true, title: true, slug: true, type: true, dateLabel: true, mediaUrl: true,
                mediaFile: { select: { id: true, mimeType: true } },
              },
            },
          },
        },
        assignments: {
          where: { assignment: { deletedAt: null, status: 'PUBLISHED' } },
          select: { assignment: { select: { id: true, title: true, type: true } } },
        },
      },
    });
    if (!object) throw AppError.notFound('Virtual obyekt topilmadi');
    const myResponse =
      actor?.role === 'STUDENT'
        ? await prisma.virtualObjectResponse.findUnique({
            where: { studentId_virtualObjectId: { studentId: actor.id, virtualObjectId: object.id } },
          })
        : null;
    return {
      ...object,
      sources: object.sources.map((s) => s.source),
      assignments: object.assignments.map((a) => a.assignment),
      myResponse,
    };
  },

  async create(actor: Express.AuthUser, input: z.infer<typeof objectBodySchema>) {
    const { sourceIds, tasks, ...data } = input;
    const embedUrl = resolveEmbed(data.provider, data.externalUrl, data.embedUrl);
    const slug = await uniqueSlug(data.title, async (s) => Boolean(await prisma.virtualObject.findUnique({ where: { slug: s } })));
    const object = await prisma.virtualObject.create({
      data: {
        ...data,
        embedUrl,
        slug,
        createdById: actor.id,
        sources: { create: sourceIds.map((sourceId) => ({ sourceId })) },
        tasks: { create: tasks.map((t, i) => ({ ...t, sortOrder: i })) },
      },
    });
    return this.get(actor, object.id);
  },

  async update(actor: Express.AuthUser, id: string, input: z.infer<typeof updateObjectSchema>) {
    const existing = await prisma.virtualObject.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw AppError.notFound('Virtual obyekt topilmadi');
    const { sourceIds, tasks, ...data } = input;
    const provider = data.provider ?? existing.provider;
    const externalUrl = data.externalUrl ?? existing.externalUrl;
    const embedInput = data.embedUrl !== undefined ? data.embedUrl : existing.embedUrl;
    const embedUrl = resolveEmbed(provider, externalUrl, embedInput);
    await prisma.$transaction(async (tx) => {
      await tx.virtualObject.update({ where: { id }, data: { ...data, embedUrl } });
      if (sourceIds) {
        await tx.virtualObjectSource.deleteMany({ where: { virtualObjectId: id } });
        await tx.virtualObjectSource.createMany({ data: sourceIds.map((sourceId) => ({ virtualObjectId: id, sourceId })) });
      }
      if (tasks) {
        // Mavjud javoblar task ID bo'yicha bog'langan — matni o'zgarmagan topshiriqlar saqlanadi
        const current = await tx.virtualObjectTask.findMany({ where: { virtualObjectId: id } });
        const keep = new Set<string>();
        for (const [i, t] of tasks.entries()) {
          const same = current.find((c) => c.prompt === t.prompt && c.kind === t.kind && !keep.has(c.id));
          if (same) {
            keep.add(same.id);
            await tx.virtualObjectTask.update({ where: { id: same.id }, data: { sortOrder: i } });
          } else {
            const createdTask = await tx.virtualObjectTask.create({ data: { ...t, sortOrder: i, virtualObjectId: id } });
            keep.add(createdTask.id);
          }
        }
        await tx.virtualObjectTask.deleteMany({ where: { virtualObjectId: id, id: { notIn: [...keep] } } });
      }
    });
    return this.get(actor, id);
  },

  async remove(id: string) {
    const existing = await prisma.virtualObject.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw AppError.notFound('Virtual obyekt topilmadi');
    await prisma.virtualObject.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  },
};

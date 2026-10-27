import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { studentAssignmentWhere } from '../assignments/assignments.service';
import { visibleSourceWhere } from '../sources/sources.service';
import { visibleObjectWhere } from '../virtual-museum/virtual.service';

type Actor = Express.AuthUser | undefined;
const contains = (q: string) => ({ contains: q, mode: 'insensitive' as const });

export const SEARCH_TYPES = ['sources', 'objects', 'assignments', 'lessons', 'periods', 'topics'] as const;
export type SearchType = (typeof SEARCH_TYPES)[number];

export const exploreService = {
  /** Umumiy qidiruv: manbalar, 3D/360° obyektlar, topshiriqlar, dars ishlanmalari, davr va mavzular */
  async search(actor: Actor, q: string, types: SearchType[], periodId?: string) {
    const want = (t: SearchType) => types.length === 0 || types.includes(t);
    const take = 10;
    const period = periodId ? { periodId } : {};

    const [sources, objects, assignments, lessons, periods, topics] = await Promise.all([
      want('sources')
        ? prisma.historicalSource.findMany({
            where: { ...visibleSourceWhere(actor), ...period, OR: [{ title: contains(q) }, { summary: contains(q) }, { author: contains(q) }] },
            select: { id: true, title: true, slug: true, type: true, summary: true, dateLabel: true, status: true, period: { select: { name: true } } },
            take,
          })
        : [],
      want('objects')
        ? prisma.virtualObject.findMany({
            where: { ...visibleObjectWhere(actor), ...period, OR: [{ title: contains(q) }, { description: contains(q) }, { location: contains(q) }] },
            select: { id: true, title: true, slug: true, type: true, location: true, thumbnailUrl: true, isActive: true },
            take,
          })
        : [],
      want('assignments') && actor
        ? prisma.assignment.findMany({
            where: {
              AND: [
                actor.role === 'STUDENT' ? studentAssignmentWhere(actor.id) : { deletedAt: null },
                { OR: [{ title: contains(q) }, { scenario: contains(q) }] },
              ],
            },
            select: { id: true, title: true, type: true, status: true, dueDate: true },
            take,
          })
        : [],
      want('lessons') && actor
        ? prisma.lessonPlan.findMany({
            where: {
              deletedAt: null,
              ...(actor.role === 'STUDENT' ? { authorId: actor.id } : actor.role === 'TEACHER' ? { NOT: { status: 'DRAFT' } } : {}),
              OR: [{ title: contains(q) }, { topic: contains(q) }],
            } satisfies Prisma.LessonPlanWhereInput,
            select: { id: true, title: true, topic: true, gradeLevel: true, status: true, author: { select: { fullName: true } } },
            take,
          })
        : [],
      want('periods')
        ? prisma.historicalPeriod.findMany({ where: { OR: [{ name: contains(q) }, { description: contains(q) }] }, take })
        : [],
      want('topics')
        ? prisma.historicalTopic.findMany({
            where: { OR: [{ name: contains(q) }, { description: contains(q) }] },
            include: { period: { select: { name: true } } },
            take,
          })
        : [],
    ]);
    return { sources, objects, assignments, lessons, periods, topics };
  },

  /** Xarita: faqat haqiqiy koordinatasi kiritilgan obyektlar (koordinatalar o'ylab topilmaydi) */
  async mapFeatures(actor: Actor, periodId?: string) {
    const period = periodId ? { periodId } : {};
    const [sources, objects] = await Promise.all([
      prisma.historicalSource.findMany({
        where: { ...visibleSourceWhere(actor), ...period, latitude: { not: null }, longitude: { not: null } },
        select: { id: true, title: true, slug: true, type: true, latitude: true, longitude: true, dateLabel: true, period: { select: { id: true, name: true } } },
      }),
      prisma.virtualObject.findMany({
        where: { ...visibleObjectWhere(actor), ...period, latitude: { not: null }, longitude: { not: null } },
        select: { id: true, title: true, slug: true, type: true, latitude: true, longitude: true, location: true, thumbnailUrl: true, period: { select: { id: true, name: true } } },
      }),
    ]);
    const [totalSources, totalObjects] = await Promise.all([
      prisma.historicalSource.count({ where: { ...visibleSourceWhere(actor), ...period } }),
      prisma.virtualObject.count({ where: { ...visibleObjectWhere(actor), ...period } }),
    ]);
    return {
      features: [
        ...sources.map((s) => ({ kind: 'source' as const, ...s })),
        ...objects.map((o) => ({ kind: 'object' as const, ...o })),
      ],
      withoutCoordinates: totalSources + totalObjects - sources.length - objects.length,
    };
  },

  /** Vaqt chizig'i: davrlar va ularga bog'langan manba/obyektlar */
  async timeline(actor: Actor) {
    const periods = await prisma.historicalPeriod.findMany({
      orderBy: [{ startYear: { sort: 'asc', nulls: 'last' } }, { sortOrder: 'asc' }],
      include: {
        sources: {
          where: visibleSourceWhere(actor),
          select: { id: true, title: true, slug: true, type: true, dateLabel: true, yearFrom: true, yearTo: true, mediaUrl: true },
          orderBy: { yearFrom: { sort: 'asc', nulls: 'last' } },
        },
        virtualObjects: {
          where: visibleObjectWhere(actor),
          select: { id: true, title: true, slug: true, type: true, periodLabel: true, thumbnailUrl: true },
        },
        topics: { select: { id: true, name: true } },
      },
    });
    // Landing kartasi uchun muqova: avval 3D/360° obyekt rasmi, bo'lmasa manbaning rasm fayli
    const isImage = (url: string | null) => Boolean(url && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url));
    return periods.map((p) => ({
      ...p,
      coverUrl: p.virtualObjects.find((o) => o.thumbnailUrl)?.thumbnailUrl ?? p.sources.find((s) => isImage(s.mediaUrl))?.mediaUrl ?? null,
    }));
  },
};

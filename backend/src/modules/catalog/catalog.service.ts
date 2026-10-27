import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { uniqueSlug } from '../../shared/utils/slug';
import type { periodSchema, topicSchema } from './catalog.schemas';

/** Tarixiy davrlar va mavzular (taksonomiya) */
export const catalogService = {
  listPeriods() {
    return prisma.historicalPeriod.findMany({
      orderBy: [{ sortOrder: 'asc' }, { startYear: 'asc' }],
      include: { _count: { select: { sources: { where: { deletedAt: null, status: 'PUBLISHED' } }, virtualObjects: true } } },
    });
  },

  async createPeriod(input: z.infer<typeof periodSchema>) {
    const slug = await uniqueSlug(input.name, async (s) => Boolean(await prisma.historicalPeriod.findUnique({ where: { slug: s } })));
    return prisma.historicalPeriod.create({ data: { ...input, slug } });
  },

  updatePeriod(id: string, input: Partial<z.infer<typeof periodSchema>>) {
    return prisma.historicalPeriod.update({ where: { id }, data: input });
  },

  async deletePeriod(id: string) {
    const period = await prisma.historicalPeriod.findUnique({ where: { id } });
    if (!period) throw AppError.notFound('Davr topilmadi');
    await prisma.historicalPeriod.delete({ where: { id } });
  },

  listTopics(periodId?: string) {
    return prisma.historicalTopic.findMany({
      where: periodId ? { periodId } : {},
      orderBy: { name: 'asc' },
      include: {
        period: { select: { id: true, name: true } },
        _count: { select: { sources: { where: { source: { deletedAt: null, status: 'PUBLISHED' } } } } },
      },
    });
  },

  async createTopic(input: z.infer<typeof topicSchema>) {
    const slug = await uniqueSlug(input.name, async (s) => Boolean(await prisma.historicalTopic.findUnique({ where: { slug: s } })));
    return prisma.historicalTopic.create({ data: { ...input, slug } });
  },

  updateTopic(id: string, input: Partial<z.infer<typeof topicSchema>>) {
    return prisma.historicalTopic.update({ where: { id }, data: input });
  },

  async deleteTopic(id: string) {
    await prisma.historicalTopic.delete({ where: { id } });
  },
};

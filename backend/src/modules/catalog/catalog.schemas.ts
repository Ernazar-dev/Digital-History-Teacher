import { z } from 'zod';

export const periodSchema = z.object({
  name: z.string().trim().min(2).max(200),
  startYear: z.number().int().min(-10000).max(2100).nullable().optional(),
  endYear: z.number().int().min(-10000).max(2100).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  reference: z.string().trim().max(2000).nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export const topicSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(5000).nullable().optional(),
  periodId: z.string().uuid().nullable().optional(),
});

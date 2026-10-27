import { z } from 'zod';
import { paginationQuery } from '../../shared/validators/common';

export const workStatusEnum = z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'RETURNED', 'REVIEWED']);

export const answersSchema = z
  .record(z.string().max(60), z.string().max(10000))
  .refine((o) => Object.keys(o).length <= 40, 'Javoblar soni juda ko‘p');

export const createAnalysisSchema = z.object({
  sourceId: z.string().uuid(),
  answers: answersSchema.default({}),
});

export const updateAnalysisSchema = z.object({ answers: answersSchema });

export const reviewSchema = z
  .object({
    decision: z.enum(['RETURN', 'ACCEPT']),
    comment: z.string().trim().min(2, 'Izoh yozing').max(5000),
    score: z.number().min(0).max(100).optional(),
  })
  .refine((v) => v.decision === 'RETURN' || v.score !== undefined, {
    message: 'Qabul qilishda ball (0–100) kiritilishi shart',
    path: ['score'],
  });

export const listWorkQuery = paginationQuery.extend({
  status: workStatusEnum.optional(),
  studentId: z.string().uuid().optional(),
  sourceId: z.string().uuid().optional(),
});

export const createComparisonSchema = z.object({
  title: z.string().trim().min(3).max(300),
  sourceIds: z
    .array(z.string().uuid())
    .min(2, 'Kamida 2 ta manba tanlang')
    .max(4, 'Ko‘pi bilan 4 ta manba')
    .refine((ids) => new Set(ids).size === ids.length, 'Manbalar takrorlanmasligi kerak'),
  similarities: z.string().max(10000).default(''),
  differences: z.string().max(10000).default(''),
  evidence: z.string().max(10000).default(''),
  conclusion: z.string().max(10000).default(''),
  teachingUse: z.string().max(10000).default(''),
  notes: z.record(z.string().uuid(), z.string().max(5000)).default({}),
});

export const updateComparisonSchema = createComparisonSchema.partial();

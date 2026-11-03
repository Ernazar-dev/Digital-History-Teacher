import { z } from 'zod';

/** Talaba ishlarining umumiy holati (dars ishlanmasi, virtual obyekt javobi) */
export const workStatusEnum = z.enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'RETURNED', 'REVIEWED']);

export const answersSchema = z
  .record(z.string().max(60), z.string().max(10000))
  .refine((o) => Object.keys(o).length <= 40, 'Javoblar soni juda ko‘p');

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

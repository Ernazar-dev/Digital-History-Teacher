import { z } from 'zod';
import { optionalText } from '../../shared/validators/common';

export const OPTIONS = ['A', 'B', 'C', 'D'] as const;
export const MAX_QUESTIONS = 200;

const option = z.enum(OPTIONS);

export const testBodySchema = z.object({
  title: z.string().trim().min(2, 'Test nomini kiriting').max(300),
  description: optionalText(2000),
  sourceId: z.string().uuid().nullable().optional(),
  fileId: z.string().uuid({ message: 'Test faylini yuklang' }),
  /** Har bir savolning to'g'ri javobi — savollar soni shu ro'yxat uzunligi */
  answerKey: z
    .array(option, { invalid_type_error: 'Javoblarni belgilang' })
    .min(1, 'Kamida bitta savol bo‘lishi kerak')
    .max(MAX_QUESTIONS, `Ko‘pi bilan ${MAX_QUESTIONS} ta savol`),
  isPublished: z.boolean().default(true),
});

export const updateTestSchema = testBodySchema.partial();

export const attemptSchema = z.object({
  /** Talaba javoblari: savol tartibida, belgilanmagan savol — null */
  answers: z.array(option.nullable()).min(1).max(MAX_QUESTIONS),
});

export const attemptParam = z.object({ id: z.string().uuid(), attemptId: z.string().uuid() });

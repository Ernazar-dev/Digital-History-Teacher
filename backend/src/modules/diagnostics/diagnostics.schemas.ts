import { z } from 'zod';

export const stageEnum = z.enum(['INITIAL', 'INTERMEDIATE', 'FINAL']);
export const kindEnum = z.enum(['TEST', 'SURVEY', 'REFLECTION', 'CASE']);
export const questionTypeEnum = z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT', 'LIKERT']);

const optionSchema = z.object({ id: z.string().trim().min(1).max(20), text: z.string().trim().min(1).max(1000) });

export const questionSchema = z
  .object({
    componentId: z.string().uuid(),
    type: questionTypeEnum,
    prompt: z.string().trim().min(3).max(5000),
    options: z.array(optionSchema).max(10).optional().nullable(),
    correct: z.array(z.string()).max(10).optional().nullable(),
    points: z.number().positive().max(100).default(1),
  })
  .superRefine((q, ctx) => {
    if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'LIKERT'].includes(q.type) && (!q.options || q.options.length < 2)) {
      ctx.addIssue({ code: 'custom', message: 'Kamida 2 ta variant kiriting', path: ['options'] });
    }
    if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE'].includes(q.type)) {
      const ids = new Set(q.options?.map((o) => o.id));
      if (!q.correct?.length || q.correct.some((c) => !ids.has(c))) {
        ctx.addIssue({ code: 'custom', message: 'To‘g‘ri javob variantlar ichidan tanlanishi kerak', path: ['correct'] });
      }
      if (q.type === 'SINGLE_CHOICE' && (q.correct?.length ?? 0) !== 1) {
        ctx.addIssue({ code: 'custom', message: 'Bitta to‘g‘ri javob belgilang', path: ['correct'] });
      }
    }
  });

export const diagnosticBodySchema = z.object({
  title: z.string().trim().min(3).max(300),
  description: z.string().trim().max(5000).nullable().optional(),
  stage: stageEnum,
  kind: kindEnum,
  isActive: z.boolean().default(true),
  timeLimitMinutes: z.number().int().min(1).max(600).nullable().optional(),
  /// Kompleks keys uchun tarixiy hujjat
  sourceId: z.string().uuid().nullable().optional(),
  questions: z.array(questionSchema).min(1, 'Kamida bitta savol kiriting').max(100),
});

export const updateDiagnosticSchema = diagnosticBodySchema.partial();

export const answerValue = z.union([z.string().max(20000), z.array(z.string().max(20)).max(10), z.number()]);

export const saveResponsesSchema = z.object({
  answers: z.record(z.string().uuid(), answerValue),
});

export const gradeAttemptSchema = z.object({
  grades: z
    .array(z.object({ questionId: z.string().uuid(), score: z.number().min(0), comment: z.string().max(3000).optional() }))
    .min(1)
    .max(100),
});

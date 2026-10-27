import { z } from 'zod';

const option = z.object({ id: z.string(), text: z.string().trim().min(1, 'Variant matni') });
export const questionSchema = z
  .object({
    componentId: z.string({ required_error: 'Komponentni tanlang' }).min(1, 'Komponentni tanlang'),
    type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TEXT', 'LIKERT']),
    prompt: z.string().trim().min(3, 'Savol matni'),
    options: z.array(option),
    correct: z.array(z.string()),
    points: z.number().positive(),
  })
  .superRefine((q, ctx) => {
    if (q.type !== 'TEXT' && q.options.length < 2) ctx.addIssue({ code: 'custom', path: ['options'], message: 'Kamida 2 ta variant' });
    if ((q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') && q.correct.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['correct'], message: 'To‘g‘ri javobni belgilang' });
    }
    if (q.type === 'SINGLE_CHOICE' && q.correct.length > 1) ctx.addIssue({ code: 'custom', path: ['correct'], message: 'Faqat bitta to‘g‘ri javob' });
  });

export const diagnosticFormSchema = z.object({
  title: z.string().trim().min(3, 'Nomini kiriting'),
  description: z.string().optional().nullable(),
  stage: z.enum(['INITIAL', 'INTERMEDIATE', 'FINAL']),
  kind: z.enum(['TEST', 'SURVEY', 'REFLECTION', 'CASE']),
  sourceId: z.string().nullable().optional(),
  isActive: z.boolean(),
  timeLimitMinutes: z.number().int().positive().nullable().optional(),
  questions: z.array(questionSchema).min(1, 'Kamida bitta savol qo‘shing'),
}).refine((v) => v.kind !== 'CASE' || Boolean(v.sourceId), { path: ['sourceId'], message: 'Keys uchun tarixiy hujjatni tanlang' });
export type DiagnosticFormValues = z.infer<typeof diagnosticFormSchema>;
export type QuestionValues = z.infer<typeof questionSchema>;

export const LIKERT_DEFAULT = ['Mutlaqo qo‘shilmayman', 'Qo‘shilmayman', 'Betarafman', 'Qo‘shilaman', 'To‘liq qo‘shilaman'].map((text, i) => ({
  id: String(i + 1),
  text,
}));

export const newQuestion = (componentId = ''): QuestionValues => ({
  componentId, type: 'SINGLE_CHOICE', prompt: '', points: 1, correct: [],
  options: [{ id: 'a', text: '' }, { id: 'b', text: '' }],
});

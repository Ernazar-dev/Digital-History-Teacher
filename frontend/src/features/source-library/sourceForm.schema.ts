import { z } from 'zod';

const fileRef = z.object({ id: z.string(), originalName: z.string(), mimeType: z.string(), size: z.number() });

/**
 * O'qituvchi uchun soddalashtirilgan forma: bir nechta asosiy maydon + muqova rasmi + o'quv materiallari.
 * Batafsil ilmiy maydonlar (ishonchlilik, variantlar va h.k.) formada yo'q — tahrirlashda ular o'zgarmaydi.
 */
export const sourceFormSchema = z.object({
  title: z.string().trim().min(2, 'Manba nomini kiriting').max(300),
  summary: z.string().trim().min(10, 'Qisqa tavsif kamida 10 belgi bo‘lsin').max(1000),
  type: z.enum(['WRITTEN', 'VISUAL', 'MAP', 'AUDIO', 'VIDEO', 'ARCHAEOLOGICAL']),
  periodId: z.string().nullable().optional(),
  topicIds: z.array(z.string()),
  cover: fileRef.nullable(),
  files: z.array(fileRef).max(15, 'Ko‘pi bilan 15 ta fayl'),
});

export type SourceFormValues = z.infer<typeof sourceFormSchema>;
export type UploadedFile = z.infer<typeof fileRef>;

export const EMPTY_SOURCE: SourceFormValues = {
  title: '', summary: '', type: 'WRITTEN', periodId: null, topicIds: [], cover: null, files: [],
};

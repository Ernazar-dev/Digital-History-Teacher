import { z } from 'zod';

/**
 * Virtual obyekt formasi — faqat uch narsa: nomi, havolasi va obyekt haqida ma'lumot.
 * Platforma (Sketchfab / Uzbekistan360), turi (3D / 360°) va embed manzili server tomonida havoladan aniqlanadi.
 */
export const objectFormSchema = z.object({
  title: z.string().trim().min(2, 'Nomini kiriting').max(300),
  externalUrl: z.string().trim().refine((v) => /^https?:\/\/\S+$/i.test(v), 'validation.objUrl'),
  description: z.string().trim().min(10, 'validation.min10').max(20000),
});
export type ObjectFormValues = z.infer<typeof objectFormSchema>;

export const EMPTY_OBJECT: ObjectFormValues = { title: '', externalUrl: '', description: '' };

import { z } from 'zod';
import { youtubeEmbedUrl } from './files';

const fileRef = z.object({ id: z.string(), originalName: z.string(), mimeType: z.string(), size: z.number() });

/**
 * Mavzu formasi: asosiy ma'lumot + uch qism (ma'ruza, taqdimot, video).
 * Fayllar keyinroq ham yuklanishi mumkin — hech biri majburiy emas.
 */
export const sourceFormSchema = z.object({
  title: z.string().trim().min(2, 'Mavzu nomini kiriting').max(300),
  summary: z.string().trim().min(10, 'Qisqa tavsif kamida 10 belgi bo‘lsin').max(1000),
  lectureFile: fileRef.nullable(),
  presentationFile: fileRef.nullable(),
  videoFile: fileRef.nullable(),
  videoUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => !v || Boolean(youtubeEmbedUrl(v)), 'YouTube havolasini kiriting (masalan: https://youtu.be/...)'),
  cover: fileRef.nullable(),
});

export type SourceFormValues = z.infer<typeof sourceFormSchema>;
export type UploadedFile = z.infer<typeof fileRef>;

export const EMPTY_SOURCE: SourceFormValues = {
  title: '', summary: '',
  lectureFile: null, presentationFile: null, videoFile: null, videoUrl: '', cover: null,
};

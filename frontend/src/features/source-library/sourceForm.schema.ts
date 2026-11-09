import { z } from 'zod';
import { youtubeEmbedUrl } from './files';

const fileRef = z.object({ id: z.string(), originalName: z.string(), mimeType: z.string(), size: z.number() });

/**
 * Mavzu formasi: asosiy ma'lumot + uch qism (ma'ruza, taqdimot, video).
 * Fayllar keyinroq ham yuklanishi mumkin — hech biri majburiy emas.
 */
export const sourceFormSchema = z.object({
  title: z.string().trim().min(2, 'validation.titleRequired').max(300),
  summary: z.string().trim().min(10, 'validation.summaryMin').max(1000),
  lectureFile: fileRef.nullable(),
  presentationFile: fileRef.nullable(),
  videoFile: fileRef.nullable(),
  videoUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => !v || Boolean(youtubeEmbedUrl(v)), 'validation.youtube'),
  cover: fileRef.nullable(),
});

export type SourceFormValues = z.infer<typeof sourceFormSchema>;
export type UploadedFile = z.infer<typeof fileRef>;

export const EMPTY_SOURCE: SourceFormValues = {
  title: '', summary: '',
  lectureFile: null, presentationFile: null, videoFile: null, videoUrl: '', cover: null,
};

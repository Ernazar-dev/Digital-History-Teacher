import { z } from 'zod';
import { isAllowedEmbedUrl, isSafeHttpUrl } from '../utils/embed';

export const uuidParam = z.object({ id: z.string().uuid('Noto‘g‘ri identifikator') });

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const optionalText = (max = 20000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v));

export const httpUrl = z
  .string()
  .trim()
  .max(2000)
  .refine(isSafeHttpUrl, 'Faqat http(s) havolalar qabul qilinadi');

export const optionalHttpUrl = z
  .union([httpUrl, z.literal(''), z.null()])
  .optional()
  .transform((v) => (v ? v : null));

export const optionalEmbedUrl = z
  .union([
    z
      .string()
      .trim()
      .max(2000)
      .refine((v) => isAllowedEmbedUrl(v), 'Embed manzili ruxsat etilgan domenlardan bo‘lishi kerak (https)'),
    z.literal(''),
    z.null(),
  ])
  .optional()
  .transform((v) => (v ? v : null));

export const booleanQuery = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => (v === undefined ? undefined : v === 'true'));

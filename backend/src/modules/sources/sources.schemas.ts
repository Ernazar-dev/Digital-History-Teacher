import { z } from 'zod';
import { httpUrl, optionalHttpUrl, optionalText, paginationQuery } from '../../shared/validators/common';

export const sourceTypeEnum = z.enum(['WRITTEN', 'VISUAL', 'MAP', 'AUDIO', 'VIDEO', 'ARCHAEOLOGICAL']);
export const publicationStatusEnum = z.enum(['DRAFT', 'REVIEWED', 'PUBLISHED']);

export const listSourcesQuery = paginationQuery.extend({
  q: z.string().trim().max(200).optional(),
  type: sourceTypeEnum.optional(),
  periodId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  status: publicationStatusEnum.optional(),
  sort: z.enum(['order', 'newest', 'title']).default('order'),
});

const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']);

/** Video rolik havolasi — faqat YouTube (sahifaga xavfsiz joylashtiriladi) */
const youtubeUrl = z
  .union([
    httpUrl.refine((v) => {
      try {
        return YOUTUBE_HOSTS.has(new URL(v).hostname);
      } catch {
        return false;
      }
    }, 'Faqat YouTube havolasi qabul qilinadi'),
    z.literal(''),
    z.null(),
  ])
  .optional()
  .transform((v) => (v ? v : null));

const year = z.number().int().min(-10000).max(2100).nullable().optional();
const coord = (min: number, max: number) => z.number().min(min).max(max).nullable().optional();
const fileId = z.string().uuid().nullable().optional();

/** Kutubxonadagi mavzu: ma'ruza matni, taqdimot va video rolik */
export const sourceBodySchema = z
  .object({
    title: z.string().trim().min(2).max(300),
    summary: z.string().trim().min(10).max(1000),
    type: sourceTypeEnum.default('WRITTEN'),
    periodId: z.string().uuid().nullable().optional(),
    topicIds: z.array(z.string().uuid()).max(30).default([]),
    bookLabel: optionalText(300),
    /** Berilmasa, yangi mavzu ro'yxat oxiriga qo'yiladi */
    sortOrder: z.number().int().min(0).max(10000).optional(),
    dateLabel: optionalText(100),
    yearFrom: year,
    yearTo: year,
    /** Ma'ruza matni (Markdown) — 15–20 betlik matn sig'adi */
    lectureContent: optionalText(400_000),
    references: optionalText(5000),
    mediaFileId: fileId,
    lectureFileId: fileId,
    presentationFileId: fileId,
    videoFileId: fileId,
    videoUrl: youtubeUrl,
    /** Afisha rasmi: tashqi havola yoki platformadagi /covers/... rasmi (yuklangan rasm bo'lsa — mediaFileId ustun) */
    mediaUrl: z
      .union([z.string().trim().regex(/^\/covers\/[\w.-]+\.(jpe?g|png|webp)$/i), optionalHttpUrl])
      .optional()
      .transform((v) => v || null),
    /** Afisha rasmi muallifi va litsenziyasi */
    license: optionalText(500),
    /** Afisha rasmi sahifasi (manba) */
    originalUrl: optionalHttpUrl,
    latitude: coord(-90, 90),
    longitude: coord(-180, 180),
    // Mavzu saqlanishi bilan talabalarga ko'rinadi
    status: publicationStatusEnum.default('PUBLISHED'),
  })
  .refine((v) => v.yearFrom == null || v.yearTo == null || v.yearFrom <= v.yearTo, {
    message: 'Boshlanish yili tugash yilidan katta bo‘lmasligi kerak',
    path: ['yearTo'],
  });

export const updateSourceSchema = sourceBodySchema.innerType().partial();

export const idOrSlugParam = z.object({ id: z.string().trim().min(1).max(200) });

/** Mavzuning ru/en varianti: tilga bog'liq maydonlar (bo'sh qoldirilsa o'zbekcha ko'rsatiladi) */
export const translationBodySchema = z.object({
  title: z.string().trim().min(2).max(300),
  summary: optionalText(1000),
  description: optionalText(20000),
  teachingUse: optionalText(5000),
  methodicalRecommendations: optionalText(20000),
  practicalTasks: optionalText(20000),
  references: optionalText(5000),
  lectureContent: optionalText(400_000),
  lectureFileId: fileId,
  presentationFileId: fileId,
  videoFileId: fileId,
  videoUrl: youtubeUrl,
});

export const translationParams = z.object({
  id: z.string().uuid(),
  locale: z.enum(['ru', 'en']),
});

import { z } from 'zod';
import { optionalEmbedUrl, optionalHttpUrl, optionalText, paginationQuery } from '../../shared/validators/common';

export const sourceTypeEnum = z.enum(['WRITTEN', 'VISUAL', 'MAP', 'AUDIO', 'VIDEO', 'ARCHAEOLOGICAL']);
export const publicationStatusEnum = z.enum(['DRAFT', 'REVIEWED', 'PUBLISHED']);
export const variantKindEnum = z.enum(['ORIGINAL', 'SCHOLARLY_COMMENTARY', 'EDUCATIONAL_ADAPTATION']);

export const listSourcesQuery = paginationQuery.extend({
  q: z.string().trim().max(200).optional(),
  type: sourceTypeEnum.optional(),
  periodId: z.string().uuid().optional(),
  topicId: z.string().uuid().optional(),
  format: z.string().trim().max(50).optional(),
  status: publicationStatusEnum.optional(),
  sort: z.enum(['newest', 'oldest', 'title', 'year']).default('newest'),
});

const variantSchema = z.object({
  kind: variantKindEnum,
  title: z.string().trim().min(2).max(300),
  content: z.string().trim().min(1).max(50000),
  citation: optionalText(2000),
});

const year = z.number().int().min(-10000).max(2100).nullable().optional();
const coord = (min: number, max: number) => z.number().min(min).max(max).nullable().optional();

export const sourceBodySchema = z
  .object({
    title: z.string().trim().min(2).max(300),
    summary: z.string().trim().min(10).max(1000),
    description: optionalText(),
    type: sourceTypeEnum,
    format: optionalText(50),
    periodId: z.string().uuid().nullable().optional(),
    topicIds: z.array(z.string().uuid()).max(30).default([]),
    dateLabel: optionalText(100),
    yearFrom: year,
    yearTo: year,
    author: optionalText(300),
    origin: optionalText(2000),
    repository: optionalText(500),
    originalUrl: optionalHttpUrl,
    license: optionalText(300),
    copyright: optionalText(1000),
    reliabilityNotes: optionalText(),
    limitations: optionalText(),
    notes: optionalText(),
    teachingUse: optionalText(),
    methodicalRecommendations: optionalText(),
    practicalTasks: optionalText(5000),
    references: optionalText(5000),
    mediaUrl: optionalHttpUrl,
    embedUrl: optionalEmbedUrl,
    mediaFileId: z.string().uuid().nullable().optional(),
    /** O'quv materiallari (PDF/DOCX/PPTX/rasm) — tartib bo'yicha */
    fileIds: z.array(z.string().uuid()).max(15).transform((a) => [...new Set(a)]).optional(),
    latitude: coord(-90, 90),
    longitude: coord(-180, 180),
    isDemo: z.boolean().default(false),
    // Manba saqlanishi bilan o'quvchilarga ko'rinadi
    status: publicationStatusEnum.default('PUBLISHED'),
    variants: z.array(variantSchema).max(20).default([]),
  })
  .refine((v) => v.yearFrom == null || v.yearTo == null || v.yearFrom <= v.yearTo, {
    message: 'Boshlanish yili tugash yilidan katta bo‘lmasligi kerak',
    path: ['yearTo'],
  });

export const updateSourceSchema = sourceBodySchema.innerType().partial();

export const idOrSlugParam = z.object({ id: z.string().trim().min(1).max(200) });

import { z } from 'zod';
import { httpUrl, optionalEmbedUrl, optionalHttpUrl, optionalText, paginationQuery } from '../../shared/validators/common';
import { answersSchema, reviewSchema } from '../source-analysis/analysis.schemas';
import { publicationStatusEnum } from '../sources/sources.schemas';

export const objectTypeEnum = z.enum(['MODEL_3D', 'TOUR_360', 'VIRTUAL_MUSEUM', 'OTHER']);
export const providerEnum = z.enum(['SKETCHFAB', 'UZBEKISTAN360', 'OTHER']);
export const taskKindEnum = z.enum([
  'OBSERVATION', 'EVIDENCE', 'COMPARISON', 'DISCUSSION', 'LESSON_APPLICATION', 'MATERIAL_CREATION',
]);

export const listObjectsQuery = paginationQuery.extend({
  q: z.string().trim().max(200).optional(),
  type: objectTypeEnum.optional(),
  provider: providerEnum.optional(),
  periodId: z.string().uuid().optional(),
  status: publicationStatusEnum.optional(),
});

const coord = (min: number, max: number) => z.number().min(min).max(max).nullable().optional();

export const objectBodySchema = z.object({
  title: z.string().trim().min(2).max(300),
  type: objectTypeEnum,
  provider: providerEnum.default('OTHER'),
  periodId: z.string().uuid().nullable().optional(),
  periodLabel: optionalText(200),
  location: optionalText(300),
  latitude: coord(-90, 90),
  longitude: coord(-180, 180),
  description: z.string().trim().min(10).max(20000),
  historicalSignificance: optionalText(),
  externalUrl: httpUrl,
  embedUrl: optionalEmbedUrl,
  authorOrOrganization: optionalText(300),
  license: optionalText(300),
  termsNote: optionalText(2000),
  historicalReferences: optionalText(),
  methodicalRecommendations: optionalText(),
  thumbnailUrl: optionalHttpUrl,
  isDemo: z.boolean().default(false),
  isActive: z.boolean().default(true),
  status: publicationStatusEnum.default('PUBLISHED'),
  sourceIds: z.array(z.string().uuid()).max(30).default([]),
  tasks: z
    .array(z.object({ kind: taskKindEnum, prompt: z.string().trim().min(5).max(3000) }))
    .max(30)
    .default([]),
});

export const updateObjectSchema = objectBodySchema.partial();

export const responseSchema = z.object({
  answers: answersSchema.default({}),
  activityDesign: z.string().max(20000).default(''),
});

export const responseReviewSchema = reviewSchema;
export const idOrSlug = z.object({ id: z.string().trim().min(1).max(200) });
export const responseParam = z.object({ responseId: z.string().uuid() });

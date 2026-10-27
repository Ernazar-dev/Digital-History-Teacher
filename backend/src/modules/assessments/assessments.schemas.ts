import { z } from 'zod';
import { evidenceKindEnum } from '../assignments/assignments.schemas';

export const assessmentStageEnum = z.enum(['INITIAL', 'INTERMEDIATE', 'FINAL', 'ONGOING']);

export const componentSchema = z.object({
  code: z.string().trim().min(2).max(40).regex(/^[A-Z_]+$/, 'Kod faqat lotin bosh harflari va _ dan iborat'),
  name: z.string().trim().min(2).max(200),
  definition: z.string().trim().min(5).max(5000),
  methods: z.string().trim().max(2000).nullable().optional(),
  weight: z.number().min(0).max(100).default(1),
  sortOrder: z.number().int().default(0),
});
export const updateComponentSchema = componentSchema.omit({ code: true }).partial();

export const criterionSchema = z.object({
  title: z.string().trim().min(2).max(300),
  description: z.string().trim().max(3000).nullable().optional(),
  sortOrder: z.number().int().default(0),
});
const descriptor = z.string().trim().max(2000).optional();
export const indicatorSchema = criterionSchema.extend({
  lowDescriptor: descriptor,
  mediumDescriptor: descriptor,
  highDescriptor: descriptor,
});

/** Indikator darajasi va uning bali (hujjat, 5-modul: daraja aniq indikator va ball mezoni orqali) */
export const INDICATOR_POINTS = { LOW: 1, MEDIUM: 2, HIGH: 3 } as const;
export const indicatorLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);

/** O'qituvchi/ekspert komponentni uning barcha indikatorlari bo'yicha baholaydi */
export const indicatorRatingSchema = z.object({
  studentId: z.string().uuid(),
  componentId: z.string().uuid(),
  stage: assessmentStageEnum.default('ONGOING'),
  ratings: z.array(z.object({ indicatorId: z.string().uuid(), level: indicatorLevelEnum })).min(1).max(50),
  note: z.string().trim().max(5000).optional(),
});

export const levelsSchema = z
  .array(
    z.object({
      code: z.string().trim().min(2).max(20),
      name: z.string().trim().min(2).max(100),
      description: z.string().trim().min(2).max(3000),
      minPercent: z.number().min(0).max(100),
      maxPercent: z.number().min(0).max(100),
    }),
  )
  .min(2)
  .max(10)
  .superRefine((levels, ctx) => {
    const sorted = [...levels].sort((a, b) => a.minPercent - b.minPercent);
    if (sorted[0].minPercent !== 0) ctx.addIssue({ code: 'custom', message: 'Eng past daraja 0 dan boshlanishi kerak' });
    if (sorted[sorted.length - 1].maxPercent !== 100) {
      ctx.addIssue({ code: 'custom', message: 'Eng yuqori daraja 100 da tugashi kerak' });
    }
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].minPercent > sorted[i].maxPercent) {
        ctx.addIssue({ code: 'custom', message: `${sorted[i].name}: quyi chegara yuqori chegaradan katta` });
      }
      if (i > 0 && sorted[i].minPercent <= sorted[i - 1].minPercent) {
        ctx.addIssue({ code: 'custom', message: 'Darajalarning quyi chegaralari takrorlanmasligi kerak' });
      }
    }
  });

export const weightsSchema = z.object({
  weights: z.array(z.object({ evidenceKind: evidenceKindEnum, weight: z.number().min(0).max(100) })).max(20),
});

export const expertRecordSchema = z.object({
  studentId: z.string().uuid(),
  componentId: z.string().uuid(),
  stage: assessmentStageEnum.default('ONGOING'),
  evidenceKind: evidenceKindEnum.default('EXPERT'),
  score: z.number().min(0).max(100),
  note: z.string().trim().max(5000).optional(),
});

export const studentParam = z.object({ studentId: z.string().uuid() });
export const groupParam = z.object({ groupId: z.string().uuid() });
export const stageQuery = z.object({ stage: assessmentStageEnum.optional() });

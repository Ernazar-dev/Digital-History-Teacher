import { z } from 'zod';
import { paginationQuery } from '../../shared/validators/common';
import { workStatusEnum } from '../source-analysis/analysis.schemas';

const text = (max = 10000) => z.string().max(max).default('');

export const stageSchema = z.object({
  title: z.string().trim().min(1, 'Bosqich nomini kiriting').max(200),
  durationMinutes: z.number().int().min(1).max(240),
  teacherActivity: text(),
  studentActivity: text(),
  methods: text(2000),
  resources: text(2000),
});

export const resourceSchema = z
  .object({
    sourceId: z.string().uuid().nullable().optional(),
    virtualObjectId: z.string().uuid().nullable().optional(),
    purpose: text(3000),
  })
  .refine((r) => Boolean(r.sourceId) !== Boolean(r.virtualObjectId), {
    message: 'Resurs manba yoki virtual obyektdan biri bo‘lishi kerak',
  });

export const lessonBodySchema = z.object({
  title: z.string().trim().min(3).max(300),
  topic: z.string().trim().min(2).max(300),
  topicId: z.string().uuid().nullable().optional(),
  gradeLevel: z.string().trim().min(1).max(50),
  durationMinutes: z.number().int().min(5).max(240).default(45),
  goals: text(),
  objectives: text(),
  learningOutcomes: text(),
  problemQuestions: z.array(z.string().trim().min(1).max(1000)).max(20).default([]),
  individualTasks: text(),
  groupTasks: text(),
  interactiveMethods: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  assessmentCriteria: text(),
  reflectionQuestions: text(),
  methodicalRationale: text(),
  assignmentId: z.string().uuid().nullable().optional(),
  stages: z.array(stageSchema).max(20).default([]),
  resources: z.array(resourceSchema).max(30).default([]),
});

export const updateLessonSchema = lessonBodySchema.partial().extend({
  versionNote: z.string().trim().max(500).optional(),
});

export const listLessonsQuery = paginationQuery.extend({
  status: workStatusEnum.optional(),
  authorId: z.string().uuid().optional(),
  q: z.string().trim().max(200).optional(),
});

export const lessonReviewSchema = z
  .object({
    decision: z.enum(['RETURN', 'ACCEPT']),
    comment: z.string().trim().min(2).max(5000),
    /// Dars ishlanmasi ekspertizasi — faoliyatli-metodik komponent bahosi (0–100)
    score: z.number().min(0).max(100).optional(),
    /// Ixtiyoriy: metodik qarorlar asosnomasi bo'yicha refleksiv komponent bahosi
    reflectiveScore: z.number().min(0).max(100).optional(),
    /// O'qituvchi belgilagan mezonlar (rubrika) bo'yicha baholash — berilsa, ball shu mezonlardan hisoblanadi
    rubricId: z.string().uuid().optional(),
    criterionScores: z
      .array(z.object({ criterionId: z.string().uuid(), score: z.number().min(0), comment: z.string().trim().max(2000).optional() }))
      .max(30)
      .optional(),
  })
  .refine((v) => !v.criterionScores || Boolean(v.rubricId), {
    message: 'Mezonlar bo‘yicha baholashda rubrika tanlanishi shart',
    path: ['rubricId'],
  })
  .refine((v) => v.decision === 'RETURN' || v.score !== undefined || Boolean(v.criterionScores?.length), {
    message: 'Qabul qilishda ball yoki mezonlar bo‘yicha baho kiritilishi shart',
    path: ['score'],
  });

export const versionParam = z.object({ id: z.string().uuid(), version: z.coerce.number().int().min(1) });

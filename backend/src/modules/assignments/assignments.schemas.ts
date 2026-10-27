import { z } from 'zod';
import { paginationQuery } from '../../shared/validators/common';
import { simulatorAnswerSchema, simulatorSchema } from './simulator';

export const assignmentTypeEnum = z.enum([
  'SOURCE_COMPARISON', 'CHRONOLOGY', 'MAP_IDENTIFICATION', 'PERSONALITY_ANALYSIS', 'PROBLEM_QUESTIONS',
  'INTERACTIVE_TASK_DESIGN', 'EVIDENCE_CONCLUSION', 'VIRTUAL_OBJECT_LESSON', 'SOURCE_ADAPTATION', 'LESSON_PLAN',
]);
export const assignmentStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const submissionStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'UNDER_REVIEW', 'RETURNED', 'GRADED']);
export const evidenceKindEnum = z.enum([
  'TEST', 'SURVEY', 'REFLECTION', 'SOURCE_ANALYSIS', 'PRACTICAL_TASK', 'LESSON_PLAN', 'PORTFOLIO', 'SELF_ASSESSMENT', 'EXPERT',
]);

export const rubricSchema = z.object({
  title: z.string().trim().min(3).max(300),
  description: z.string().trim().max(5000).nullable().optional(),
  criteria: z
    .array(
      z.object({
        title: z.string().trim().min(2).max(300),
        description: z.string().trim().max(3000).nullable().optional(),
        maxScore: z.number().positive().max(1000),
        componentId: z.string().uuid().nullable().optional(),
      }),
    )
    .min(1, 'Kamida bitta mezon kiriting')
    .max(30),
});

export const assignmentBodySchema = z.object({
  title: z.string().trim().min(3).max(300),
  scenario: z.string().trim().min(10).max(20000),
  instructions: z.string().trim().max(20000).nullable().optional(),
  type: assignmentTypeEnum,
  status: assignmentStatusEnum.default('DRAFT'),
  dueDate: z.coerce.date().nullable().optional(),
  maxScore: z.number().positive().max(1000).default(100),
  rubricId: z.string().uuid().nullable().optional(),
  evidenceKind: evidenceKindEnum.default('PRACTICAL_TASK'),
  groupIds: z.array(z.string().uuid()).max(50).default([]),
  sourceIds: z.array(z.string().uuid()).max(30).default([]),
  virtualObjectIds: z.array(z.string().uuid()).max(30).default([]),
  /// Raqamli simulyator (xronologiya yoki xarita) — to'g'ri javoblar bilan
  simulator: simulatorSchema.nullable().optional(),
});

export const updateAssignmentSchema = assignmentBodySchema.partial();

export const listAssignmentsQuery = paginationQuery.extend({
  status: assignmentStatusEnum.optional(),
  type: assignmentTypeEnum.optional(),
  q: z.string().trim().max(200).optional(),
});

export const saveSubmissionSchema = z.object({
  content: z.string().max(50000).default(''),
  lessonPlanId: z.string().uuid().nullable().optional(),
  simulatorAnswer: simulatorAnswerSchema.nullable().optional(),
});

export const listSubmissionsQuery = paginationQuery.extend({
  assignmentId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  status: submissionStatusEnum.optional(),
});

export const feedbackSchema = z.object({
  decision: z.enum(['COMMENT', 'RETURN_FOR_REVISION', 'GRADE']),
  comment: z.string().trim().min(2, 'Izoh yozing').max(10000),
  criterionScores: z
    .array(z.object({ criterionId: z.string().uuid(), score: z.number().min(0), comment: z.string().max(2000).optional() }))
    .max(30)
    .default([]),
  totalScore: z.number().min(0).optional(),
});

import { z } from 'zod';

export const reflectionSchema = z.object({
  title: z.string().trim().min(2).max(300),
  content: z.string().trim().min(10, 'Refleksiya kamida 10 belgidan iborat bo‘lsin').max(20000),
  relatedType: z
    .enum(['SourceAnalysis', 'LessonPlan', 'AssignmentSubmission', 'VirtualObjectResponse', 'DiagnosticAttempt'])
    .nullable()
    .optional(),
  relatedId: z.string().uuid().nullable().optional(),
});

export const summarySchema = z.object({ summary: z.string().max(5000) });
export const itemUpdateSchema = z.object({
  isFeatured: z.boolean().optional(),
  description: z.string().max(2000).nullable().optional(),
});

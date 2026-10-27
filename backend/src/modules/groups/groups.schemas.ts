import { z } from 'zod';

export const groupKindEnum = z.enum(['REGULAR', 'EXPERIMENTAL', 'CONTROL']);

export const createGroupSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional().nullable(),
  kind: groupKindEnum.default('REGULAR'),
  academicYear: z.string().trim().max(20).optional().nullable(),
  /// Admin boshqa o'qituvchiga guruh yaratishi mumkin
  teacherId: z.string().uuid().optional(),
});

export const updateGroupSchema = createGroupSchema.partial();

export const membersSchema = z.object({
  studentIds: z.array(z.string().uuid()).min(1).max(200),
});

export const memberParam = z.object({ id: z.string().uuid(), studentId: z.string().uuid() });

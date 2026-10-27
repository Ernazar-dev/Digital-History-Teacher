import { z } from 'zod';
import { optionalEmailSchema, passwordSchema, usernameSchema } from '../auth/auth.schemas';
import { paginationQuery } from '../../shared/validators/common';

export const roleEnum = z.enum(['ADMIN', 'TEACHER', 'STUDENT']);
export const statusEnum = z.enum(['PENDING', 'ACTIVE', 'BLOCKED']);

export const listUsersQuery = paginationQuery.extend({
  role: roleEnum.optional(),
  status: statusEnum.optional(),
  q: z.string().trim().max(100).optional(),
});

export const createUserSchema = z.object({
  username: usernameSchema,
  email: optionalEmailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(3).max(150),
  institution: z.string().trim().max(200).optional(),
  role: roleEnum,
  status: statusEnum.default('ACTIVE'),
});

export const updateUserSchema = z.object({
  username: usernameSchema.optional(),
  email: optionalEmailSchema.optional(),
  fullName: z.string().trim().min(3).max(150).optional(),
  institution: z.string().trim().max(200).nullable().optional(),
  role: roleEnum.optional(),
  status: statusEnum.optional(),
});

export const adminResetPasswordSchema = z.object({ password: passwordSchema });

/** Talabaning guruhi: null — guruhdan chiqarish */
export const setGroupSchema = z.object({ groupId: z.string().uuid().nullable() });

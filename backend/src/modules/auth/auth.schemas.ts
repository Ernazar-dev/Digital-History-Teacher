import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Parol kamida 8 belgidan iborat bo‘lishi kerak')
  .max(128);

/** Login: 3–32 belgi, lotin harflari, raqamlar, "." "_" "-" (kichik harflarda saqlanadi) */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Login kamida 3 belgidan iborat bo‘lishi kerak')
  .max(32, 'Login 32 belgidan oshmasligi kerak')
  .regex(/^[a-z0-9._-]+$/, 'Login faqat lotin harflari, raqamlar va . _ - belgilaridan iborat bo‘lishi mumkin');

/** Ixtiyoriy email: bo'sh qator — yo'q deb hisoblanadi */
export const optionalEmailSchema = z
  .union([z.string().trim().toLowerCase().email('Email noto‘g‘ri'), z.literal('')])
  .optional()
  .nullable()
  .transform((v) => v || null);

export const registerSchema = z.object({
  username: usernameSchema,
  email: optionalEmailSchema,
  password: passwordSchema,
  fullName: z.string().trim().min(3, 'F.I.Sh. kamida 3 belgi').max(150),
  institution: z.string().trim().max(200).optional(),
  /// Talaba yoki o'qituvchi sifatida ro'yxatdan o'tish (o'qituvchi admin tasdig'ini kutadi)
  role: z.enum(['STUDENT', 'TEACHER']).default('STUDENT'),
  /// Talaba ro'yxatdan o'tishda o'z guruhini tanlaydi
  groupId: z.string().uuid().optional(),
});

export const loginSchema = z.object({
  username: z.string().trim().toLowerCase().min(1, 'Loginni kiriting').max(64),
  password: z.string().min(1, 'Parolni kiriting').max(128),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  username: z.string().trim().toLowerCase().min(1).max(64),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(3).max(150).optional(),
  email: optionalEmailSchema.optional(),
  institution: z.string().trim().max(200).optional().nullable(),
});

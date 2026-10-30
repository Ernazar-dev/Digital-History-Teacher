import { z } from 'zod';

export const passwordRule = z.string().min(8, 'Parol kamida 8 belgidan iborat bo‘lishi kerak').max(128, 'Parol juda uzun');

/** Login: 3–32 belgi — lotin harflari, raqamlar, "." "_" "-" (email shart emas) */
export const usernameRule = z
  .string()
  .trim()
  .min(3, 'Login kamida 3 belgidan iborat bo‘lishi kerak')
  .max(32, 'Login 32 belgidan oshmasligi kerak')
  .regex(/^[A-Za-z0-9._-]+$/, 'Faqat lotin harflari, raqamlar va . _ - belgilari');

/** Ixtiyoriy email — bo'sh qoldirish mumkin */
export const optionalEmailRule = z.union([z.string().trim().email('Email noto‘g‘ri'), z.literal('')]);

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Loginni kiriting'),
  password: z.string().min(1, 'Parolni kiriting'),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(3, 'F.I.Sh. kamida 3 belgi'),
  username: usernameRule,
  password: passwordRule,
  groupId: z.string().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;

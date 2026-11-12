import { z } from 'zod';

// Xato matnlari — i18n kalitlari (fields.tsx ularni joriy tilda körsatadi)
export const passwordRule = z.string().min(8, 'validation.pwdMin').max(128, 'validation.pwdMax');

/** Login: 3–32 belgi — lotin harflari, raqamlar, "." "_" "-" (email şart emas) */
export const usernameRule = z
  .string()
  .trim()
  .min(3, 'validation.userMin')
  .max(32, 'validation.userMax')
  .regex(/^[A-Za-z0-9._-]+$/, 'validation.userChars');

/** Ixtiyoriy email — böş qoldiriş mumkin */
export const optionalEmailRule = z.union([z.string().trim().email('validation.emailInvalid'), z.literal('')]);

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'validation.loginRequired'),
  password: z.string().min(1, 'validation.passwordRequired'),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(3, 'validation.fullNameMin'),
  username: usernameRule,
  password: passwordRule,
  groupId: z.string().optional(),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;

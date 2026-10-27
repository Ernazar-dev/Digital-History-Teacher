import 'dotenv/config';
import { z } from 'zod';

const optional = z.string().trim().optional().transform((v) => (v ? v : undefined));
const flag = z.enum(['true', 'false']).optional();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET kamida 32 belgi bo‘lishi kerak'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET kamida 32 belgi bo‘lishi kerak'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  EMBED_ALLOWED_HOSTS: z.string().default('sketchfab.com,uzbekistan360.uz'),
  /** Auth endpointlari uchun IP bo'yicha 15 daqiqadagi maksimal urinishlar. Hisob bo'yicha alohida blok bor (loginGuard) — bu limit butun sinf bitta IP dan kirganda yetarli bo'lishi kerak */
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  UPLOAD_DIR: z.string().default('uploads'),
  /** Yuklangan fayllar qayerda saqlanadi: local — disk (UPLOAD_DIR), database — PostgreSQL (Render free kabi vaqtinchalik diskli hostinglar uchun) */
  STORAGE_DRIVER: z.enum(['local', 'database']).default('local'),
  /** Server oldidagi proxy'lar soni (Render: 1; frontend rewrite orqali kelganda ham IP to'g'ri aniqlanishi uchun sozlanadi) */
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).default(1),
  UPLOAD_MAX_MB: z.coerce.number().positive().default(10),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  /** Administrator hisobi (login + parol) — server ishga tushganda yaratiladi va paroli sinxronlanadi */
  ADMIN_USERNAME: optional.pipe(
    z.string().regex(/^[A-Za-z0-9._-]{3,32}$/, 'ADMIN_USERNAME: 3–32 belgi, lotin harflari, raqamlar va . _ -').optional(),
  ),
  ADMIN_PASSWORD: optional.pipe(z.string().min(10, 'ADMIN_PASSWORD kamida 10 belgi bo‘lishi kerak').optional()),
  ADMIN_FULL_NAME: z.string().trim().min(1).default('Administrator'),
  /** Swagger hujjati (/api/docs). Ko'rsatilmasa: productionda o'chiq, developmentda yoqiq */
  API_DOCS_ENABLED: flag,
  /** Parolni tiklash tokenini javobda qaytarish (email servisi yo'q bo'lganda). Productionda har doim o'chiq */
  EXPOSE_RESET_TOKEN: flag,
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Konfiguratsiya xatosi — ilovani ishga tushirmaymiz
  console.error('Environment konfiguratsiyasi noto‘g‘ri:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;
const isProduction = raw.NODE_ENV === 'production';

if (isProduction && raw.JWT_ACCESS_SECRET.startsWith('change-me')) {
  console.error('Productionda standart JWT kalitlaridan foydalanish taqiqlangan.');
  process.exit(1);
}
if (Boolean(raw.ADMIN_USERNAME) !== Boolean(raw.ADMIN_PASSWORD)) {
  console.error('ADMIN_USERNAME va ADMIN_PASSWORD birga ko‘rsatilishi kerak.');
  process.exit(1);
}
if (isProduction && raw.ADMIN_PASSWORD?.startsWith('change-me')) {
  console.error('Productionda standart ADMIN_PASSWORD qiymatidan foydalanish taqiqlangan.');
  process.exit(1);
}

export const env = {
  ...raw,
  isProduction,
  isTest: raw.NODE_ENV === 'test',
  apiDocsEnabled: raw.API_DOCS_ENABLED ? raw.API_DOCS_ENABLED === 'true' : !isProduction,
  exposeResetToken: !isProduction && raw.EXPOSE_RESET_TOKEN !== 'false',
  admin:
    raw.ADMIN_USERNAME && raw.ADMIN_PASSWORD
      ? { username: raw.ADMIN_USERNAME.toLowerCase(), password: raw.ADMIN_PASSWORD, fullName: raw.ADMIN_FULL_NAME }
      : null,
  corsOrigins: raw.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
  embedAllowedHosts: raw.EMBED_ALLOWED_HOSTS.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
};

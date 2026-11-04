import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Ishlayotgan server uchun ulanish manzili. DATABASE_POOLED_URL (Neon PgBouncer) bo'lsa — shu;
 * migratsiya va seed doim DATABASE_URL (to'g'ridan-to'g'ri) bilan ishlaydi.
 * PgBouncer uchun Prisma'ga `pgbouncer=true` kerak (prepared statement'lar o'chiriladi);
 * ulanishlar soni bepul tarifda kichik tutiladi.
 */
const runtimeUrl = (): string => {
  if (!env.DATABASE_POOLED_URL) return env.DATABASE_URL;
  const url = new URL(env.DATABASE_POOLED_URL);
  if (!url.searchParams.has('pgbouncer')) url.searchParams.set('pgbouncer', 'true');
  if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '5');
  return url.toString();
};

export const prisma = new PrismaClient({
  datasources: { db: { url: runtimeUrl() } },
  log: env.isProduction ? ['error'] : ['warn', 'error'],
});

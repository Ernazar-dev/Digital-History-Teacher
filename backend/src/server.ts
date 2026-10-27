import { createApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { ensureAdmin } from './modules/auth/admin-bootstrap';
import { logger } from './shared/logger';

if (env.admin) {
  ensureAdmin(prisma, env.admin)
    .then((r) => r.action !== 'unchanged' && logger.info(`Administrator hisobi .env asosida ${r.action === 'created' ? 'yaratildi' : 'yangilandi'}`))
    .catch((err) => logger.error({ err }, 'Administrator hisobini .env asosida yaratib bo‘lmadi'));
} else {
  logger.warn('ADMIN_USERNAME/ADMIN_PASSWORD ko‘rsatilmagan — administrator hisobi avtomatik yaratilmaydi');
}

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info(`API ishga tushdi: http://localhost:${env.PORT}/api/v1${env.apiDocsEnabled ? ' (hujjat: /api/docs)' : ''}`);
});

// Sekin so'rovlar (slowloris) bilan ulanishlarni band qilishga qarshi
server.headersTimeout = 20_000;
server.requestTimeout = 120_000;
server.keepAliveTimeout = 5_000;

const shutdown = async (signal: string) => {
  logger.info(`${signal} qabul qilindi, server to‘xtatilmoqda...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

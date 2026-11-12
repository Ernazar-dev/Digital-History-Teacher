import { Router } from 'express';
import { prisma } from '../config/prisma';
import { adminRouter } from '../modules/admin/admin.routes';
import { analyticsRouter } from '../modules/analytics/analytics.routes';
import { authRouter } from '../modules/auth/auth.routes';
import { periodsRouter, topicsRouter } from '../modules/catalog/catalog.routes';
import { exploreRouter } from '../modules/explore/explore.routes';
import { groupsRouter } from '../modules/groups/groups.routes';
import { progressRouter } from '../modules/progress/progress.routes';
import { messagesRouter } from '../modules/messages/messages.routes';
import { lessonsRouter } from '../modules/lessons/lessons.routes';
import { mediaRouter } from '../modules/media/media.routes';
import { portfoliosRouter } from '../modules/portfolios/portfolios.routes';
import { settingsRouter } from '../modules/settings/settings.routes';
import { sourcesRouter } from '../modules/sources/sources.routes';
import { testsRouter } from '../modules/tests/tests.routes';
import { usersRouter } from '../modules/users/users.routes';
import { virtualRouter } from '../modules/virtual-museum/virtual.routes';

export const apiRouter = Router();

// SELECT 1 — tashqi ping (UptimeRobot) Neon'ni ham uyg'oq tutadi. Baza javob bermasa ham 200 qaytadi:
// 503 bo'lsa Render servisni nosog'lom deb qayta ishga tushirishi mumkin.
apiRouter.get('/health', async (_req, res) => {
  const db = await prisma.$queryRaw`SELECT 1`.then(
    () => 'up',
    () => 'down',
  );
  res.json({ data: { status: 'ok', db, time: new Date().toISOString() } });
});
apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/groups', groupsRouter);
apiRouter.use('/progress', progressRouter);
apiRouter.use('/periods', periodsRouter);
apiRouter.use('/topics', topicsRouter);
apiRouter.use('/sources', sourcesRouter);
apiRouter.use('/virtual-objects', virtualRouter);
apiRouter.use('/tests', testsRouter);
apiRouter.use('/lessons', lessonsRouter);
apiRouter.use('/portfolios', portfoliosRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/media', mediaRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/messages', messagesRouter);
apiRouter.use('/explore', exploreRouter);

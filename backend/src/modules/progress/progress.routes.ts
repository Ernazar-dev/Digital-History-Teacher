import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { currentUser, ok } from '../../shared/utils/http';
import { progressService } from './progress.service';

/** /progress — ball, daraja, yutuqlar, guruh reytingi va individual o'quv traektoriyasi */
export const progressRouter = Router();
progressRouter.use(authenticate);

progressRouter.get('/me', requireRole('STUDENT'), asyncHandler(async (req, res) => {
  const user = currentUser(req);
  ok(res, await progressService.get(user, user.id));
}));
progressRouter.get(
  '/students/:studentId',
  requireRole('ADMIN', 'TEACHER'),
  validate({ params: z.object({ studentId: z.string().uuid() }) }),
  asyncHandler(async (req, res) => ok(res, await progressService.get(currentUser(req), req.params.studentId))),
);
progressRouter.get(
  '/groups/:groupId/leaderboard',
  validate({ params: z.object({ groupId: z.string().uuid() }) }),
  asyncHandler(async (req, res) => ok(res, await progressService.leaderboard(currentUser(req), req.params.groupId))),
);

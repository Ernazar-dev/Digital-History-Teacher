import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { currentUser, ok } from '../../shared/utils/http';
import { dashboardService } from './dashboard.service';
import { reviewQueue } from './review-queue.service';

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);

analyticsRouter.get('/dashboard', asyncHandler(async (req, res) => {
  const user = currentUser(req);
  if (user.role === 'STUDENT') return ok(res, { role: user.role, ...(await dashboardService.student(user)) });
  if (user.role === 'TEACHER') return ok(res, { role: user.role, ...(await dashboardService.teacher(user)) });
  return ok(res, { role: user.role, ...(await dashboardService.admin()), teaching: await dashboardService.teacher(user) });
}));

analyticsRouter.get('/review-queue', requireRole('ADMIN', 'TEACHER'), asyncHandler(async (req, res) => {
  ok(res, await reviewQueue(currentUser(req)));
}));

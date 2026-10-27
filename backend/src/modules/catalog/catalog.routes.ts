import { Router, type Request, type Response } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { audit } from '../../shared/utils/audit';
import { created, noContent, ok } from '../../shared/utils/http';
import { uuidParam } from '../../shared/validators/common';
import { periodSchema, topicSchema } from './catalog.schemas';
import { catalogService } from './catalog.service';

const adminOnly = [authenticate, requireRole('ADMIN')];

export const periodsRouter = Router();
periodsRouter.get('/', asyncHandler(async (_req, res) => ok(res, await catalogService.listPeriods())));
periodsRouter.post('/', ...adminOnly, validate({ body: periodSchema }), asyncHandler(async (req: Request, res: Response) => {
  const period = await catalogService.createPeriod(req.body);
  await audit(req, 'period.created', 'HistoricalPeriod', period.id);
  created(res, period);
}));
periodsRouter.patch('/:id', ...adminOnly, validate({ params: uuidParam, body: periodSchema.partial() }), asyncHandler(async (req, res) => {
  ok(res, await catalogService.updatePeriod(req.params.id, req.body));
}));
periodsRouter.delete('/:id', ...adminOnly, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await catalogService.deletePeriod(req.params.id);
  await audit(req, 'period.deleted', 'HistoricalPeriod', req.params.id);
  noContent(res);
}));

export const topicsRouter = Router();
topicsRouter.get('/', asyncHandler(async (req, res) => {
  const raw = typeof req.query.periodId === 'string' ? req.query.periodId : undefined;
  const periodId = raw && /^[0-9a-f-]{36}$/i.test(raw) ? raw : undefined;
  ok(res, await catalogService.listTopics(periodId));
}));
topicsRouter.post('/', ...adminOnly, validate({ body: topicSchema }), asyncHandler(async (req, res) => {
  created(res, await catalogService.createTopic(req.body));
}));
topicsRouter.patch('/:id', ...adminOnly, validate({ params: uuidParam, body: topicSchema.partial() }), asyncHandler(async (req, res) => {
  ok(res, await catalogService.updateTopic(req.params.id, req.body));
}));
topicsRouter.delete('/:id', ...adminOnly, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await catalogService.deleteTopic(req.params.id);
  noContent(res);
}));

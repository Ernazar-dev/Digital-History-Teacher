import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { uuidParam } from '../../shared/validators/common';
import { attemptParam, attemptSchema, testBodySchema, updateTestSchema } from './tests.schemas';
import { testsService } from './tests.service';

export const testsRouter = Router();
testsRouter.use(authenticate);
const staff = requireRole('ADMIN', 'TEACHER');

testsRouter.get('/', asyncHandler(async (req, res) => ok(res, await testsService.list(currentUser(req)))));

testsRouter.get('/:id', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await testsService.get(currentUser(req), req.params.id));
}));

testsRouter.post('/', staff, validate({ body: testBodySchema }), asyncHandler(async (req, res) => {
  const test = await testsService.create(currentUser(req), req.body);
  await audit(req, 'test.created', 'Test', test.id, { questions: test.questionCount });
  created(res, test);
}));

testsRouter.patch('/:id', staff, validate({ params: uuidParam, body: updateTestSchema }), asyncHandler(async (req, res) => {
  const test = await testsService.update(currentUser(req), req.params.id, req.body);
  await audit(req, 'test.updated', 'Test', test.id);
  ok(res, test);
}));

testsRouter.delete('/:id', staff, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await testsService.remove(currentUser(req), req.params.id);
  await audit(req, 'test.deleted', 'Test', req.params.id);
  noContent(res);
}));

testsRouter.post('/:id/attempt', requireRole('STUDENT'), validate({ params: uuidParam, body: attemptSchema }), asyncHandler(async (req, res) => {
  created(res, await testsService.submit(currentUser(req), req.params.id, req.body));
}));

testsRouter.get('/:id/results', staff, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await testsService.results(currentUser(req), req.params.id));
}));

testsRouter.delete('/:id/attempts/:attemptId', staff, validate({ params: attemptParam }), asyncHandler(async (req, res) => {
  await testsService.resetAttempt(currentUser(req), req.params.id, req.params.attemptId);
  await audit(req, 'test.attempt_reset', 'TestAttempt', req.params.attemptId);
  noContent(res);
}));

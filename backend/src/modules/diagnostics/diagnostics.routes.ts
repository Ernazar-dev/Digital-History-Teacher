import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { uuidParam } from '../../shared/validators/common';
import { attemptsService } from './attempts.service';
import { diagnosticBodySchema, gradeAttemptSchema, saveResponsesSchema, updateDiagnosticSchema } from './diagnostics.schemas';
import { diagnosticsService } from './diagnostics.service';

export const diagnosticsRouter = Router();
diagnosticsRouter.use(authenticate);

const staff = requireRole('ADMIN', 'TEACHER');
const student = requireRole('STUDENT');
const attemptParam = z.object({ attemptId: z.string().uuid() });

diagnosticsRouter.get('/', asyncHandler(async (req, res) => ok(res, await diagnosticsService.list(currentUser(req)))));

// Urinishlar (aniq marshrutlar :id dan oldin)
diagnosticsRouter.get('/attempts/:attemptId', validate({ params: attemptParam }), asyncHandler(async (req, res) => {
  ok(res, await diagnosticsService.getAttempt(currentUser(req), req.params.attemptId));
}));
diagnosticsRouter.put(
  '/attempts/:attemptId/responses',
  student,
  validate({ params: attemptParam, body: saveResponsesSchema }),
  asyncHandler(async (req, res) => ok(res, await attemptsService.saveAnswers(currentUser(req), req.params.attemptId, req.body.answers))),
);
diagnosticsRouter.post('/attempts/:attemptId/submit', student, validate({ params: attemptParam }), asyncHandler(async (req, res) => {
  ok(res, await attemptsService.submit(currentUser(req), req.params.attemptId));
}));
diagnosticsRouter.post(
  '/attempts/:attemptId/grade',
  staff,
  validate({ params: attemptParam, body: gradeAttemptSchema }),
  asyncHandler(async (req, res) => {
    const result = await attemptsService.grade(currentUser(req), req.params.attemptId, req.body);
    await audit(req, 'diagnostic_attempt.graded', 'DiagnosticAttempt', req.params.attemptId);
    ok(res, result);
  }),
);

diagnosticsRouter.get('/:id', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await diagnosticsService.get(currentUser(req), req.params.id));
}));
diagnosticsRouter.get('/:id/attempts', staff, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await diagnosticsService.listAttempts(currentUser(req), req.params.id));
}));
diagnosticsRouter.post('/:id/attempts', student, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  created(res, await attemptsService.start(currentUser(req), req.params.id));
}));
diagnosticsRouter.post('/', staff, validate({ body: diagnosticBodySchema }), asyncHandler(async (req, res) => {
  const d = await diagnosticsService.create(currentUser(req), req.body);
  await audit(req, 'diagnostic.created', 'Diagnostic', d.id);
  created(res, d);
}));
diagnosticsRouter.patch('/:id', staff, validate({ params: uuidParam, body: updateDiagnosticSchema }), asyncHandler(async (req, res) => {
  const d = await diagnosticsService.update(currentUser(req), req.params.id, req.body);
  await audit(req, 'diagnostic.updated', 'Diagnostic', d.id);
  ok(res, d);
}));
diagnosticsRouter.delete('/:id', requireRole('ADMIN'), validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await diagnosticsService.remove(req.params.id);
  await audit(req, 'diagnostic.deleted', 'Diagnostic', req.params.id);
  noContent(res);
}));

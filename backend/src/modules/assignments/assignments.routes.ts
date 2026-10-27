import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { uuidParam } from '../../shared/validators/common';
import {
  assignmentBodySchema,
  feedbackSchema,
  listAssignmentsQuery,
  listSubmissionsQuery,
  rubricSchema,
  saveSubmissionSchema,
  updateAssignmentSchema,
} from './assignments.schemas';
import { assignmentsService } from './assignments.service';
import { submissionsService } from './submissions.service';

const staff = requireRole('ADMIN', 'TEACHER');
const student = requireRole('STUDENT');

// ───── /assignments ─────
export const assignmentsRouter = Router();
assignmentsRouter.use(authenticate);

assignmentsRouter.get('/rubrics', staff, asyncHandler(async (_req, res) => ok(res, await assignmentsService.listRubrics())));
assignmentsRouter.post('/rubrics', staff, validate({ body: rubricSchema }), asyncHandler(async (req, res) => {
  created(res, await assignmentsService.createRubric(currentUser(req), req.body));
}));
assignmentsRouter.put('/rubrics/:id', staff, validate({ params: uuidParam, body: rubricSchema }), asyncHandler(async (req, res) => {
  ok(res, await assignmentsService.updateRubric(currentUser(req), req.params.id, req.body));
}));
assignmentsRouter.delete('/rubrics/:id', staff, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await assignmentsService.deleteRubric(currentUser(req), req.params.id);
  noContent(res);
}));

assignmentsRouter.get('/', validate({ query: listAssignmentsQuery }), asyncHandler(async (req, res) => {
  const r = await assignmentsService.list(currentUser(req), req.query as never);
  ok(res, r.items, r.meta);
}));
assignmentsRouter.get('/:id', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await assignmentsService.get(currentUser(req), req.params.id));
}));
assignmentsRouter.post('/', staff, validate({ body: assignmentBodySchema }), asyncHandler(async (req, res) => {
  const a = await assignmentsService.create(currentUser(req), req.body);
  await audit(req, 'assignment.created', 'Assignment', a.id, { status: a.status });
  created(res, a);
}));
assignmentsRouter.patch('/:id', staff, validate({ params: uuidParam, body: updateAssignmentSchema }), asyncHandler(async (req, res) => {
  const a = await assignmentsService.update(currentUser(req), req.params.id, req.body);
  await audit(req, 'assignment.updated', 'Assignment', a.id, { status: a.status });
  ok(res, a);
}));
assignmentsRouter.delete('/:id', staff, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await assignmentsService.remove(currentUser(req), req.params.id);
  await audit(req, 'assignment.deleted', 'Assignment', req.params.id);
  noContent(res);
}));
assignmentsRouter.put('/:id/submission', student, validate({ params: uuidParam, body: saveSubmissionSchema }), asyncHandler(async (req, res) => {
  ok(res, await submissionsService.save(currentUser(req), req.params.id, req.body));
}));
assignmentsRouter.post('/:id/submission/submit', student, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await submissionsService.submit(currentUser(req), req.params.id));
}));

// ───── /submissions ─────
export const submissionsRouter = Router();
submissionsRouter.use(authenticate);

submissionsRouter.get('/', validate({ query: listSubmissionsQuery }), asyncHandler(async (req, res) => {
  const r = await submissionsService.list(currentUser(req), req.query as never);
  ok(res, r.items, r.meta);
}));
submissionsRouter.get('/:id', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await submissionsService.get(currentUser(req), req.params.id));
}));
submissionsRouter.post('/:id/start-review', staff, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await submissionsService.startReview(currentUser(req), req.params.id));
}));
submissionsRouter.post('/:id/feedback', staff, validate({ params: uuidParam, body: feedbackSchema }), asyncHandler(async (req, res) => {
  const result = await submissionsService.feedback(currentUser(req), req.params.id, req.body);
  await audit(req, 'submission.feedback', 'AssignmentSubmission', req.params.id, { decision: req.body.decision });
  ok(res, result);
}));

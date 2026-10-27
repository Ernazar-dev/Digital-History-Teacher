import { Router } from 'express';
import { z } from 'zod';
import { authenticate, optionalAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { uuidParam } from '../../shared/validators/common';
import { responsesService } from './responses.service';
import {
  idOrSlug,
  listObjectsQuery,
  objectBodySchema,
  responseParam,
  responseReviewSchema,
  responseSchema,
  updateObjectSchema,
} from './virtual.schemas';
import { virtualService } from './virtual.service';

export const virtualRouter = Router();
const admin = [authenticate, requireRole('ADMIN')];
const reviewer = [authenticate, requireRole('ADMIN', 'TEACHER')];
const student = [authenticate, requireRole('STUDENT')];

virtualRouter.get('/', optionalAuth, validate({ query: listObjectsQuery }), asyncHandler(async (req, res) => {
  const r = await virtualService.list(req.user, req.query as never);
  ok(res, r.items, r.meta);
}));

// Talaba javoblari (aniq marshrutlar :id dan oldin)
virtualRouter.get('/responses/mine', ...student, asyncHandler(async (req, res) => {
  ok(res, await responsesService.listMine(currentUser(req)));
}));
virtualRouter.get('/responses/:responseId', authenticate, validate({ params: responseParam }), asyncHandler(async (req, res) => {
  ok(res, await responsesService.get(currentUser(req), req.params.responseId));
}));
virtualRouter.post(
  '/responses/:responseId/review',
  ...reviewer,
  validate({ params: responseParam, body: responseReviewSchema }),
  asyncHandler(async (req, res) => {
    const result = await responsesService.review(currentUser(req), req.params.responseId, req.body);
    await audit(req, 'virtual_response.reviewed', 'VirtualObjectResponse', req.params.responseId, { decision: req.body.decision });
    ok(res, result);
  }),
);

virtualRouter.get('/:id', optionalAuth, validate({ params: idOrSlug }), asyncHandler(async (req, res) => {
  ok(res, await virtualService.get(req.user, req.params.id));
}));
virtualRouter.post('/', ...admin, validate({ body: objectBodySchema }), asyncHandler(async (req, res) => {
  const object = await virtualService.create(currentUser(req), req.body);
  await audit(req, 'virtual_object.created', 'VirtualObject', object.id);
  created(res, object);
}));
virtualRouter.patch('/:id', ...admin, validate({ params: uuidParam, body: updateObjectSchema }), asyncHandler(async (req, res) => {
  const object = await virtualService.update(currentUser(req), req.params.id, req.body);
  await audit(req, 'virtual_object.updated', 'VirtualObject', object.id);
  ok(res, object);
}));
virtualRouter.patch(
  '/:id/active',
  ...admin,
  validate({ params: uuidParam, body: z.object({ isActive: z.boolean() }) }),
  asyncHandler(async (req, res) => {
    const object = await virtualService.update(currentUser(req), req.params.id, { isActive: req.body.isActive });
    await audit(req, req.body.isActive ? 'virtual_object.activated' : 'virtual_object.hidden', 'VirtualObject', object.id);
    ok(res, object);
  }),
);
virtualRouter.delete('/:id', ...admin, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await virtualService.remove(req.params.id);
  await audit(req, 'virtual_object.deleted', 'VirtualObject', req.params.id);
  noContent(res);
}));

virtualRouter.put('/:id/response', ...student, validate({ params: uuidParam, body: responseSchema }), asyncHandler(async (req, res) => {
  ok(res, await responsesService.save(currentUser(req), req.params.id, req.body));
}));
virtualRouter.post('/:id/response/submit', ...student, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await responsesService.submit(currentUser(req), req.params.id));
}));
virtualRouter.get('/:id/responses', ...reviewer, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await responsesService.listForObject(currentUser(req), req.params.id));
}));

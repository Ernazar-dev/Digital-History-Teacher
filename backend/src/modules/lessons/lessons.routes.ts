import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { uuidParam } from '../../shared/validators/common';
import { lessonBodySchema, lessonReviewSchema, listLessonsQuery, updateLessonSchema, versionParam } from './lessons.schemas';
import { lessonsService } from './lessons.service';

export const lessonsRouter = Router();
lessonsRouter.use(authenticate);

lessonsRouter.get('/', validate({ query: listLessonsQuery }), asyncHandler(async (req, res) => {
  const r = await lessonsService.list(currentUser(req), req.query as never);
  ok(res, r.items, r.meta);
}));
lessonsRouter.get('/:id', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await lessonsService.get(currentUser(req), req.params.id));
}));
lessonsRouter.get('/:id/versions/:version', validate({ params: versionParam }), asyncHandler(async (req, res) => {
  const { id, version } = req.params as unknown as { id: string; version: number };
  ok(res, await lessonsService.getVersion(currentUser(req), id, version));
}));
lessonsRouter.post('/', validate({ body: lessonBodySchema }), asyncHandler(async (req, res) => {
  created(res, await lessonsService.create(currentUser(req), req.body));
}));
lessonsRouter.patch('/:id', validate({ params: uuidParam, body: updateLessonSchema }), asyncHandler(async (req, res) => {
  ok(res, await lessonsService.update(currentUser(req), req.params.id, req.body));
}));
lessonsRouter.post('/:id/submit', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await lessonsService.submit(currentUser(req), req.params.id));
}));
lessonsRouter.post(
  '/:id/review',
  requireRole('ADMIN', 'TEACHER'),
  validate({ params: uuidParam, body: lessonReviewSchema }),
  asyncHandler(async (req, res) => {
    const result = await lessonsService.review(currentUser(req), req.params.id, req.body);
    await audit(req, 'lesson.reviewed', 'LessonPlan', req.params.id, { decision: req.body.decision });
    ok(res, result);
  }),
);
lessonsRouter.delete('/:id', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await lessonsService.remove(currentUser(req), req.params.id);
  noContent(res);
}));

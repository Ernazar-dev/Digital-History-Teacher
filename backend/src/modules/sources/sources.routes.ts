import { Router } from 'express';
import { authenticate, optionalAuth, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { uuidParam } from '../../shared/validators/common';
import { sourcesController } from './sources.controller';
import { idOrSlugParam, listSourcesQuery, sourceBodySchema, updateSourceSchema } from './sources.schemas';

export const sourcesRouter = Router();
const staff = [authenticate, requireRole('ADMIN', 'TEACHER')];

sourcesRouter.get('/', optionalAuth, validate({ query: listSourcesQuery }), asyncHandler(sourcesController.list));
sourcesRouter.get('/:id', optionalAuth, validate({ params: idOrSlugParam }), asyncHandler(sourcesController.get));
sourcesRouter.post('/', ...staff, validate({ body: sourceBodySchema }), asyncHandler(sourcesController.create));
sourcesRouter.patch('/:id', ...staff, validate({ params: uuidParam, body: updateSourceSchema }), asyncHandler(sourcesController.update));
sourcesRouter.delete('/:id', ...staff, validate({ params: uuidParam }), asyncHandler(sourcesController.remove));

import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { uuidParam } from '../../shared/validators/common';
import { usersController } from './users.controller';
import { adminResetPasswordSchema, createUserSchema, listUsersQuery, setGroupSchema, updateUserSchema } from './users.schemas';

export const usersRouter = Router();
usersRouter.use(authenticate);

usersRouter.get('/', requireRole('ADMIN', 'TEACHER'), validate({ query: listUsersQuery }), asyncHandler(usersController.list));
usersRouter.post('/', requireRole('ADMIN'), validate({ body: createUserSchema }), asyncHandler(usersController.create));
usersRouter.get('/:id', requireRole('ADMIN'), validate({ params: uuidParam }), asyncHandler(usersController.get));
usersRouter.patch(
  '/:id',
  requireRole('ADMIN'),
  validate({ params: uuidParam, body: updateUserSchema }),
  asyncHandler(usersController.update),
);
usersRouter.post('/:id/approve', requireRole('ADMIN'), validate({ params: uuidParam }), asyncHandler(usersController.approve));
usersRouter.post(
  '/:id/reset-password',
  requireRole('ADMIN'),
  validate({ params: uuidParam, body: adminResetPasswordSchema }),
  asyncHandler(usersController.resetPassword),
);
usersRouter.post(
  '/:id/group',
  requireRole('ADMIN'),
  validate({ params: uuidParam, body: setGroupSchema }),
  asyncHandler(usersController.setGroup),
);
usersRouter.delete('/:id', requireRole('ADMIN'), validate({ params: uuidParam }), asyncHandler(usersController.remove));

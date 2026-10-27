import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { uuidParam } from '../../shared/validators/common';
import { groupsController } from './groups.controller';
import { createGroupSchema, memberParam, membersSchema, updateGroupSchema } from './groups.schemas';

export const groupsRouter = Router();
// Ro'yxatdan o'tish formasi uchun: faqat guruh nomlari (login talab qilinmaydi)
groupsRouter.get('/public', asyncHandler(groupsController.publicList));
groupsRouter.use(authenticate);

const manage = requireRole('ADMIN', 'TEACHER');

groupsRouter.get('/', asyncHandler(groupsController.list));
groupsRouter.post('/', manage, validate({ body: createGroupSchema }), asyncHandler(groupsController.create));
groupsRouter.get('/:id', validate({ params: uuidParam }), asyncHandler(groupsController.get));
groupsRouter.patch('/:id', manage, validate({ params: uuidParam, body: updateGroupSchema }), asyncHandler(groupsController.update));
groupsRouter.delete('/:id', manage, validate({ params: uuidParam }), asyncHandler(groupsController.remove));
groupsRouter.post('/:id/join', requireRole('STUDENT'), validate({ params: uuidParam }), asyncHandler(groupsController.join));
groupsRouter.post(
  '/:id/members',
  manage,
  validate({ params: uuidParam, body: membersSchema }),
  asyncHandler(groupsController.addMembers),
);
groupsRouter.delete(
  '/:id/members/:studentId',
  manage,
  validate({ params: memberParam }),
  asyncHandler(groupsController.removeMember),
);

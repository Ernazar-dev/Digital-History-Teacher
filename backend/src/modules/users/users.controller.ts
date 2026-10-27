import type { Request, Response } from 'express';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { usersService } from './users.service';

export const usersController = {
  async list(req: Request, res: Response) {
    const result = await usersService.list(currentUser(req), req.query as never);
    ok(res, result.items, result.meta);
  },
  async get(req: Request, res: Response) {
    ok(res, await usersService.get(req.params.id));
  },
  async create(req: Request, res: Response) {
    const user = await usersService.create(req.body);
    await audit(req, 'user.created', 'User', user.id, { role: user.role });
    created(res, user);
  },
  async update(req: Request, res: Response) {
    const user = await usersService.update(currentUser(req), req.params.id, req.body);
    await audit(req, 'user.updated', 'User', user.id, req.body);
    ok(res, user);
  },
  async approve(req: Request, res: Response) {
    const user = await usersService.update(currentUser(req), req.params.id, { status: 'ACTIVE' });
    await audit(req, 'user.approved', 'User', user.id);
    ok(res, user);
  },
  async remove(req: Request, res: Response) {
    await usersService.remove(currentUser(req), req.params.id);
    await audit(req, 'user.deleted', 'User', req.params.id);
    noContent(res);
  },
  async setGroup(req: Request, res: Response) {
    await usersService.setGroup(req.params.id, req.body.groupId);
    await audit(req, 'user.group_set', 'User', req.params.id, req.body);
    noContent(res);
  },
  async resetPassword(req: Request, res: Response) {
    await usersService.resetPassword(req.params.id, req.body.password);
    await audit(req, 'user.password_reset', 'User', req.params.id);
    noContent(res);
  },
};

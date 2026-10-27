import type { Request, Response } from 'express';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { groupsService } from './groups.service';

export const groupsController = {
  async list(req: Request, res: Response) {
    ok(res, await groupsService.list(currentUser(req)));
  },
  async publicList(_req: Request, res: Response) {
    ok(res, await groupsService.publicList());
  },
  async join(req: Request, res: Response) {
    await groupsService.join(currentUser(req), req.params.id);
    await audit(req, 'group.joined', 'Group', req.params.id);
    noContent(res);
  },
  async get(req: Request, res: Response) {
    ok(res, await groupsService.get(currentUser(req), req.params.id));
  },
  async create(req: Request, res: Response) {
    const group = await groupsService.create(currentUser(req), req.body);
    await audit(req, 'group.created', 'Group', group.id);
    created(res, group);
  },
  async update(req: Request, res: Response) {
    ok(res, await groupsService.update(currentUser(req), req.params.id, req.body));
  },
  async remove(req: Request, res: Response) {
    await groupsService.remove(currentUser(req), req.params.id);
    await audit(req, 'group.deleted', 'Group', req.params.id);
    noContent(res);
  },
  async addMembers(req: Request, res: Response) {
    const group = await groupsService.addMembers(currentUser(req), req.params.id, req.body.studentIds);
    await audit(req, 'group.members_added', 'Group', req.params.id, { studentIds: req.body.studentIds });
    ok(res, group);
  },
  async removeMember(req: Request, res: Response) {
    await groupsService.removeMember(currentUser(req), req.params.id, req.params.studentId);
    await audit(req, 'group.member_removed', 'Group', req.params.id, { studentId: req.params.studentId });
    noContent(res);
  },
};

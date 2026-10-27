import type { Request, Response } from 'express';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { sourcesService } from './sources.service';

export const sourcesController = {
  async list(req: Request, res: Response) {
    const result = await sourcesService.list(req.user, req.query as never);
    ok(res, result.items, result.meta);
  },
  async get(req: Request, res: Response) {
    ok(res, await sourcesService.get(req.user, req.params.id));
  },
  async create(req: Request, res: Response) {
    const source = await sourcesService.create(currentUser(req), req.body);
    await audit(req, 'source.created', 'HistoricalSource', source.id, { status: source.status });
    created(res, source);
  },
  async update(req: Request, res: Response) {
    const source = await sourcesService.update(currentUser(req), req.params.id, req.body);
    await audit(req, 'source.updated', 'HistoricalSource', source.id, { status: source.status });
    ok(res, source);
  },
  async remove(req: Request, res: Response) {
    await sourcesService.remove(currentUser(req), req.params.id);
    await audit(req, 'source.deleted', 'HistoricalSource', req.params.id);
    noContent(res);
  },
};

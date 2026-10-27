import { Router } from 'express';
import { z } from 'zod';
import { optionalAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ok } from '../../shared/utils/http';
import { exploreService, SEARCH_TYPES, type SearchType } from './explore.service';

export const exploreRouter = Router();
exploreRouter.use(optionalAuth);

const searchQuery = z.object({
  q: z.string().trim().min(2, 'Kamida 2 belgi kiriting').max(200),
  types: z
    .string()
    .optional()
    .transform((s) => (s ? s.split(',').filter((t): t is SearchType => (SEARCH_TYPES as readonly string[]).includes(t)) : [])),
  periodId: z.string().uuid().optional(),
});

exploreRouter.get('/search', validate({ query: searchQuery }), asyncHandler(async (req, res) => {
  const q = req.query as unknown as z.infer<typeof searchQuery>;
  ok(res, await exploreService.search(req.user, q.q, q.types, q.periodId));
}));
exploreRouter.get('/map', validate({ query: z.object({ periodId: z.string().uuid().optional() }) }), asyncHandler(async (req, res) => {
  ok(res, await exploreService.mapFeatures(req.user, (req.query as { periodId?: string }).periodId));
}));
exploreRouter.get('/timeline', asyncHandler(async (req, res) => ok(res, await exploreService.timeline(req.user))));

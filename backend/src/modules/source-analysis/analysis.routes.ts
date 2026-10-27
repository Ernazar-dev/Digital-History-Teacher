import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { uuidParam } from '../../shared/validators/common';
import { sourceTypeEnum } from '../sources/sources.schemas';
import {
  createAnalysisSchema,
  createComparisonSchema,
  listWorkQuery,
  reviewSchema,
  updateAnalysisSchema,
  updateComparisonSchema,
} from './analysis.schemas';
import { analysisService } from './analysis.service';
import { getAnalysisTemplate } from './analysis.templates';
import { comparisonService } from './comparison.service';

const reviewer = requireRole('ADMIN', 'TEACHER');
const student = requireRole('STUDENT');

// ───── /source-analyses ─────
export const analysesRouter = Router();
analysesRouter.use(authenticate);

analysesRouter.get(
  '/template/:type',
  validate({ params: z.object({ type: sourceTypeEnum }) }),
  asyncHandler(async (req, res) => ok(res, getAnalysisTemplate(req.params.type as never))),
);
analysesRouter.get('/', validate({ query: listWorkQuery }), asyncHandler(async (req, res) => {
  const r = await analysisService.list(currentUser(req), req.query as never);
  ok(res, r.items, r.meta);
}));
analysesRouter.get('/:id', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await analysisService.get(currentUser(req), req.params.id));
}));
analysesRouter.post('/', student, validate({ body: createAnalysisSchema }), asyncHandler(async (req, res) => {
  created(res, await analysisService.create(currentUser(req), req.body.sourceId, req.body.answers));
}));
analysesRouter.patch('/:id', student, validate({ params: uuidParam, body: updateAnalysisSchema }), asyncHandler(async (req, res) => {
  ok(res, await analysisService.update(currentUser(req), req.params.id, req.body.answers));
}));
analysesRouter.post('/:id/submit', student, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await analysisService.submit(currentUser(req), req.params.id));
}));
analysesRouter.post('/:id/review', reviewer, validate({ params: uuidParam, body: reviewSchema }), asyncHandler(async (req, res) => {
  const result = await analysisService.review(currentUser(req), req.params.id, req.body);
  await audit(req, 'analysis.reviewed', 'SourceAnalysis', req.params.id, { decision: req.body.decision });
  ok(res, result);
}));
analysesRouter.delete('/:id', student, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await analysisService.remove(currentUser(req), req.params.id);
  noContent(res);
}));

// ───── /source-comparisons ─────
export const comparisonsRouter = Router();
comparisonsRouter.use(authenticate);

comparisonsRouter.get('/', validate({ query: listWorkQuery }), asyncHandler(async (req, res) => {
  const r = await comparisonService.list(currentUser(req), req.query as never);
  ok(res, r.items, r.meta);
}));
comparisonsRouter.get('/:id', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await comparisonService.get(currentUser(req), req.params.id));
}));
comparisonsRouter.post('/', student, validate({ body: createComparisonSchema }), asyncHandler(async (req, res) => {
  created(res, await comparisonService.create(currentUser(req), req.body));
}));
comparisonsRouter.patch('/:id', student, validate({ params: uuidParam, body: updateComparisonSchema }), asyncHandler(async (req, res) => {
  ok(res, await comparisonService.update(currentUser(req), req.params.id, req.body));
}));
comparisonsRouter.post('/:id/submit', student, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await comparisonService.submit(currentUser(req), req.params.id));
}));
comparisonsRouter.post('/:id/review', reviewer, validate({ params: uuidParam, body: reviewSchema }), asyncHandler(async (req, res) => {
  const result = await comparisonService.review(currentUser(req), req.params.id, req.body);
  await audit(req, 'comparison.reviewed', 'SourceComparison', req.params.id, { decision: req.body.decision });
  ok(res, result);
}));
comparisonsRouter.delete('/:id', student, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await comparisonService.remove(currentUser(req), req.params.id);
  noContent(res);
}));

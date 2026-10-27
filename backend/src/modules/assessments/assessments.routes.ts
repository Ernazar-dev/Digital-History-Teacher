import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { uuidParam } from '../../shared/validators/common';
import {
  componentSchema, criterionSchema, expertRecordSchema, groupParam, indicatorRatingSchema, indicatorSchema, levelsSchema,
  stageQuery, studentParam, updateComponentSchema, weightsSchema,
} from './assessments.schemas';
import { assessmentsService } from './assessments.service';

export const assessmentsRouter = Router();
assessmentsRouter.use(authenticate);

const admin = requireRole('ADMIN');
const staff = requireRole('ADMIN', 'TEACHER');

assessmentsRouter.get('/config', asyncHandler(async (_req, res) => ok(res, await assessmentsService.config())));

// ───── Konfiguratsiya (faqat admin) ─────
assessmentsRouter.post('/components', admin, validate({ body: componentSchema }), asyncHandler(async (req, res) => {
  const c = await assessmentsService.createComponent(req.body);
  await audit(req, 'assessment.component_created', 'AssessmentComponent', c.id);
  created(res, c);
}));
assessmentsRouter.patch('/components/:id', admin, validate({ params: uuidParam, body: updateComponentSchema }), asyncHandler(async (req, res) => {
  const c = await assessmentsService.updateComponent(req.params.id, req.body);
  await audit(req, 'assessment.component_updated', 'AssessmentComponent', c.id, req.body);
  ok(res, c);
}));
assessmentsRouter.delete('/components/:id', admin, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await assessmentsService.deleteComponent(req.params.id);
  await audit(req, 'assessment.component_deleted', 'AssessmentComponent', req.params.id);
  noContent(res);
}));
assessmentsRouter.put('/components/:id/weights', admin, validate({ params: uuidParam, body: weightsSchema }), asyncHandler(async (req, res) => {
  const w = await assessmentsService.replaceWeights(req.params.id, req.body);
  await audit(req, 'assessment.weights_updated', 'AssessmentComponent', req.params.id, req.body);
  ok(res, w);
}));
assessmentsRouter.post('/components/:id/criteria', admin, validate({ params: uuidParam, body: criterionSchema }), asyncHandler(async (req, res) => {
  created(res, await assessmentsService.createCriterion(req.params.id, req.body));
}));
assessmentsRouter.patch('/criteria/:id', admin, validate({ params: uuidParam, body: criterionSchema.partial() }), asyncHandler(async (req, res) => {
  ok(res, await assessmentsService.updateCriterion(req.params.id, req.body));
}));
assessmentsRouter.delete('/criteria/:id', admin, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await assessmentsService.deleteCriterion(req.params.id);
  noContent(res);
}));
assessmentsRouter.post('/criteria/:id/indicators', admin, validate({ params: uuidParam, body: indicatorSchema }), asyncHandler(async (req, res) => {
  created(res, await assessmentsService.createIndicator(req.params.id, req.body));
}));
assessmentsRouter.patch('/indicators/:id', admin, validate({ params: uuidParam, body: indicatorSchema.partial() }), asyncHandler(async (req, res) => {
  ok(res, await assessmentsService.updateIndicator(req.params.id, req.body));
}));
assessmentsRouter.delete('/indicators/:id', admin, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await assessmentsService.deleteIndicator(req.params.id);
  noContent(res);
}));
assessmentsRouter.put('/levels', admin, validate({ body: levelsSchema }), asyncHandler(async (req, res) => {
  const levels = await assessmentsService.replaceLevels(req.body);
  await audit(req, 'assessment.levels_updated', 'AssessmentLevel', null, req.body);
  ok(res, levels);
}));

// ───── Natijalar ─────
assessmentsRouter.get('/me/profile', validate({ query: stageQuery }), asyncHandler(async (req, res) => {
  const user = currentUser(req);
  ok(res, await assessmentsService.profile(user, user.id, (req.query as { stage?: never }).stage));
}));
assessmentsRouter.get('/students/:studentId/profile', validate({ params: studentParam, query: stageQuery }), asyncHandler(async (req, res) => {
  ok(res, await assessmentsService.profile(currentUser(req), req.params.studentId, (req.query as { stage?: never }).stage));
}));
assessmentsRouter.get('/students/:studentId/dynamics', validate({ params: studentParam }), asyncHandler(async (req, res) => {
  ok(res, await assessmentsService.dynamics(currentUser(req), req.params.studentId));
}));
assessmentsRouter.get('/students/:studentId/records', validate({ params: studentParam }), asyncHandler(async (req, res) => {
  ok(res, await assessmentsService.records(currentUser(req), req.params.studentId));
}));
assessmentsRouter.post('/records', staff, validate({ body: expertRecordSchema }), asyncHandler(async (req, res) => {
  const record = await assessmentsService.expertRecord(currentUser(req), req.body);
  await audit(req, 'assessment.expert_record', 'CompetenceRecord', record.id, { studentId: req.body.studentId });
  created(res, record);
}));
assessmentsRouter.get('/groups/:groupId/summary', staff, validate({ params: groupParam }), asyncHandler(async (req, res) => {
  ok(res, await assessmentsService.groupSummary(currentUser(req), req.params.groupId));
}));
assessmentsRouter.get('/groups/:groupId/export.csv', staff, validate({ params: groupParam }), asyncHandler(async (req, res) => {
  const { filename, content } = await assessmentsService.groupCsv(currentUser(req), req.params.groupId);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
  res.send(content);
}));
assessmentsRouter.get('/experiment', staff, asyncHandler(async (req, res) => {
  ok(res, await assessmentsService.experiment(currentUser(req)));
}));
assessmentsRouter.post('/indicator-ratings', staff, validate({ body: indicatorRatingSchema }), asyncHandler(async (req, res) => {
  const record = await assessmentsService.rateIndicators(currentUser(req), req.body);
  await audit(req, 'assessment.indicator_rating', 'CompetenceRecord', record.id, { studentId: req.body.studentId });
  created(res, record);
}));

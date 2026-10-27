import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { env } from '../../config/env';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { uploadLimiter } from '../../shared/security/limiters';
import { AppError } from '../../shared/errors/AppError';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { uuidParam } from '../../shared/validators/common';
import { itemUpdateSchema, reflectionSchema, summarySchema } from './portfolios.schemas';
import { portfoliosService } from './portfolios.service';

export const portfoliosRouter = Router();
portfoliosRouter.use(authenticate);
const student = requireRole('STUDENT');

portfoliosRouter.get('/me', student, asyncHandler(async (req, res) => {
  const user = currentUser(req);
  ok(res, await portfoliosService.get(user, user.id));
}));
portfoliosRouter.patch('/me', student, validate({ body: summarySchema }), asyncHandler(async (req, res) => {
  ok(res, await portfoliosService.updateSummary(currentUser(req), req.body.summary));
}));
portfoliosRouter.get(
  '/students/:studentId',
  validate({ params: z.object({ studentId: z.string().uuid() }) }),
  asyncHandler(async (req, res) => ok(res, await portfoliosService.get(currentUser(req), req.params.studentId))),
);
portfoliosRouter.get('/items/:id', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  ok(res, await portfoliosService.getItem(currentUser(req), req.params.id));
}));
portfoliosRouter.patch('/items/:id', student, validate({ params: uuidParam, body: itemUpdateSchema }), asyncHandler(async (req, res) => {
  ok(res, await portfoliosService.updateItem(currentUser(req), req.params.id, req.body));
}));
portfoliosRouter.post('/reflections', student, validate({ body: reflectionSchema }), asyncHandler(async (req, res) => {
  created(res, await portfoliosService.createReflection(currentUser(req), req.body));
}));
portfoliosRouter.patch('/reflections/:id', student, validate({ params: uuidParam, body: reflectionSchema.partial() }), asyncHandler(async (req, res) => {
  ok(res, await portfoliosService.updateReflection(currentUser(req), req.params.id, req.body));
}));
portfoliosRouter.delete('/reflections/:id', student, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await portfoliosService.deleteReflection(currentUser(req), req.params.id);
  noContent(res);
}));

// ── Elektron portfolio fayllari (profil sahifasida talabaning o'zi yuklaydi) ──
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 } });
const fileTitle = z.object({ title: z.string().trim().max(200).optional() });

portfoliosRouter.get('/me/files', student, asyncHandler(async (req, res) => {
  const user = currentUser(req);
  ok(res, await portfoliosService.listFiles(user, user.id));
}));
portfoliosRouter.post('/me/files', student, uploadLimiter, upload.single('file'), validate({ body: fileTitle }), asyncHandler(async (req, res) => {
  if (!req.file) throw AppError.badRequest('Fayl yuborilmadi');
  created(res, await portfoliosService.addFile(currentUser(req), req.file, req.body.title));
}));
portfoliosRouter.get(
  '/students/:studentId/files',
  validate({ params: z.object({ studentId: z.string().uuid() }) }),
  asyncHandler(async (req, res) => ok(res, await portfoliosService.listFiles(currentUser(req), req.params.studentId))),
);
portfoliosRouter.delete('/files/:id', student, validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await portfoliosService.removeFile(currentUser(req), req.params.id);
  noContent(res);
}));
portfoliosRouter.get('/files/:id/download', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  const { file, stream } = await portfoliosService.openFile(currentUser(req), req.params.id);
  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`);
  res.setHeader('Cache-Control', 'private, no-store');
  stream.pipe(res);
}));

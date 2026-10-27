import { Router } from 'express';
import multer from 'multer';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { uploadLimiter } from '../../shared/security/limiters';
import { AppError } from '../../shared/errors/AppError';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent } from '../../shared/utils/http';
import { uuidParam } from '../../shared/validators/common';
import { ALLOWED_MIME_TYPES, mediaService } from './media.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(AppError.badRequest('Fayl turi ruxsat etilmagan'));
  },
});

export const mediaRouter = Router();

mediaRouter.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'TEACHER'),
  uploadLimiter,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw AppError.badRequest('Fayl yuborilmadi');
    const file = await mediaService.upload(req.file, currentUser(req).id);
    await audit(req, 'media.uploaded', 'MediaFile', file.id, { mimeType: file.mimeType, size: file.size });
    created(res, file);
  }),
);

/** Katalog media fayllari ochiq o'qiladi (manba sahifalarida ko'rsatish uchun) */
mediaRouter.get(
  '/:id',
  validate({ params: uuidParam }),
  asyncHandler(async (req, res) => {
    // Talabaning portfolio fayllari ochiq emas — ular /portfolios/files/:id orqali (ruxsat tekshiruvi bilan) beriladi
    if (await prisma.portfolioItem.findFirst({ where: { refType: 'MediaFile', refId: req.params.id }, select: { id: true } })) {
      throw AppError.notFound('Fayl topilmadi');
    }
    const { file, stream } = await mediaService.getForDownload(req.params.id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.originalName)}`);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    stream.pipe(res);
  }),
);

mediaRouter.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validate({ params: uuidParam }),
  asyncHandler(async (req, res) => {
    await mediaService.remove(req.params.id);
    await audit(req, 'media.deleted', 'MediaFile', req.params.id);
    noContent(res);
  }),
);

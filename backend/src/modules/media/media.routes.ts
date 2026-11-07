import { Readable } from 'node:stream';
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

/**
 * «Range: bytes=boshi-oxiri» sarlavhasi → [boshi, oxiri]. Sarlavha yo'q yoki tushunarsiz bo'lsa null (butun fayl beriladi),
 * fayl chegarasidan tashqarida bo'lsa 'invalid' (416).
 */
export const parseRange = (header: string | undefined, size: number): [number, number] | 'invalid' | null => {
  if (!header || !header.startsWith('bytes=') || header.includes(',')) return null;
  const [from, to, ...rest] = header.slice(6).trim().split('-');
  if (rest.length || (from === '' && !to) || !/^[0-9]*$/.test(from) || !/^[0-9]*$/.test(to ?? '')) return null;
  const start = from === '' ? Math.max(0, size - Number(to)) : Number(from);
  const end = from === '' || !to ? size - 1 : Math.min(Number(to), size - 1);
  return start > end || start >= size ? 'invalid' : [start, end];
};

/** Oqimdan faqat [start, end] baytlarni ajratib beradi; kerakli joyga yetgach manba oqimini to'xtatadi */
async function* sliceBytes(source: Readable, start: number, end: number) {
  let pos = 0;
  for await (const chunk of source) {
    const buf = Buffer.from(chunk);
    const from = Math.max(start - pos, 0);
    const to = Math.min(end - pos + 1, buf.length);
    pos += buf.length;
    if (to > from) yield buf.subarray(from, to);
    if (pos > end) break;
  }
}

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
    // Fayl id bo'yicha o'zgarmas (yangi yuklash — yangi id), shuning uchun id ETag vazifasini bajaradi:
    // brauzer qayta so'rasa baytlar bazadan o'qilmaydi (StoredFile.data og'ir).
    const etag = `"${req.params.id}"`;
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=604800');
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }
    const { file, stream } = await mediaService.getForDownload(req.params.id);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(file.originalName)}`);
    // Video/audio'ni oldinga-orqaga surish (seek) uchun Range so'rovlari qo'llanadi
    res.setHeader('Accept-Ranges', 'bytes');
    const range = parseRange(req.headers.range, file.size);
    if (range === 'invalid') {
      stream.destroy();
      res.setHeader('Content-Range', `bytes */${file.size}`);
      res.status(416).end();
      return;
    }
    if (range) {
      const [start, end] = range;
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${file.size}`);
      res.setHeader('Content-Length', String(end - start + 1));
      Readable.from(sliceBytes(stream, start, end)).pipe(res);
      return;
    }
    res.setHeader('Content-Length', String(file.size));
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

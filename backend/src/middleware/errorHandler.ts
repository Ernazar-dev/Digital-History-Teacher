import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../shared/errors/AppError';
import { logger } from '../shared/logger';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(AppError.notFound(`Marshrut topilmadi: ${req.method} ${req.path}`));
};

/** Barcha xatolar yagona formatda qaytariladi: { error: { code, message, details? } } */
export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Kiritilgan ma’lumotlar noto‘g‘ri',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
  }
  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Fayl hajmi ruxsat etilganidan katta' : err.message;
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message } });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: { code: 'CONFLICT', message: 'Bunday yozuv allaqachon mavjud' } });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ma’lumot topilmadi' } });
    }
    if (err.code === 'P2003') {
      return res.status(409).json({
        error: { code: 'CONFLICT', message: 'Bog‘langan yozuvlar mavjudligi sababli amal bajarilmadi' },
      });
    }
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'JSON formati noto‘g‘ri' } });
  }
  // body-parser xatolari (juda katta so'rov, noto'g'ri kodlash) — mijoz xatosi, 500 emas
  const bodyErr = err as { type?: string; status?: number };
  if (bodyErr?.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'BAD_REQUEST', message: 'So‘rov hajmi juda katta' } });
  }
  if (typeof bodyErr?.status === 'number' && bodyErr.status >= 400 && bodyErr.status < 500 && typeof bodyErr.type === 'string') {
    return res.status(bodyErr.status).json({ error: { code: 'BAD_REQUEST', message: 'So‘rov noto‘g‘ri' } });
  }
  logger.error({ err, path: req.path, method: req.method }, 'Kutilmagan xato');
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Serverda ichki xato yuz berdi' } });
};

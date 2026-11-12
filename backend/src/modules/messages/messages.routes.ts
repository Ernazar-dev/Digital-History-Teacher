import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { AppError } from '../../shared/errors/AppError';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { created, noContent, ok } from '../../shared/utils/http';
import { paginationQuery, uuidParam } from '../../shared/validators/common';

/** Bir IP dan soatiga 5 ta xabar — spamga qarshi */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.isTest ? 100_000 : 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Juda ko‘p xabar yuborildi. Keyinroq urinib ko‘ring.' } },
});

const blank = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);
const contactSchema = z.object({
  name: z.string().trim().min(2, 'Ismni kiriting').max(120),
  email: z.preprocess(blank, z.string().trim().email('Email noto‘g‘ri').max(160).optional()),
  phone: z.preprocess(blank, z.string().trim().regex(/^[+\d][\d\s()-]{5,24}$/, 'Telefon raqami noto‘g‘ri').optional()),
  message: z.string().trim().min(5, 'Xabar juda qisqa').max(3000),
}).refine((d) => d.email || d.phone, { message: 'Email yoki telefon raqamini kiriting', path: ['email'] });

const listQuery = paginationQuery.extend({ unread: z.enum(['true', 'false']).optional() });

export const messagesRouter = Router();

/** Ochiq forma: mehmon xabar yuboradi */
messagesRouter.post('/', contactLimiter, validate({ body: contactSchema }), asyncHandler(async (req, res) => {
  await prisma.contactMessage.create({ data: req.body });
  created(res, { sent: true });
}));

// Quyidagilar — faqat administrator
messagesRouter.use(authenticate, requireRole('ADMIN'));

messagesRouter.get('/', validate({ query: listQuery }), asyncHandler(async (req, res) => {
  const { page, pageSize, unread } = req.query as unknown as z.infer<typeof listQuery>;
  const where = unread === 'true' ? { isRead: false } : {};
  const [items, total] = await Promise.all([
    prisma.contactMessage.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.contactMessage.count({ where }),
  ]);
  ok(res, items, { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}));

messagesRouter.get('/unread-count', asyncHandler(async (_req, res) => {
  ok(res, { count: await prisma.contactMessage.count({ where: { isRead: false } }) });
}));

messagesRouter.patch('/:id', validate({ params: uuidParam, body: z.object({ isRead: z.boolean() }) }), asyncHandler(async (req, res) => {
  const row = await prisma.contactMessage.update({ where: { id: req.params.id }, data: { isRead: req.body.isRead } }).catch(() => null);
  if (!row) throw AppError.notFound('Xabar topilmadi');
  ok(res, row);
}));

messagesRouter.delete('/:id', validate({ params: uuidParam }), asyncHandler(async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: req.params.id } }).catch(() => {
    throw AppError.notFound('Xabar topilmadi');
  });
  noContent(res);
}));

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/prisma';
import { authenticate, requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { audit } from '../../shared/utils/audit';
import { buildMeta, ok } from '../../shared/utils/http';
import { optionalHttpUrl, paginationQuery } from '../../shared/validators/common';
import { settingsService } from '../settings/settings.service';

export const adminRouter = Router();
adminRouter.use(authenticate, requireRole('ADMIN'));

/** Logotip: tashqi http(s) havola yoki platformaga yuklangan rasm (/api/v1/media/<id>) */
const logoUrl = z.union([z.string().trim().regex(/^\/api\/v1\/media\/[0-9a-f-]{36}$/i), optionalHttpUrl]).transform((v) => v ?? '');

const settingsBody = z.object({
  'platform.name': z.string().trim().min(2).max(100).optional(),
  'platform.fullName': z.string().trim().max(500).optional(),
  'platform.description': z.string().trim().max(2000).optional(),
  'platform.logoUrl': logoUrl,
  'platform.institution': z.string().trim().max(300).optional(),
  'auth.studentAutoApprove': z.boolean().optional(),
});

adminRouter.get('/settings', asyncHandler(async (_req, res) => ok(res, await settingsService.getAll())));
adminRouter.put('/settings', validate({ body: settingsBody }), asyncHandler(async (req, res) => {
  const body = Object.fromEntries(Object.entries(req.body).filter(([, v]) => v !== undefined));
  const result = await settingsService.update(body);
  await audit(req, 'settings.updated', 'SystemSetting', null, body as Record<string, string | boolean>);
  ok(res, result);
}));

const auditQuery = paginationQuery.extend({
  entity: z.string().trim().max(60).optional(),
  action: z.string().trim().max(100).optional(),
});

adminRouter.get('/audit-logs', validate({ query: auditQuery }), asyncHandler(async (req, res) => {
  const q = req.query as unknown as z.infer<typeof auditQuery>;
  const where = {
    ...(q.entity ? { entity: q.entity } : {}),
    ...(q.action ? { action: { contains: q.action } } : {}),
  };
  const [total, items] = await prisma.$transaction([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { actor: { select: { id: true, fullName: true, username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
    }),
  ]);
  ok(res, items, buildMeta(q.page, q.pageSize, total));
}));

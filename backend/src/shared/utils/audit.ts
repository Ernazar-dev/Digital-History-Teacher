import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import { prisma } from '../../config/prisma';
import { logger } from '../logger';

/** Muhim (admin/o'qituvchi) amallar uchun audit yozuvi. Xato asosiy amalni to'xtatmaydi. */
export const audit = async (
  req: Request,
  action: string,
  entity: string,
  entityId?: string | null,
  meta?: Prisma.InputJsonValue,
): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: req.user?.id ?? null,
        action,
        entity,
        entityId: entityId ?? null,
        meta,
        ip: req.ip,
      },
    });
  } catch (err) {
    logger.error({ err, action, entity }, 'Audit log yozilmadi');
  }
};

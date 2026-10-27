import type { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { AppError } from '../shared/errors/AppError';

interface AccessPayload {
  sub: string;
  role: Role;
}

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
};

const resolveUser = async (token: string): Promise<Express.AuthUser> => {
  let payload: AccessPayload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as AccessPayload;
  } catch {
    throw AppError.unauthorized('Sessiya muddati tugagan yoki token yaroqsiz');
  }
  // Bloklangan/o'chirilgan foydalanuvchi darhol kirish huquqini yo'qotadi
  const user = await prisma.user.findFirst({
    where: { id: payload.sub, deletedAt: null },
    select: { id: true, role: true, username: true, fullName: true, status: true },
  });
  if (!user || user.status !== 'ACTIVE') throw AppError.unauthorized('Hisob faol emas');
  return { id: user.id, role: user.role, username: user.username, fullName: user.fullName };
};

/** Majburiy autentifikatsiya */
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) throw AppError.unauthorized();
    req.user = await resolveUser(token);
    next();
  } catch (err) {
    next(err);
  }
};

/** Ixtiyoriy autentifikatsiya — ochiq sahifalar uchun (token bo'lsa foydalanuvchi aniqlanadi) */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.user = await resolveUser(token);
  } catch {
    // Yaroqsiz token ochiq resursga kirishni to'smaydi
  }
  next();
};

/** Rolga asoslangan ruxsat (RBAC). authenticate dan keyin ishlatiladi. */
export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) return next(AppError.forbidden());
    next();
  };

export const signAccessToken = (user: { id: string; role: Role }) =>
  jwt.sign({ sub: user.id, role: user.role } satisfies AccessPayload, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'],
  });

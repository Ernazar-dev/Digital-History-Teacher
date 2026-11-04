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

/**
 * Faol foydalanuvchi qisqa muddat xotirada saqlanadi: sahifada 3–5 ta so'rov ketadi va har biri uchun
 * bazaga borish (Render ↔ Neon tarmog'i) sahifani sekinlashtirardi. Bitta jarayon ishlaydi, shuning uchun
 * rol/holat/profil o'zgarganda invalidateAuthUser() keshni darhol tozalaydi; TTL — qo'shimcha xavfsizlik.
 */
const AUTH_CACHE_TTL_MS = 15_000;
const AUTH_CACHE_MAX = 500;
const authCache = new Map<string, { user: Express.AuthUser; expires: number }>();

export const invalidateAuthUser = (userId?: string) => {
  if (userId) authCache.delete(userId);
  else authCache.clear();
};

const resolveUser = async (token: string): Promise<Express.AuthUser> => {
  let payload: AccessPayload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as AccessPayload;
  } catch {
    throw AppError.unauthorized('Sessiya muddati tugagan yoki token yaroqsiz');
  }
  const cached = authCache.get(payload.sub);
  if (cached && cached.expires > Date.now()) return cached.user;
  // Bloklangan/o'chirilgan foydalanuvchi kirish huquqini yo'qotadi (kesh invalidateAuthUser bilan tozalanadi)
  const user = await prisma.user.findFirst({
    where: { id: payload.sub, deletedAt: null },
    select: { id: true, role: true, username: true, fullName: true, status: true },
  });
  if (!user || user.status !== 'ACTIVE') {
    authCache.delete(payload.sub);
    throw AppError.unauthorized('Hisob faol emas');
  }
  const resolved = { id: user.id, role: user.role, username: user.username, fullName: user.fullName };
  if (authCache.size >= AUTH_CACHE_MAX) authCache.clear();
  authCache.set(user.id, { user: resolved, expires: Date.now() + AUTH_CACHE_TTL_MS });
  return resolved;
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

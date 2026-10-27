import { createHmac, randomBytes } from 'node:crypto';
import type { User } from '@prisma/client';
import type { z } from 'zod';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { signAccessToken } from '../../middleware/auth';
import { AppError } from '../../shared/errors/AppError';
import { loginGuard } from '../../shared/security/loginGuard';
import { hashPassword, verifyPassword } from '../../shared/utils/password';
import { settingsService } from '../settings/settings.service';
import type { registerSchema } from './auth.schemas';

const hashToken = (token: string) =>
  createHmac('sha256', env.JWT_REFRESH_SECRET).update(token).digest('hex');

type PublicFields = 'id' | 'username' | 'email' | 'fullName' | 'role' | 'status' | 'institution' | 'createdAt' | 'lastLoginAt';

export const publicUser = (u: Pick<User, PublicFields>) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  fullName: u.fullName,
  role: u.role,
  status: u.status,
  institution: u.institution,
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt,
});

// Foydalanuvchi mavjud bo'lmaganda ham bir xil vaqt sarflash uchun (timing attack)
let dummyHash: string | null = null;
const getDummyHash = async () => {
  if (!dummyHash) dummyHash = await hashPassword('dummy-password-1');
  return dummyHash;
};

const issueRefreshToken = async (userId: string, userAgent?: string) => {
  const token = randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(token), expiresAt, userAgent: userAgent?.slice(0, 250) },
  });
  return { token, expiresAt };
};

/** Login (va berilgan bo'lsa email) band emasligini tekshiradi */
export const assertUnique = async (username: string | null, email: string | null | undefined, exceptId?: string) => {
  const or = [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])];
  if (!or.length) return;
  const clash = await prisma.user.findFirst({ where: { OR: or, ...(exceptId ? { NOT: { id: exceptId } } : {}) } });
  if (!clash) return;
  throw AppError.conflict(
    username && clash.username === username ? 'Bu login band — boshqasini tanlang' : 'Bu email boshqa foydalanuvchiga biriktirilgan',
  );
};

export const authService = {
  /** Faol (darhol tasdiqlangan) hisob uchun sessiya ham ochiladi — qayta login qilish shart emas */
  async register(input: z.infer<typeof registerSchema>, userAgent?: string) {
    await assertUnique(input.username, input.email);

    const autoApprove = await settingsService.get('auth.studentAutoApprove');
    // O'qituvchi roli har doim administrator tasdig'idan o'tadi
    const status = input.role === 'STUDENT' && autoApprove ? 'ACTIVE' : 'PENDING';
    const groupId = input.role === 'STUDENT' ? input.groupId : undefined;
    if (groupId && !(await prisma.group.findFirst({ where: { id: groupId, deletedAt: null } }))) {
      throw AppError.badRequest('Tanlangan guruh topilmadi');
    }

    const user = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash: await hashPassword(input.password),
        fullName: input.fullName,
        institution: input.institution,
        role: input.role,
        status,
        ...(input.role === 'STUDENT' ? { portfolio: { create: {} } } : {}),
        ...(groupId ? { memberships: { create: { groupId } } } : {}),
      },
    });
    if (user.status !== 'ACTIVE') return { user: publicUser(user), session: null };
    const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const refresh = await issueRefreshToken(user.id, userAgent);
    return { user: publicUser(updated), session: { accessToken: signAccessToken(user), refresh } };
  },

  async login(username: string, password: string, userAgent?: string) {
    // Hisob bo'yicha blok: ketma-ket noto'g'ri parollardan keyin vaqtincha kirib bo'lmaydi
    const locked = loginGuard.lockedFor(username);
    if (locked) {
      throw AppError.tooManyRequests(`Juda ko‘p noto‘g‘ri urinish. ${Math.ceil(locked / 60000)} daqiqadan so‘ng qayta urinib ko‘ring.`);
    }
    const user = await prisma.user.findFirst({ where: { username, deletedAt: null } });
    if (!user) {
      await verifyPassword(await getDummyHash(), password);
      loginGuard.fail(username);
      throw AppError.unauthorized('Login yoki parol noto‘g‘ri');
    }
    const valid = await verifyPassword(user.passwordHash, password);
    if (!valid) {
      loginGuard.fail(username);
      throw AppError.unauthorized('Login yoki parol noto‘g‘ri');
    }
    loginGuard.success(username);
    if (user.status === 'PENDING') throw AppError.forbidden('Hisobingiz administrator tasdig‘ini kutmoqda');
    if (user.status === 'BLOCKED') throw AppError.forbidden('Hisobingiz bloklangan');

    const updated = await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const refresh = await issueRefreshToken(user.id, userAgent);
    return { user: publicUser(updated), accessToken: signAccessToken(user), refresh };
  },

  /** Refresh token rotatsiyasi. Bekor qilingan token qayta ishlatilsa — barcha sessiyalar bekor qilinadi. */
  async refresh(token: string, userAgent?: string) {
    const record = await prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });
    if (!record) throw AppError.unauthorized('Sessiya topilmadi');
    if (record.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw AppError.unauthorized('Sessiya bekor qilingan');
    }
    if (record.expiresAt < new Date()) throw AppError.unauthorized('Sessiya muddati tugagan');
    const { user } = record;
    if (user.deletedAt || user.status !== 'ACTIVE') throw AppError.unauthorized('Hisob faol emas');

    await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
    const refresh = await issueRefreshToken(user.id, userAgent);
    return { user: publicUser(user), accessToken: signAccessToken(user), refresh };
  },

  async logout(token: string | undefined) {
    if (!token) return;
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound();
    return publicUser(user);
  },

  async updateProfile(userId: string, data: { fullName?: string; email?: string | null; institution?: string | null }) {
    if (data.email) await assertUnique(null, data.email, userId);
    const user = await prisma.user.update({ where: { id: userId }, data });
    return publicUser(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await verifyPassword(user.passwordHash, currentPassword))) {
      throw AppError.badRequest('Joriy parol noto‘g‘ri');
    }
    const passwordHash = await hashPassword(newPassword);
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
  },

  /**
   * Parolni tiklash tokeni (1 soat amal qiladi, bir martalik).
   * Email servisi ulanmagan — development rejimida token javobda qaytariladi.
   */
  async forgotPassword(username: string) {
    const user = await prisma.user.findFirst({ where: { username, deletedAt: null } });
    if (!user) return null;
    const token = randomBytes(32).toString('base64url');
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    return token;
  },

  async resetPassword(token: string, password: string) {
    const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw AppError.badRequest('Tiklash havolasi yaroqsiz yoki muddati tugagan');
    }
    const passwordHash = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.refreshToken.updateMany({
        where: { userId: record.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  },
};

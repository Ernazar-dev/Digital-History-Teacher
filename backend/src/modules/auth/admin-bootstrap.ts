import type { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../shared/utils/password';

export interface AdminCredentials {
  username: string;
  password: string;
  fullName: string;
}

/**
 * Administrator hisobini .env dagi ADMIN_USERNAME / ADMIN_PASSWORD asosida ta'minlaydi:
 * yo'q bo'lsa yaratadi, bor bo'lsa rol/holatni tiklaydi va parolni env bilan sinxronlaydi.
 * Shu tariqa admin login-paroli faqat .env da saqlanadi (kodda emas).
 */
export async function ensureAdmin(prisma: PrismaClient, creds: AdminCredentials) {
  const username = creds.username.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { username } });

  if (!existing) {
    const user = await prisma.user.create({
      data: { username, passwordHash: await hashPassword(creds.password), fullName: creds.fullName, role: 'ADMIN', status: 'ACTIVE' },
    });
    return { id: user.id, action: 'created' as const };
  }

  const passwordChanged = !(await verifyPassword(existing.passwordHash, creds.password));
  const needsUpdate = passwordChanged || existing.role !== 'ADMIN' || existing.status !== 'ACTIVE' || existing.deletedAt !== null;
  if (!needsUpdate) return { id: existing.id, action: 'unchanged' as const };

  const passwordHash = passwordChanged ? await hashPassword(creds.password) : undefined;
  await prisma.$transaction([
    prisma.user.update({
      where: { id: existing.id },
      data: { role: 'ADMIN', status: 'ACTIVE', deletedAt: null, ...(passwordHash ? { passwordHash } : {}) },
    }),
    // Parol almashgan bo'lsa — eski sessiyalar bekor qilinadi
    ...(passwordHash ? [prisma.refreshToken.updateMany({ where: { userId: existing.id, revokedAt: null }, data: { revokedAt: new Date() } })] : []),
  ]);
  return { id: existing.id, action: 'updated' as const };
}

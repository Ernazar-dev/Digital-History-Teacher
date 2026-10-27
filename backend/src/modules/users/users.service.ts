import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { buildMeta } from '../../shared/utils/http';
import { hashPassword } from '../../shared/utils/password';
import { assertUnique, publicUser } from '../auth/auth.service';
import type { createUserSchema, listUsersQuery, updateUserSchema } from './users.schemas';

export const usersService = {
  async list(actor: Express.AuthUser, query: z.infer<typeof listUsersQuery>) {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    // O'qituvchi faqat faol talabalarni ko'radi (guruhga qo'shish uchun)
    if (actor.role === 'TEACHER') {
      where.role = 'STUDENT';
      where.status = 'ACTIVE';
    } else {
      if (query.role) where.role = query.role;
      if (query.status) where.status = query.status;
    }
    if (query.q) {
      where.OR = [
        { fullName: { contains: query.q, mode: 'insensitive' } },
        { username: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
      ];
    }
    const [total, rows] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        include: { memberships: { where: { group: { deletedAt: null } }, select: { group: { select: { id: true, name: true } } } } },
      }),
    ]);
    return {
      items: rows.map(({ memberships, ...u }) => ({ ...publicUser(u), groups: memberships.map((m) => m.group) })),
      meta: buildMeta(query.page, query.pageSize, total),
    };
  },

  /** Admin talabani bitta guruhga biriktiradi (eski guruhdan chiqariladi); groupId = null — guruhsiz */
  async setGroup(id: string, groupId: string | null) {
    const student = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!student) throw AppError.notFound('Foydalanuvchi topilmadi');
    if (student.role !== 'STUDENT') throw AppError.badRequest('Guruhga faqat talaba biriktiriladi');
    if (groupId && !(await prisma.group.findFirst({ where: { id: groupId, deletedAt: null } }))) {
      throw AppError.notFound('Guruh topilmadi');
    }
    await prisma.$transaction([
      prisma.groupMembership.deleteMany({ where: { studentId: id } }),
      ...(groupId
        ? [
            prisma.groupMembership.create({ data: { groupId, studentId: id } }),
            prisma.portfolio.upsert({ where: { studentId: id }, create: { studentId: id }, update: {} }),
          ]
        : []),
    ]);
  },

  async get(id: string) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        memberships: { include: { group: { select: { id: true, name: true, kind: true } } } },
        teachingGroups: { where: { deletedAt: null }, select: { id: true, name: true, kind: true } },
      },
    });
    if (!user) throw AppError.notFound('Foydalanuvchi topilmadi');
    return {
      ...publicUser(user),
      groups: user.memberships.map((m) => m.group),
      teachingGroups: user.teachingGroups,
    };
  },

  async create(input: z.infer<typeof createUserSchema>) {
    await assertUnique(input.username, input.email);
    const user = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        fullName: input.fullName,
        institution: input.institution,
        role: input.role,
        status: input.status,
        passwordHash: await hashPassword(input.password),
        ...(input.role === 'STUDENT' ? { portfolio: { create: {} } } : {}),
      },
    });
    return publicUser(user);
  },

  async update(actor: Express.AuthUser, id: string, input: z.infer<typeof updateUserSchema>) {
    const changesOwnAccess =
      (input.role !== undefined && input.role !== 'ADMIN') ||
      (input.status !== undefined && input.status !== 'ACTIVE');
    if (actor.id === id && changesOwnAccess) {
      throw AppError.badRequest('O‘zingizning rolingiz yoki holatingizni o‘zgartira olmaysiz');
    }
    const existing = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw AppError.notFound('Foydalanuvchi topilmadi');
    await assertUnique(input.username ?? null, input.email, id);
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({ where: { id }, data: input });
      if (updated.role === 'STUDENT') {
        await tx.portfolio.upsert({ where: { studentId: id }, create: { studentId: id }, update: {} });
      }
      // Bloklanganda barcha sessiyalar bekor qilinadi
      if (input.status === 'BLOCKED') {
        await tx.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      return updated;
    });
    return publicUser(user);
  },

  async remove(actor: Express.AuthUser, id: string) {
    if (actor.id === id) throw AppError.badRequest('O‘zingizni o‘chira olmaysiz');
    const existing = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw AppError.notFound('Foydalanuvchi topilmadi');
    // Soft delete: pedagogik eksperiment ma'lumotlari yo'qolmasligi uchun yozuv saqlanadi
    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'BLOCKED', username: `deleted-${id}`, email: null },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  },

  async resetPassword(id: string, password: string) {
    const existing = await prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw AppError.notFound('Foydalanuvchi topilmadi');
    const passwordHash = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({ where: { id }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  },
};

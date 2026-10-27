import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import type { createGroupSchema, updateGroupSchema } from './groups.schemas';

const groupInclude = {
  teacher: { select: { id: true, fullName: true, username: true, email: true } },
  _count: { select: { members: true, assignments: true } },
} satisfies Prisma.GroupInclude;

/** O'qituvchi faqat o'z guruhini boshqaradi, admin — barchasini */
const getManageableGroup = async (actor: Express.AuthUser, id: string) => {
  const group = await prisma.group.findFirst({ where: { id, deletedAt: null } });
  if (!group) throw AppError.notFound('Guruh topilmadi');
  if (actor.role !== 'ADMIN' && group.teacherId !== actor.id) throw AppError.forbidden();
  return group;
};

export const groupsService = {
  async list(actor: Express.AuthUser) {
    const where: Prisma.GroupWhereInput = { deletedAt: null };
    if (actor.role === 'TEACHER') where.teacherId = actor.id;
    if (actor.role === 'STUDENT') where.members = { some: { studentId: actor.id } };
    return prisma.group.findMany({ where, include: groupInclude, orderBy: { createdAt: 'desc' } });
  },

  /** Ro'yxatdan o'tish formasi uchun — faqat nomlar, shaxsiy ma'lumotlarsiz */
  publicList() {
    return prisma.group.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: 'asc' } });
  },

  /** Guruhsiz talaba o'zi guruh tanlaydi; guruhni almashtirish — faqat admin orqali */
  async join(actor: Express.AuthUser, id: string) {
    const group = await prisma.group.findFirst({ where: { id, deletedAt: null } });
    if (!group) throw AppError.notFound('Guruh topilmadi');
    const current = await prisma.groupMembership.count({ where: { studentId: actor.id, group: { deletedAt: null } } });
    if (current > 0) throw AppError.conflict('Siz allaqachon guruhdasiz. Guruhni almashtirish uchun administratorga murojaat qiling.');
    await prisma.$transaction([
      prisma.groupMembership.create({ data: { groupId: id, studentId: actor.id } }),
      prisma.portfolio.upsert({ where: { studentId: actor.id }, create: { studentId: actor.id }, update: {} }),
    ]);
  },

  async get(actor: Express.AuthUser, id: string) {
    const group = await prisma.group.findFirst({
      where: { id, deletedAt: null },
      include: {
        ...groupInclude,
        members: {
          include: { student: { select: { id: true, fullName: true, username: true, email: true, status: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });
    if (!group) throw AppError.notFound('Guruh topilmadi');
    const isMember = group.members.some((m) => m.studentId === actor.id);
    if (actor.role === 'STUDENT' && !isMember) throw AppError.forbidden();
    if (actor.role === 'TEACHER' && group.teacherId !== actor.id) throw AppError.forbidden();
    if (actor.role === 'STUDENT') {
      // Talaba boshqa talabalarning login va email manzillarini ko'rmaydi
      return { ...group, members: group.members.map((m) => ({ ...m, student: { ...m.student, username: '', email: null } })) };
    }
    return group;
  },

  async create(actor: Express.AuthUser, input: z.infer<typeof createGroupSchema>) {
    let teacherId = actor.id;
    if (actor.role === 'ADMIN' && input.teacherId) {
      const teacher = await prisma.user.findFirst({
        where: { id: input.teacherId, role: { in: ['TEACHER', 'ADMIN'] }, deletedAt: null },
      });
      if (!teacher) throw AppError.badRequest('O‘qituvchi topilmadi');
      teacherId = teacher.id;
    }
    const { teacherId: _ignored, ...data } = input;
    return prisma.group.create({ data: { ...data, teacherId }, include: groupInclude });
  },

  async update(actor: Express.AuthUser, id: string, input: z.infer<typeof updateGroupSchema>) {
    await getManageableGroup(actor, id);
    const { teacherId, ...data } = input;
    return prisma.group.update({
      where: { id },
      data: { ...data, ...(actor.role === 'ADMIN' && teacherId ? { teacherId } : {}) },
      include: groupInclude,
    });
  },

  async remove(actor: Express.AuthUser, id: string) {
    await getManageableGroup(actor, id);
    await prisma.group.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  async addMembers(actor: Express.AuthUser, id: string, studentIds: string[]) {
    await getManageableGroup(actor, id);
    const students = await prisma.user.findMany({
      where: { id: { in: studentIds }, role: 'STUDENT', deletedAt: null },
      select: { id: true },
    });
    if (students.length !== new Set(studentIds).size) {
      throw AppError.badRequest('Ro‘yxatda talaba bo‘lmagan yoki mavjud bo‘lmagan foydalanuvchi bor');
    }
    await prisma.$transaction([
      prisma.groupMembership.createMany({
        data: students.map((s) => ({ groupId: id, studentId: s.id })),
        skipDuplicates: true,
      }),
      ...students.map((s) =>
        prisma.portfolio.upsert({ where: { studentId: s.id }, create: { studentId: s.id }, update: {} }),
      ),
    ]);
    return this.get(actor, id);
  },

  async removeMember(actor: Express.AuthUser, id: string, studentId: string) {
    await getManageableGroup(actor, id);
    await prisma.groupMembership.deleteMany({ where: { groupId: id, studentId } });
  },
};

import { prisma } from '../../config/prisma';
import { AppError } from '../errors/AppError';

/**
 * Talabaning shaxsiy ishlariga kirish huquqi:
 * - admin: barcha talabalar
 * - talaba: faqat o'zi
 * - o'qituvchi: faqat o'z guruhlaridagi talabalar
 */
export const canAccessStudent = async (user: Express.AuthUser, studentId: string): Promise<boolean> => {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'STUDENT') return user.id === studentId;
  const membership = await prisma.groupMembership.findFirst({
    where: { studentId, group: { teacherId: user.id, deletedAt: null } },
    select: { groupId: true },
  });
  return Boolean(membership);
};

export const assertCanAccessStudent = async (user: Express.AuthUser, studentId: string) => {
  if (!(await canAccessStudent(user, studentId))) throw AppError.forbidden();
};

/** O'qituvchi guruhlaridagi talabalar ID ro'yxati (admin uchun null = cheklovsiz) */
export const accessibleStudentIds = async (user: Express.AuthUser): Promise<string[] | null> => {
  if (user.role === 'ADMIN') return null;
  if (user.role === 'STUDENT') return [user.id];
  const rows = await prisma.groupMembership.findMany({
    where: { group: { teacherId: user.id, deletedAt: null } },
    select: { studentId: true },
    distinct: ['studentId'],
  });
  return rows.map((r) => r.studentId);
};

/** Prisma where-filtri: studentId bo'yicha ruxsat etilgan qamrov */
export const studentScope = async (user: Express.AuthUser) => {
  const ids = await accessibleStudentIds(user);
  return ids === null ? {} : { in: ids };
};

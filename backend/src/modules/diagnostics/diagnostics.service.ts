import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { assertCanAccessStudent, studentScope } from '../../shared/utils/access';
import type { diagnosticBodySchema, updateDiagnosticSchema } from './diagnostics.schemas';

export type Option = { id: string; text: string };

const questionsOrder = { orderBy: { sortOrder: 'asc' as const } };
const sourceSelect = { select: { id: true, title: true, slug: true, type: true } } as const;

const assertSource = async (sourceId?: string | null) => {
  if (sourceId && !(await prisma.historicalSource.count({ where: { id: sourceId, deletedAt: null, status: 'PUBLISHED' } }))) {
    throw AppError.badRequest('Keys uchun tanlangan manba topilmadi yoki nashr etilmagan');
  }
};

/** Talabaga to'g'ri javoblar ko'rsatilmaydi (oldingi/keyingi diagnostika natijasi buzilmasligi uchun) */
const hideCorrect = <T extends { correct?: unknown }>(q: T) => ({ ...q, correct: null });

export const diagnosticsService = {
  async list(actor: Express.AuthUser) {
    if (actor.role === 'STUDENT') {
      const rows = await prisma.diagnostic.findMany({
        where: { deletedAt: null, isActive: true },
        include: {
          _count: { select: { questions: true } },
          attempts: { where: { studentId: actor.id }, select: { id: true, status: true, submittedAt: true, autoScore: true, maxAutoScore: true } },
        },
        orderBy: [{ stage: 'asc' }, { createdAt: 'asc' }],
      });
      return rows.map(({ attempts, ...d }) => ({ ...d, myAttempt: attempts[0] ?? null }));
    }
    return prisma.diagnostic.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { questions: true, attempts: true } }, createdBy: { select: { id: true, fullName: true } } },
      orderBy: [{ stage: 'asc' }, { createdAt: 'asc' }],
    });
  },

  async get(actor: Express.AuthUser, id: string) {
    const diagnostic = await prisma.diagnostic.findFirst({
      where: { id, deletedAt: null, ...(actor.role === 'STUDENT' ? { isActive: true } : {}) },
      include: {
        source: sourceSelect,
        questions: { ...questionsOrder, include: { component: { select: { id: true, code: true, name: true } } } },
      },
    });
    if (!diagnostic) throw AppError.notFound('Diagnostika topilmadi');
    if (actor.role === 'STUDENT') return { ...diagnostic, questions: diagnostic.questions.map(hideCorrect) };
    return diagnostic;
  },

  async create(actor: Express.AuthUser, input: z.infer<typeof diagnosticBodySchema>) {
    const { questions, ...data } = input;
    await assertSource(data.sourceId);
    const d = await prisma.diagnostic.create({
      data: {
        ...data,
        createdById: actor.id,
        questions: {
          create: questions.map((q, i) => ({
            ...q,
            options: (q.options ?? undefined) as Prisma.InputJsonValue | undefined,
            correct: (q.correct ?? undefined) as Prisma.InputJsonValue | undefined,
            sortOrder: i,
          })),
        },
      },
    });
    return this.get(actor, d.id);
  },

  async update(actor: Express.AuthUser, id: string, input: z.infer<typeof updateDiagnosticSchema>) {
    const existing = await prisma.diagnostic.findFirst({ where: { id, deletedAt: null }, include: { _count: { select: { attempts: true } } } });
    if (!existing) throw AppError.notFound('Diagnostika topilmadi');
    const { questions, ...data } = input;
    await assertSource(data.sourceId);
    if (questions && existing._count.attempts > 0) {
      // Natijalarni taqqoslanadigan saqlash uchun urinishlar mavjud bo'lsa savollar o'zgartirilmaydi
      throw AppError.conflict('Bu diagnostika bo‘yicha urinishlar mavjud — savollarni o‘zgartirib bo‘lmaydi. Nusxa yarating.');
    }
    await prisma.$transaction(async (tx) => {
      await tx.diagnostic.update({ where: { id }, data });
      if (questions) {
        await tx.diagnosticQuestion.deleteMany({ where: { diagnosticId: id } });
        await tx.diagnosticQuestion.createMany({
          data: questions.map((q, i) => ({
            ...q,
            diagnosticId: id,
            options: (q.options ?? undefined) as Prisma.InputJsonValue | undefined,
            correct: (q.correct ?? undefined) as Prisma.InputJsonValue | undefined,
            sortOrder: i,
          })),
        });
      }
    });
    return this.get(actor, id);
  },

  async remove(id: string) {
    await prisma.diagnostic.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  },

  async listAttempts(actor: Express.AuthUser, diagnosticId: string) {
    return prisma.diagnosticAttempt.findMany({
      where: { diagnosticId, studentId: await studentScope(actor) },
      include: { student: { select: { id: true, fullName: true } } },
      orderBy: { startedAt: 'desc' },
    });
  },

  async getAttempt(actor: Express.AuthUser, attemptId: string) {
    const attempt = await prisma.diagnosticAttempt.findUnique({
      where: { id: attemptId },
      include: {
        student: { select: { id: true, fullName: true } },
        diagnostic: {
          include: {
            source: sourceSelect,
            questions: { ...questionsOrder, include: { component: { select: { id: true, code: true, name: true } } } },
          },
        },
        responses: true,
      },
    });
    if (!attempt) throw AppError.notFound('Urinish topilmadi');
    await assertCanAccessStudent(actor, attempt.studentId);
    if (actor.role === 'STUDENT') {
      return {
        ...attempt,
        diagnostic: { ...attempt.diagnostic, questions: attempt.diagnostic.questions.map(hideCorrect) },
        responses: attempt.responses.map((r) => ({ ...r, isCorrect: null })),
      };
    }
    return attempt;
  },
};

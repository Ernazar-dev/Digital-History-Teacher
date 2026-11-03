import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { studentScope } from '../../shared/utils/access';
import type { attemptSchema, testBodySchema, updateTestSchema } from './tests.schemas';

type Actor = Express.AuthUser;
type Answer = string | null;

const isStaff = (u: Actor) => u.role === 'ADMIN' || u.role === 'TEACHER';

const fileSelect = { select: { id: true, originalName: true, mimeType: true, size: true } } as const;
const sourceSelect = { select: { id: true, title: true, slug: true } } as const;

/** Javoblarni kalit bilan solishtirish */
export const grade = (key: string[], answers: Answer[]) => {
  const correctCount = key.reduce((n, k, i) => (answers[i] === k ? n + 1 : n), 0);
  const total = key.length;
  return { correctCount, total, percent: total ? Math.round((correctCount / total) * 1000) / 10 : 0 };
};

const findTest = async (actor: Actor, id: string) => {
  const test = await prisma.test.findFirst({
    where: { id, deletedAt: null, ...(isStaff(actor) ? {} : { isPublished: true }) },
    include: { file: fileSelect, source: sourceSelect, createdBy: { select: { id: true, fullName: true } } },
  });
  if (!test) throw AppError.notFound('Test topilmadi');
  return test;
};

/** O'qituvchi faqat o'zi yuklagan testni o'zgartiradi; admin — barchasini */
const assertCanEdit = async (actor: Actor, id: string) => {
  const test = await findTest(actor, id);
  if (actor.role === 'TEACHER' && test.createdById !== actor.id) {
    throw AppError.forbidden('O‘qituvchi faqat o‘zi yuklagan testni o‘zgartira oladi');
  }
  return test;
};

const assertRefs = async (input: { fileId?: string; sourceId?: string | null }) => {
  if (input.fileId && !(await prisma.mediaFile.findUnique({ where: { id: input.fileId }, select: { id: true } }))) {
    throw AppError.badRequest('Test fayli topilmadi');
  }
  if (input.sourceId && !(await prisma.historicalSource.findFirst({ where: { id: input.sourceId, deletedAt: null }, select: { id: true } }))) {
    throw AppError.badRequest('Tanlangan mavzu topilmadi');
  }
};

/** Talaba javoblari va natijasi — to'g'ri javoblar faqat topshirilgandan keyin ko'rsatiladi */
const attemptView = (key: string[], a: { id: string; answers: Prisma.JsonValue; correctCount: number; total: number; percent: number; submittedAt: Date }) => ({
  id: a.id,
  answers: a.answers as Answer[],
  correctCount: a.correctCount,
  total: a.total,
  percent: a.percent,
  submittedAt: a.submittedAt,
  answerKey: key,
});

export const testsService = {
  async list(actor: Actor) {
    const tests = await prisma.test.findMany({
      where: { deletedAt: null, ...(isStaff(actor) ? {} : { isPublished: true }) },
      select: {
        id: true, title: true, description: true, questionCount: true, isPublished: true, createdAt: true, createdById: true,
        source: sourceSelect,
        createdBy: { select: { id: true, fullName: true } },
        _count: { select: { attempts: true } },
        attempts: {
          where: { studentId: actor.id },
          select: { correctCount: true, total: true, percent: true, submittedAt: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    return tests.map(({ attempts, _count, ...t }) => ({
      ...t,
      attemptCount: _count.attempts,
      myAttempt: attempts[0] ?? null,
    }));
  },

  async get(actor: Actor, id: string) {
    const test = await findTest(actor, id);
    const { answerKey, ...rest } = test;
    const key = answerKey as string[];
    if (isStaff(actor)) return { ...rest, answerKey: key, myAttempt: null };
    const attempt = await prisma.testAttempt.findUnique({ where: { testId_studentId: { testId: id, studentId: actor.id } } });
    return { ...rest, answerKey: null, myAttempt: attempt ? attemptView(key, attempt) : null };
  },

  async create(actor: Actor, input: z.infer<typeof testBodySchema>) {
    await assertRefs(input);
    const { answerKey, ...data } = input;
    const test = await prisma.test.create({
      data: { ...data, answerKey, questionCount: answerKey.length, createdById: actor.id },
    });
    return this.get(actor, test.id);
  },

  /** Kalit o'zgarsa, oldingi urinishlar yangi kalit bo'yicha qayta hisoblanadi */
  async update(actor: Actor, id: string, input: z.infer<typeof updateTestSchema>) {
    await assertCanEdit(actor, id);
    await assertRefs(input);
    const { answerKey, ...data } = input;
    await prisma.$transaction(async (tx) => {
      await tx.test.update({
        where: { id },
        data: { ...data, ...(answerKey ? { answerKey, questionCount: answerKey.length } : {}) },
      });
      if (!answerKey) return;
      const attempts = await tx.testAttempt.findMany({ where: { testId: id } });
      for (const a of attempts) {
        const answers = (a.answers as Answer[]).slice(0, answerKey.length);
        while (answers.length < answerKey.length) answers.push(null);
        await tx.testAttempt.update({ where: { id: a.id }, data: { answers, ...grade(answerKey, answers) } });
      }
    });
    return this.get(actor, id);
  },

  async remove(actor: Actor, id: string) {
    await assertCanEdit(actor, id);
    await prisma.test.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  /** Talaba testni bir marta topshiradi */
  async submit(actor: Actor, id: string, input: z.infer<typeof attemptSchema>) {
    const test = await findTest(actor, id);
    const key = test.answerKey as string[];
    if (input.answers.length !== key.length) {
      throw AppError.badRequest(`Javoblar soni savollar soniga (${key.length}) mos emas`);
    }
    if (await prisma.testAttempt.findUnique({ where: { testId_studentId: { testId: id, studentId: actor.id } }, select: { id: true } })) {
      throw AppError.conflict('Siz bu testni allaqachon topshirgansiz');
    }
    const attempt = await prisma.testAttempt.create({
      data: { testId: id, studentId: actor.id, answers: input.answers, ...grade(key, input.answers) },
    });
    return attemptView(key, attempt);
  },

  /** Natijalar: admin va test muallifi — barcha talabalar; boshqa o'qituvchi — o'z guruhlari */
  async results(actor: Actor, id: string) {
    const test = await findTest(actor, id);
    const scope = actor.role === 'ADMIN' || test.createdById === actor.id ? {} : await studentScope(actor);
    const attempts = await prisma.testAttempt.findMany({
      where: { testId: id, studentId: scope },
      select: {
        id: true, correctCount: true, total: true, percent: true, submittedAt: true, answers: true,
        student: {
          select: {
            id: true, fullName: true, username: true,
            memberships: { where: { group: { deletedAt: null } }, select: { group: { select: { id: true, name: true } } } },
          },
        },
      },
      orderBy: [{ percent: 'desc' }, { submittedAt: 'asc' }],
    });
    return attempts.map(({ student: { memberships, ...student }, ...a }) => ({
      ...a,
      student: { ...student, groups: memberships.map((m) => m.group) },
    }));
  },

  /** Qayta topshirishga ruxsat — talabaning urinishi o'chiriladi */
  async resetAttempt(actor: Actor, id: string, attemptId: string) {
    const test = await findTest(actor, id);
    const attempt = await prisma.testAttempt.findFirst({ where: { id: attemptId, testId: id } });
    if (!attempt) throw AppError.notFound('Natija topilmadi');
    if (actor.role === 'TEACHER' && test.createdById !== actor.id) {
      const ids = (await studentScope(actor)) as { in?: string[] };
      if (ids.in && !ids.in.includes(attempt.studentId)) throw AppError.forbidden();
    }
    await prisma.testAttempt.delete({ where: { id: attemptId } });
  },
};

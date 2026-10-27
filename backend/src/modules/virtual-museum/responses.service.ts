import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { assertCanAccessStudent, studentScope } from '../../shared/utils/access';
import { COMPONENT, componentIdByCode, recordEvidence } from '../assessments/competence.service';
import { upsertPortfolioItem } from '../portfolios/portfolio.writer';
import type { responseReviewSchema, responseSchema } from './virtual.schemas';

const include = {
  student: { select: { id: true, fullName: true } },
  reviewedBy: { select: { id: true, fullName: true } },
  virtualObject: {
    select: { id: true, title: true, slug: true, type: true, tasks: { orderBy: { sortOrder: 'asc' } }, sources: { select: { sourceId: true } } },
  },
} satisfies Prisma.VirtualObjectResponseInclude;

const getAccessible = async (actor: Express.AuthUser, id: string) => {
  const response = await prisma.virtualObjectResponse.findUnique({ where: { id }, include });
  if (!response) throw AppError.notFound('Javob topilmadi');
  await assertCanAccessStudent(actor, response.studentId);
  return response;
};

/** Talabaning 3D/360° obyekt asosidagi kuzatuv javoblari va mashg'ulot loyihasi */
export const responsesService = {
  async save(actor: Express.AuthUser, virtualObjectId: string, input: z.infer<typeof responseSchema>) {
    const object = await prisma.virtualObject.findFirst({
      where: { id: virtualObjectId, deletedAt: null, status: 'PUBLISHED', isActive: true },
    });
    if (!object) throw AppError.notFound('Virtual obyekt topilmadi');
    const existing = await prisma.virtualObjectResponse.findUnique({
      where: { studentId_virtualObjectId: { studentId: actor.id, virtualObjectId } },
    });
    if (existing && !['DRAFT', 'RETURNED'].includes(existing.status)) {
      throw AppError.badRequest('Topshirilgan ishni tahrirlab bo‘lmaydi');
    }
    return prisma.virtualObjectResponse.upsert({
      where: { studentId_virtualObjectId: { studentId: actor.id, virtualObjectId } },
      create: { studentId: actor.id, virtualObjectId, answers: input.answers, activityDesign: input.activityDesign },
      update: { answers: input.answers, activityDesign: input.activityDesign },
      include,
    });
  },

  async submit(actor: Express.AuthUser, virtualObjectId: string) {
    const existing = await prisma.virtualObjectResponse.findUnique({
      where: { studentId_virtualObjectId: { studentId: actor.id, virtualObjectId } },
      include,
    });
    if (!existing) throw AppError.badRequest('Avval javoblarni saqlang');
    if (!['DRAFT', 'RETURNED'].includes(existing.status)) throw AppError.badRequest('Ish allaqachon topshirilgan');
    // Hujjat, 4-modul: obyekt bo'yicha metodik topshiriqlar to'liq bajariladi va mashg'ulot g'oyasi ishlab chiqiladi
    const answers = existing.answers as Record<string, string>;
    const missing = existing.virtualObject.tasks
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => !(answers[t.id] ?? '').trim())
      .map(({ i }) => `${i + 1}-topshiriqqa javob berilmagan`);
    if (!existing.activityDesign.trim()) missing.push('Obyekt asosidagi mashg‘ulot loyihasi yozilmagan');
    if (missing.length) throw AppError.unprocessable('Ishni to‘liq bajaring', { missing });
    return prisma.$transaction(async (tx) => {
      const updated = await tx.virtualObjectResponse.update({
        where: { id: existing.id }, data: { status: 'SUBMITTED', submittedAt: new Date() }, include,
      });
      await upsertPortfolioItem(
        {
          studentId: actor.id,
          type: 'VIRTUAL_WORK',
          title: `Virtual obyekt asosidagi ish: ${existing.virtualObject.title}`,
          description: 'Kuzatuv javoblari va 3D/360° obyekt asosidagi mashg‘ulot loyihasi',
          refType: 'VirtualObjectResponse',
          refId: existing.id,
          sourceIds: existing.virtualObject.sources.map((s) => s.sourceId),
        },
        tx,
      );
      return updated;
    });
  },

  async listForObject(actor: Express.AuthUser, virtualObjectId: string) {
    return prisma.virtualObjectResponse.findMany({
      where: { virtualObjectId, studentId: await studentScope(actor), status: { not: 'DRAFT' } },
      include,
      orderBy: { updatedAt: 'desc' },
    });
  },

  async listMine(actor: Express.AuthUser) {
    return prisma.virtualObjectResponse.findMany({ where: { studentId: actor.id }, include, orderBy: { updatedAt: 'desc' } });
  },

  get: getAccessible,

  /** O'qituvchi bahosi faoliyatli-metodik komponentga amaliy topshiriq dalili sifatida yoziladi */
  async review(actor: Express.AuthUser, id: string, input: z.infer<typeof responseReviewSchema>) {
    const existing = await getAccessible(actor, id);
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(existing.status)) throw AppError.badRequest('Ish topshirilmagan');
    return prisma.$transaction(async (tx) => {
      const updated = await tx.virtualObjectResponse.update({
        where: { id },
        data: {
          status: input.decision === 'ACCEPT' ? 'REVIEWED' : 'RETURNED',
          teacherComment: input.comment,
          score: input.decision === 'ACCEPT' ? input.score : null,
          reviewedById: actor.id,
          reviewedAt: new Date(),
        },
        include,
      });
      const componentId = await componentIdByCode(COMPONENT.ACTIVITY, tx);
      if (input.decision === 'ACCEPT' && input.score !== undefined && componentId) {
        await recordEvidence(
          {
            studentId: existing.studentId, componentId, evidenceKind: 'PRACTICAL_TASK',
            assessorRole: actor.role === 'ADMIN' ? 'EXPERT' : 'TEACHER', assessorId: actor.id,
            score: input.score, note: `Virtual obyekt: ${existing.virtualObject.title}`,
            refType: 'VirtualObjectResponse', refId: id,
          },
          tx,
        );
      }
      return updated;
    });
  },
};

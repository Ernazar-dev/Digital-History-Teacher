import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { assertCanAccessStudent, studentScope } from '../../shared/utils/access';
import { buildMeta } from '../../shared/utils/http';
import { COMPONENT, componentIdByCode, recordEvidence } from '../assessments/competence.service';
import { upsertPortfolioItem } from '../portfolios/portfolio.writer';
import { missingRequired } from './analysis.templates';
import type { listWorkQuery, reviewSchema } from './analysis.schemas';

const include = {
  source: { select: { id: true, title: true, slug: true, type: true, dateLabel: true, summary: true } },
  student: { select: { id: true, fullName: true } },
  reviewedBy: { select: { id: true, fullName: true } },
} satisfies Prisma.SourceAnalysisInclude;

const getOwned = async (actor: Express.AuthUser, id: string) => {
  const analysis = await prisma.sourceAnalysis.findUnique({ where: { id }, include });
  if (!analysis) throw AppError.notFound('Tahlil topilmadi');
  await assertCanAccessStudent(actor, analysis.studentId);
  return analysis;
};

const asAnswers = (value: Prisma.JsonValue) => (value ?? {}) as Record<string, string>;

export const analysisService = {
  async list(actor: Express.AuthUser, q: z.infer<typeof listWorkQuery>) {
    const where: Prisma.SourceAnalysisWhereInput = { studentId: await studentScope(actor) };
    if (q.studentId) where.AND = [{ studentId: q.studentId }];
    if (q.status) where.status = q.status;
    if (q.sourceId) where.sourceId = q.sourceId;
    const [total, items] = await prisma.$transaction([
      prisma.sourceAnalysis.count({ where }),
      prisma.sourceAnalysis.findMany({
        where,
        include,
        orderBy: { updatedAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return { items, meta: buildMeta(q.page, q.pageSize, total) };
  },

  get: getOwned,

  async create(actor: Express.AuthUser, sourceId: string, answers: Record<string, string>) {
    const source = await prisma.historicalSource.findFirst({ where: { id: sourceId, deletedAt: null, status: 'PUBLISHED' } });
    if (!source) throw AppError.notFound('Manba topilmadi yoki hali nashr etilmagan');
    // Shu manba bo'yicha tugallanmagan ish bo'lsa, yangisini ochmasdan o'shani davom ettiramiz
    const open = await prisma.sourceAnalysis.findFirst({
      where: { studentId: actor.id, sourceId, status: { in: ['DRAFT', 'RETURNED'] } },
      include,
      orderBy: { updatedAt: 'desc' },
    });
    if (open) return open;
    return prisma.sourceAnalysis.create({ data: { studentId: actor.id, sourceId, answers }, include });
  },

  async update(actor: Express.AuthUser, id: string, answers: Record<string, string>) {
    const analysis = await getOwned(actor, id);
    if (analysis.studentId !== actor.id) throw AppError.forbidden('Faqat muallif tahrirlay oladi');
    if (!['DRAFT', 'RETURNED'].includes(analysis.status)) {
      throw AppError.badRequest('Topshirilgan tahlilni tahrirlab bo‘lmaydi');
    }
    return prisma.sourceAnalysis.update({ where: { id }, data: { answers }, include });
  },

  async submit(actor: Express.AuthUser, id: string) {
    const analysis = await getOwned(actor, id);
    if (analysis.studentId !== actor.id) throw AppError.forbidden();
    if (!['DRAFT', 'RETURNED'].includes(analysis.status)) throw AppError.badRequest('Tahlil allaqachon topshirilgan');
    const missing = missingRequired(analysis.source.type, asAnswers(analysis.answers));
    if (missing.length) throw AppError.unprocessable('Majburiy savollarga javob bering', { missing });

    return prisma.$transaction(async (tx) => {
      const updated = await tx.sourceAnalysis.update({
        where: { id },
        data: { status: 'SUBMITTED', submittedAt: new Date() },
        include,
      });
      await upsertPortfolioItem(
        {
          studentId: actor.id,
          type: 'SOURCE_ANALYSIS',
          title: `Manba tahlili: ${analysis.source.title}`,
          description: 'Tahlil laboratoriyasida bajarilgan tanqidiy tahlil',
          refType: 'SourceAnalysis',
          refId: id,
          sourceIds: [analysis.sourceId],
        },
        tx,
      );
      return updated;
    });
  },

  /** O'qituvchi ko'rib chiqishi: qaytarish yoki qabul qilib baholash (kognitiv komponentga dalil) */
  async review(actor: Express.AuthUser, id: string, input: z.infer<typeof reviewSchema>) {
    const analysis = await getOwned(actor, id);
    if (actor.role === 'STUDENT') throw AppError.forbidden();
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(analysis.status)) {
      throw AppError.badRequest('Faqat topshirilgan tahlilni ko‘rib chiqish mumkin');
    }
    return prisma.$transaction(async (tx) => {
      const updated = await tx.sourceAnalysis.update({
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
      const componentId = await componentIdByCode(COMPONENT.COGNITIVE, tx);
      if (input.decision === 'ACCEPT' && input.score !== undefined && componentId) {
        await recordEvidence(
          {
            studentId: analysis.studentId,
            componentId,
            evidenceKind: 'SOURCE_ANALYSIS',
            assessorRole: actor.role === 'ADMIN' ? 'EXPERT' : 'TEACHER',
            assessorId: actor.id,
            score: input.score,
            note: `Manba tahlili: ${analysis.source.title}`,
            refType: 'SourceAnalysis',
            refId: id,
          },
          tx,
        );
      }
      return updated;
    });
  },

  async remove(actor: Express.AuthUser, id: string) {
    const analysis = await getOwned(actor, id);
    if (analysis.studentId !== actor.id || analysis.status !== 'DRAFT') {
      throw AppError.badRequest('Faqat o‘zingizning qoralamangizni o‘chirishingiz mumkin');
    }
    await prisma.sourceAnalysis.delete({ where: { id } });
  },
};

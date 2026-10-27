import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { assertCanAccessStudent } from '../../shared/utils/access';
import { computeProfile } from '../assessments/competence.service';
import { mediaService, PORTFOLIO_MIME_TYPES } from '../media/media.service';
import { resolveRef } from './portfolio.resolve';
import { resolveOutcomes } from './portfolio.summary';
import { upsertPortfolioItem } from './portfolio.writer';
import type { reflectionSchema } from './portfolios.schemas';

/** Kompetensiya dinamikasi bosqichlari (hujjat, 7-modul: «kompetensiya darajasining dinamikasi») */
const DYNAMICS_STAGES = ['INITIAL', 'INTERMEDIATE', 'FINAL'] as const;

const buildPortfolio = async (studentId: string) => {
  const portfolio = await prisma.portfolio.upsert({
    where: { studentId },
    create: { studentId },
    update: {},
    include: {
      student: { select: { id: true, fullName: true, username: true, email: true, institution: true } },
      items: { orderBy: { createdAt: 'desc' } },
    },
  });
  const sourceIds = [...new Set(portfolio.items.flatMap((i) => i.sourceIds))];
  const sources = await prisma.historicalSource.findMany({
    where: { id: { in: sourceIds } },
    select: { id: true, title: true, slug: true, type: true },
  });
  const sourceMap = new Map(sources.map((s) => [s.id, s]));
  const outcomes = await resolveOutcomes(portfolio.items);
  const items = portfolio.items.map((i) => ({
    ...i,
    sources: i.sourceIds.flatMap((id) => sourceMap.get(id) ?? []),
    outcome: outcomes.get(i.id)!,
  }));
  const [reflections, profile, ...stageProfiles] = await Promise.all([
    prisma.reflectionEntry.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } }),
    computeProfile(studentId),
    ...DYNAMICS_STAGES.map((s) => computeProfile(studentId, s)),
  ]);

  // Hujjat, 7-modul: oraliq va yakuniy test natijalari, o'qituvchi izohlari va kompetensiya dinamikasi
  const diagnostics = items
    .filter((i) => i.refType === 'DiagnosticAttempt')
    .map((i) => ({ itemId: i.id, title: i.title, stage: i.outcome.stage ?? null, status: i.outcome.status, percent: i.outcome.percent, date: i.updatedAt }));
  const teacherComments = items
    .filter((i) => i.outcome.teacherComment)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 12)
    .map((i) => ({ itemId: i.id, title: i.title, type: i.type, comment: i.outcome.teacherComment!, percent: i.outcome.percent, date: i.updatedAt }));
  const dynamics = stageProfiles.map((p, idx) => ({
    stage: DYNAMICS_STAGES[idx],
    overall: p.overall,
    level: p.overallLevel,
    components: p.components.map((c) => ({ code: c.code, name: c.name, score: c.score })),
  }));

  return { ...portfolio, items, reflections, profile, dynamics, diagnostics, teacherComments };
};

export const portfoliosService = {
  async get(actor: Express.AuthUser, studentId: string) {
    const student = await prisma.user.findFirst({ where: { id: studentId, role: 'STUDENT', deletedAt: null } });
    if (!student) throw AppError.notFound('Talaba topilmadi');
    await assertCanAccessStudent(actor, studentId);
    return buildPortfolio(studentId);
  },

  updateSummary(actor: Express.AuthUser, summary: string) {
    return prisma.portfolio.upsert({
      where: { studentId: actor.id },
      create: { studentId: actor.id, summary },
      update: { summary },
    });
  },

  async getItem(actor: Express.AuthUser, id: string) {
    const item = await prisma.portfolioItem.findUnique({ where: { id }, include: { portfolio: true } });
    if (!item) throw AppError.notFound('Portfolio elementi topilmadi');
    await assertCanAccessStudent(actor, item.portfolio.studentId);
    const sources = await prisma.historicalSource.findMany({
      where: { id: { in: item.sourceIds } },
      select: { id: true, title: true, slug: true, type: true },
    });
    return { ...item, sources, detail: await resolveRef(item.refType, item.refId) };
  },

  async updateItem(actor: Express.AuthUser, id: string, data: { isFeatured?: boolean; description?: string | null }) {
    const item = await prisma.portfolioItem.findUnique({ where: { id }, include: { portfolio: true } });
    if (!item || item.portfolio.studentId !== actor.id) throw AppError.notFound('Portfolio elementi topilmadi');
    return prisma.portfolioItem.update({ where: { id }, data });
  },

  createReflection(actor: Express.AuthUser, input: z.infer<typeof reflectionSchema>) {
    return prisma.$transaction(async (tx) => {
      const entry = await tx.reflectionEntry.create({ data: { ...input, studentId: actor.id } });
      await upsertPortfolioItem(
        {
          studentId: actor.id,
          type: 'REFLECTION',
          title: `Refleksiya: ${entry.title}`,
          description: entry.content.slice(0, 300),
          refType: 'ReflectionEntry',
          refId: entry.id,
        },
        tx,
      );
      return entry;
    });
  },

  async updateReflection(actor: Express.AuthUser, id: string, input: Partial<z.infer<typeof reflectionSchema>>) {
    const entry = await prisma.reflectionEntry.findUnique({ where: { id } });
    if (!entry || entry.studentId !== actor.id) throw AppError.notFound('Yozuv topilmadi');
    return prisma.reflectionEntry.update({ where: { id }, data: input });
  },

  /** Profil sahifasidagi elektron portfolio: talaba o'zi yuklagan fayllar */
  async listFiles(actor: Express.AuthUser, studentId: string) {
    await assertCanAccessStudent(actor, studentId);
    const items = await prisma.portfolioItem.findMany({
      where: { type: 'UPLOAD', portfolio: { studentId } },
      orderBy: { createdAt: 'desc' },
    });
    const files = await prisma.mediaFile.findMany({
      where: { id: { in: items.map((i) => i.refId) } },
      select: { id: true, originalName: true, mimeType: true, size: true },
    });
    const byId = new Map(files.map((f) => [f.id, f]));
    return items.map((i) => ({ id: i.id, title: i.title, createdAt: i.createdAt, file: byId.get(i.refId) ?? null }));
  },

  async addFile(actor: Express.AuthUser, file: Express.Multer.File, title?: string) {
    const media = await mediaService.upload(file, actor.id, PORTFOLIO_MIME_TYPES);
    const item = await upsertPortfolioItem({
      studentId: actor.id,
      type: 'UPLOAD',
      title: title?.trim() || media.originalName,
      refType: 'MediaFile',
      refId: media.id,
    });
    return { id: item.id, title: item.title, createdAt: item.createdAt, file: { id: media.id, originalName: media.originalName, mimeType: media.mimeType, size: media.size } };
  },

  async removeFile(actor: Express.AuthUser, itemId: string) {
    const item = await prisma.portfolioItem.findUnique({ where: { id: itemId }, include: { portfolio: true } });
    if (!item || item.type !== 'UPLOAD' || item.portfolio.studentId !== actor.id) throw AppError.notFound('Fayl topilmadi');
    await prisma.portfolioItem.delete({ where: { id: itemId } });
    await mediaService.remove(item.refId).catch(() => undefined);
  },

  /** Faylni faqat egasi va unga biriktirilgan o'qituvchi/administrator ochadi */
  async openFile(actor: Express.AuthUser, itemId: string) {
    const item = await prisma.portfolioItem.findUnique({ where: { id: itemId }, include: { portfolio: true } });
    if (!item || item.type !== 'UPLOAD') throw AppError.notFound('Fayl topilmadi');
    await assertCanAccessStudent(actor, item.portfolio.studentId);
    return mediaService.getForDownload(item.refId);
  },

  async deleteReflection(actor: Express.AuthUser, id: string) {
    const entry = await prisma.reflectionEntry.findUnique({ where: { id } });
    if (!entry || entry.studentId !== actor.id) throw AppError.notFound('Yozuv topilmadi');
    await prisma.$transaction([
      prisma.portfolioItem.deleteMany({ where: { refType: 'ReflectionEntry', refId: id } }),
      prisma.reflectionEntry.delete({ where: { id } }),
    ]);
  },
};

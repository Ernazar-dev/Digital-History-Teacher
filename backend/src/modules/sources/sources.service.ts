import { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { buildMeta } from '../../shared/utils/http';
import { DEFAULT_LOCALE, type Locale, type TranslationLocale } from '../../shared/i18n/locale';
import { uniqueSlug } from '../../shared/utils/slug';
import { visibleObjectWhere } from '../virtual-museum/virtual.service';
import type { listSourcesQuery, sourceBodySchema, translationBodySchema, updateSourceSchema } from './sources.schemas';

type Actor = Express.AuthUser | undefined;
const isStaff = (u: Actor) => u?.role === 'ADMIN' || u?.role === 'TEACHER';

/** Talaba va mehmonlar faqat nashr etilgan mavzularni ko'radi */
export const visibleSourceWhere = (actor: Actor): Prisma.HistoricalSourceWhereInput =>
  isStaff(actor) ? { deletedAt: null } : { deletedAt: null, status: 'PUBLISHED' };

const fileSelect = { select: { id: true, originalName: true, mimeType: true, size: true } } as const;

const listSelect = {
  id: true, title: true, slug: true, summary: true, author: true, type: true, dateLabel: true, bookLabel: true, sortOrder: true,
  yearFrom: true, yearTo: true, status: true, createdAt: true, updatedAt: true, latitude: true, longitude: true,
  mediaFileId: true, mediaFile: { select: { id: true, mimeType: true } }, mediaUrl: true,
  presentationFileId: true, videoFileId: true, videoUrl: true,
  period: { select: { id: true, name: true } },
  topics: { select: { topic: { select: { id: true, name: true } } } },
} satisfies Prisma.HistoricalSourceSelect;

const ORDER: Record<string, Prisma.HistoricalSourceOrderByWithRelationInput[]> = {
  order: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  newest: [{ createdAt: 'desc' }],
  title: [{ title: 'asc' }],
};

const flattenTopics = <T extends { topics: { topic: { id: string; name: string } }[] }>(s: T) => ({
  ...s,
  topics: s.topics.map((t) => t.topic),
});

/** Ro'yxatda ma'ruza matni yuborilmaydi — faqat bor/yo'qligi */
const withLectureFlag = async <T extends { id: string }>(rows: T[]) => {
  const withText = await prisma.historicalSource.findMany({
    where: { id: { in: rows.map((r) => r.id) }, lectureContent: { not: null } },
    select: { id: true },
  });
  const has = new Set(withText.map((r) => r.id));
  return rows.map((r) => ({ ...r, hasLecture: has.has(r.id) }));
};

/**
 * Qidiruvda barcha apostrof ko'rinishlari (' ‘ ’ ʻ ʼ ` ´) bir xil sanaladi: foydalanuvchi «O'zbekiston» deb yozsa ham
 * matndagi «O‘zbekiston» (yoki «Oʻzbekiston») topiladi. Belgilar birma-bir almashadi — matn uzunligi va o'rinlari saqlanadi.
 */
const APOS_FROM = '‘’ʻʼ`´′';
export const foldApostrophes = (text: string) => text.replace(/[‘’ʻʼ`´′]/g, "'");
const foldSql = (col: Prisma.Sql) => Prisma.sql`translate(${col}, ${APOS_FROM}, ${"'".repeat(APOS_FROM.length)})`;
const likeOf = (q: string) => `%${foldApostrophes(q).replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;

const translationFileSelect = {
  lectureFile: fileSelect,
  presentationFile: fileSelect,
  videoFile: fileSelect,
} as const;

/** Tarjima qatoridagi bo'sh bo'lmagan matn (bo'sh qator = tarjima qilinmagan) */
const filled = (v: string | null | undefined) => (v && v.trim() ? v : undefined);

/**
 * Tarjima mavjud maydonlarni almashtiradi, yetishmaganlari o'zbekcha qoladi.
 * Ma'ruza (matn+fayl) va video (havola+fayl) bir butun sifatida almashadi — o'zbekcha fayl bilan aralashib ketmaydi.
 * `fallbacks` — qaysi qismlar o'zbekchada qolgani (interfeys «bu tilda mavjud emas» deb ko'rsatadi).
 */
type Translated<T> = T & { lang: Locale; fallbacks: string[] };
const overlayTranslation = <T extends Record<string, any>>(base: T, t: any | null | undefined, lang: Locale): Translated<T> => {
  if (lang === DEFAULT_LOCALE) return { ...base, lang: DEFAULT_LOCALE as Locale, fallbacks: [] as string[] };
  const fallbacks: string[] = [];
  const out: Record<string, any> = { ...base, lang: t ? lang : DEFAULT_LOCALE };
  if (!t) return { ...out, fallbacks: ['text', 'lecture', 'presentation', 'video'] } as Translated<T>;
  for (const key of ['title', 'summary', 'description', 'teachingUse', 'methodicalRecommendations', 'practicalTasks', 'references'] as const) {
    const v = filled(t[key]);
    if (v !== undefined) out[key] = v;
  }
  if (filled(t.summary) === undefined) fallbacks.push('text');
  if (filled(t.lectureContent) !== undefined || t.lectureFileId) {
    out.lectureContent = filled(t.lectureContent) ?? null;
    out.lectureFileId = t.lectureFileId ?? null;
    if ('lectureFile' in base) out.lectureFile = t.lectureFile ?? null;
  } else fallbacks.push('lecture');
  if (t.presentationFileId) {
    out.presentationFileId = t.presentationFileId;
    if ('presentationFile' in base) out.presentationFile = t.presentationFile ?? null;
  } else if (base.presentationFileId) fallbacks.push('presentation');
  if (t.videoFileId || t.videoUrl) {
    out.videoFileId = t.videoFileId ?? null;
    out.videoUrl = t.videoUrl ?? null;
    if ('videoFile' in base) out.videoFile = t.videoFile ?? null;
  } else if (base.videoFileId || base.videoUrl) fallbacks.push('video');
  return { ...out, fallbacks } as Translated<T>;
};

/** Ro'yxat uchun: tarjima sarlavha/tavsif, ma'ruza bor-yo'qligi, taqdimot va videoni almashtiradi */
const translateList = async <T extends { id: string; hasLecture: boolean }>(rows: T[], lang: Locale) => {
  if (lang === DEFAULT_LOCALE || rows.length === 0) return rows;
  const translations = await prisma.historicalSourceTranslation.findMany({
    where: { sourceId: { in: rows.map((r) => r.id) }, locale: lang },
  });
  const byId = new Map(translations.map((t) => [t.sourceId, t]));
  return rows.map((r) => {
    const t = byId.get(r.id);
    const o = overlayTranslation(r, t, lang);
    const hasOwnLecture = Boolean(t && (filled(t.lectureContent) !== undefined || t.lectureFileId));
    return { ...o, hasLecture: hasOwnLecture ? filled(t?.lectureContent) !== undefined : r.hasLecture };
  });
};

/** Qidiruv so'rovi mos keladigan mavzu va kitoblar (sarlavha, tavsif, ma'ruza matni, kitob sahifalari) */
export const searchIds = async (q: string, lang: Locale = DEFAULT_LOCALE) => {
  const like = likeOf(q);
  const hit = (col: Prisma.Sql) => Prisma.sql`${foldSql(col)} ILIKE ${like}`;
  const rows = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
    SELECT s."id" FROM "HistoricalSource" s
    WHERE s."deletedAt" IS NULL AND (
      ${hit(Prisma.sql`s."title"`)} OR ${hit(Prisma.sql`s."summary"`)} OR ${hit(Prisma.sql`COALESCE(s."bookLabel", '')`)}
      OR ${hit(Prisma.sql`COALESCE(s."author", '')`)} OR ${hit(Prisma.sql`COALESCE(s."lectureContent", '')`)}
      OR EXISTS (SELECT 1 FROM "SourcePage" p WHERE p."sourceId" = s."id" AND ${hit(Prisma.sql`p."text"`)})
      OR EXISTS (
        SELECT 1 FROM "HistoricalSourceTranslation" tr
        WHERE tr."sourceId" = s."id" AND tr."locale" = ${lang} AND (
          ${hit(Prisma.sql`tr."title"`)} OR ${hit(Prisma.sql`COALESCE(tr."summary", '')`)} OR ${hit(Prisma.sql`COALESCE(tr."lectureContent", '')`)}
        )
      )
    )`);
  return rows.map((r) => r.id);
};

const assertCanEdit = async (actor: Express.AuthUser, id: string) => {
  const source = await prisma.historicalSource.findFirst({ where: { id, deletedAt: null } });
  if (!source) throw AppError.notFound('Mavzu topilmadi');
  if (actor.role === 'TEACHER' && source.createdById !== actor.id) {
    throw AppError.forbidden('O‘qituvchi faqat o‘zi qo‘shgan mavzuni tahrirlay oladi');
  }
  return source;
};

/** Biriktirilayotgan fayllar mavjudligini tekshiradi (FK xatosi o'rniga tushunarli javob) */
const assertMediaExists = async (ids: (string | null | undefined)[]) => {
  const unique = [...new Set(ids.filter((x): x is string => Boolean(x)))];
  if (unique.length === 0) return;
  const found = await prisma.mediaFile.count({ where: { id: { in: unique } } });
  if (found !== unique.length) throw AppError.badRequest('Biriktirilgan fayllardan biri topilmadi');
};

const filesOf = (d: { mediaFileId?: string | null; lectureFileId?: string | null; presentationFileId?: string | null; videoFileId?: string | null }) =>
  [d.mediaFileId, d.lectureFileId, d.presentationFileId, d.videoFileId];

export const sourcesService = {
  async list(actor: Actor, q: z.infer<typeof listSourcesQuery>, lang: Locale = DEFAULT_LOCALE) {
    const where: Prisma.HistoricalSourceWhereInput = { ...visibleSourceWhere(actor) };
    if (q.type) where.type = q.type;
    if (q.periodId) where.periodId = q.periodId;
    if (q.topicId) where.topics = { some: { topicId: q.topicId } };
    if (q.status && isStaff(actor)) where.status = q.status;
    if (q.q) {
      where.id = { in: await searchIds(q.q, lang) };
    }
    const [total, rows] = await prisma.$transaction([
      prisma.historicalSource.count({ where }),
      prisma.historicalSource.findMany({
        where,
        select: listSelect,
        orderBy: ORDER[q.sort],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
    ]);
    return { items: await translateList(await withLectureFlag(rows.map(flattenTopics)), lang), meta: buildMeta(q.page, q.pageSize, total) };
  },

  async get(actor: Actor, idOrSlug: string, lang: Locale = DEFAULT_LOCALE) {
    const isUuid = /^[0-9a-f-]{36}$/i.test(idOrSlug);
    const source = await prisma.historicalSource.findFirst({
      where: { ...visibleSourceWhere(actor), ...(isUuid ? { id: idOrSlug } : { slug: idOrSlug }) },
      include: {
        period: true,
        topics: { select: { topic: { select: { id: true, name: true } } } },
        createdBy: { select: { id: true, fullName: true } },
        translations: {
          select: {
            locale: true, title: true, summary: true, description: true, teachingUse: true, methodicalRecommendations: true,
            practicalTasks: true, references: true, lectureContent: true, lectureFileId: true, presentationFileId: true,
            videoFileId: true, videoUrl: true, ...translationFileSelect,
          },
        },
        mediaFile: fileSelect,
        lectureFile: fileSelect,
        presentationFile: fileSelect,
        videoFile: fileSelect,
        tests: {
          where: { deletedAt: null, ...(isStaff(actor) ? {} : { isPublished: true }) },
          select: { id: true, title: true, questionCount: true },
          orderBy: { createdAt: 'asc' },
        },
        virtualObjects: {
          // Talabaga faqat nashr etilgan va faol obyektlar ko'rsatiladi
          where: { virtualObject: { ...visibleObjectWhere(actor), isActive: true } },
          select: { virtualObject: { select: { id: true, title: true, slug: true, type: true, thumbnailUrl: true, periodLabel: true, location: true } } },
        },
      },
    });
    if (!source) throw AppError.notFound('Mavzu topilmadi');
    const pageCount = await prisma.sourcePage.count({ where: { sourceId: source.id } });
    const { translations, ...rest } = source;
    const result = {
      ...flattenTopics(rest),
      pageCount,
      virtualObjects: source.virtualObjects.map((v) => v.virtualObject),
      /** Qaysi tillarda variant bor (o'zbekcha doim bor) */
      availableLocales: [DEFAULT_LOCALE, ...translations.map((t) => t.locale)],
    };
    return overlayTranslation(result, translations.find((t) => t.locale === lang), lang);
  },

  async create(actor: Express.AuthUser, input: z.infer<typeof sourceBodySchema>) {
    const { topicIds, ...data } = input;
    await assertMediaExists(filesOf(data));
    const slug = await uniqueSlug(input.title, async (s) =>
      Boolean(await prisma.historicalSource.findUnique({ where: { slug: s } })),
    );
    // Tartib raqami ko'rsatilmasa — mavzu ro'yxat oxiriga tushadi
    const sortOrder =
      data.sortOrder ??
      ((await prisma.historicalSource.aggregate({ where: { deletedAt: null }, _max: { sortOrder: true } }))._max.sortOrder ?? 0) + 1;
    const source = await prisma.historicalSource.create({
      data: { ...data, sortOrder, slug, createdById: actor.id, topics: { create: topicIds.map((topicId) => ({ topicId })) } },
    });
    return this.get(actor, source.id);
  },

  async update(actor: Express.AuthUser, id: string, input: z.infer<typeof updateSourceSchema>) {
    await assertCanEdit(actor, id);
    const { topicIds, ...data } = input;
    await assertMediaExists(filesOf(data));
    if (data.yearFrom != null && data.yearTo != null && data.yearFrom > data.yearTo) {
      throw AppError.badRequest('Boshlanish yili tugash yilidan katta bo‘lmasligi kerak');
    }
    // Ma'ruza fayli almashtirilsa — avvalgi (tayyor) ma'ruza matni olib tashlanadi:
    // mavzu sahifasida endi yangi yuklangan fayl ko'rsatiladi
    if (data.lectureFileId !== undefined && data.lectureContent === undefined) {
      const current = await prisma.historicalSource.findUnique({ where: { id }, select: { lectureFileId: true } });
      if (current && data.lectureFileId !== current.lectureFileId) data.lectureContent = null;
    }
    await prisma.$transaction(async (tx) => {
      await tx.historicalSource.update({ where: { id }, data });
      if (topicIds) {
        await tx.sourceTopic.deleteMany({ where: { sourceId: id } });
        await tx.sourceTopic.createMany({ data: topicIds.map((topicId) => ({ sourceId: id, topicId })) });
      }
    });
    return this.get(actor, id);
  },

  async remove(actor: Express.AuthUser, id: string) {
    await assertCanEdit(actor, id);
    // Soft delete — dars ishlanmalari va testlardagi bog'lanishlar buzilmaydi
    await prisma.historicalSource.update({ where: { id }, data: { deletedAt: new Date() } });
  },

  /** Tahrirlash oynasi uchun: mavzuning barcha tarjimalari (xom holda) */
  async listTranslations(actor: Express.AuthUser, id: string) {
    await assertCanEdit(actor, id);
    return prisma.historicalSourceTranslation.findMany({
      where: { sourceId: id },
      include: translationFileSelect,
      orderBy: { locale: 'asc' },
    });
  },

  async upsertTranslation(actor: Express.AuthUser, id: string, locale: TranslationLocale, input: z.infer<typeof translationBodySchema>) {
    await assertCanEdit(actor, id);
    await assertMediaExists([input.lectureFileId, input.presentationFileId, input.videoFileId]);
    return prisma.historicalSourceTranslation.upsert({
      where: { sourceId_locale: { sourceId: id, locale } },
      create: { ...input, sourceId: id, locale },
      update: input,
      include: translationFileSelect,
    });
  },

  async removeTranslation(actor: Express.AuthUser, id: string, locale: TranslationLocale) {
    await assertCanEdit(actor, id);
    await prisma.historicalSourceTranslation.deleteMany({ where: { sourceId: id, locale } });
  },
};

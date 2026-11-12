/**
 * 13 ta ma'ruza mavzusini kutubxonaga qo'shadi. Har deployda xavfsiz ishlaydi:
 *  - mavzu yo'q bo'lsa — yaratiladi;
 *  - bor bo'lsa — faqat bo'sh maydonlar (ma'ruza matni, afisha rasmi) to'ldiriladi, administrator tahrirlari o'zgarmaydi.
 * Ishga tushirish: npm run db:seed:lectures
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Readable } from 'node:stream';
import { PrismaClient } from '@prisma/client';
import { driverFor, storage } from '../src/modules/media/storage';
import { LECTURES } from './seed-data/lectures';
import { textHash } from '../src/shared/i18n/textHash';
import { PERIODS } from './seed-data/periods';

/** Mijoz bergan ma'ruzalarning ru/en nusxalari (`<slug>.ru.docx`, `<slug>.en.docx`); uz — asosiy yozuv */
const TRANSLATED_LOCALES = ['ru', 'en'] as const;
type TranslatedLocale = (typeof TRANSLATED_LOCALES)[number];
const suffixOf = (locale?: TranslatedLocale) => (locale ? `.${locale}` : '');

const lectureText = (slug: string, locale?: TranslatedLocale) => {
  const file = join(__dirname, 'seed-data', 'lectures', `${slug}${suffixOf(locale)}.md`);
  return existsSync(file) ? readFileSync(file, 'utf8').trim() || null : null;
};

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/**
 * Ma'ruzaning Word fayli (seed-data/lectures/<slug>.docx) — platforma saqlash joyiga yoziladi va mavzuga biriktiriladi.
 * Talaba ma'ruzani shu fayl orqali o'qiydi va yuklab oladi.
 */
const seedDocxPath = (slug: string, locale?: TranslatedLocale) => join(__dirname, 'seed-data', 'lectures', `${slug}${suffixOf(locale)}.docx`);
const seedFileName = (title: string) => `${title.replace(/[^\p{L}\p{N}._ -]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 180)}.docx`;

const attachLectureFile = async (prisma: PrismaClient, slug: string, title: string, adminId: string | null, locale?: TranslatedLocale) => {
  const file = seedDocxPath(slug, locale);
  if (!existsSync(file)) return null;
  const data = readFileSync(file);
  const storageKey = `${randomUUID()}.docx`;
  await storage.save(storageKey, data);
  const media = await prisma.mediaFile.create({
    data: { originalName: seedFileName(title), storageKey, storage: storage.name, mimeType: DOCX_MIME, size: data.length, uploadedById: adminId },
  });
  return media.id;
};

const readAll = async (stream: Readable) => {
  const chunks: Buffer[] = [];
  for await (const c of stream) chunks.push(Buffer.from(c));
  return Buffer.concat(chunks);
};

/**
 * Mavzudagi fayl avvalgi seed yozgan nusxa (nomi seed nomi bilan bir xil), lekin tayyor Word fayldan farq qiladimi —
 * ya'ni ma'ruza yangilangan. Administrator o'zi yuklagan fayl (boshqa nom) bu tekshiruvdan o'tmaydi va almashtirilmaydi.
 */
const isOutdatedSeedFile = async (prisma: PrismaClient, mediaFileId: string, slug: string, titles: string[], locale?: TranslatedLocale) => {
  const file = await prisma.mediaFile.findUnique({ where: { id: mediaFileId }, select: { originalName: true, storage: true, storageKey: true } });
  if (!file || !titles.some((t) => seedFileName(t) === file.originalName) || !existsSync(seedDocxPath(slug, locale))) return false;
  try {
    return !(await readAll(await driverFor(file.storage).read(file.storageKey))).equals(readFileSync(seedDocxPath(slug, locale)));
  } catch {
    return false;
  }
};

/** Almashtirilgan eski fayl yozuvi va uning mazmuni olib tashlanadi (boshqa joyda ishlatilsa — qoldiriladi) */
const dropOldFile = async (prisma: PrismaClient, mediaFileId: string) => {
  try {
    const file = await prisma.mediaFile.delete({ where: { id: mediaFileId } });
    await driverFor(file.storage).remove(file.storageKey);
  } catch {
    /* boshqa yozuv bog'langan yoki fayl allaqachon yo'q */
  }
};

/**
 * Biriktirilgan fayl yozuvi bor, lekin mazmuni saqlash joyida yo'qmi (masalan, Render'ning vaqtinchalik diskida
 * `local` drayver bilan yozilgan fayl qayta ishga tushganda o'chib ketgan).
 */
const isFileLost = async (prisma: PrismaClient, mediaFileId: string) => {
  const file = await prisma.mediaFile.findUnique({ where: { id: mediaFileId }, select: { storage: true, storageKey: true } });
  if (!file) return true;
  try {
    (await driverFor(file.storage).read(file.storageKey)).destroy();
    return false;
  } catch {
    return true;
  }
};

/** Shu mavzuning avvalgi seed'dagi darslik yozuvlari: «… I kitob · 12-mavzu» va «… I kitob, A.S.Sagdullayev · 12-mavzu» */
const staleBookLabels = (label: string) => [label.replace(' (A.S.Sagdullayev)', ''), label.replace(' (A.S.Sagdullayev)', ', A.S.Sagdullayev')];

/** Bazadagi tarjima lug'atidan (TextTranslation) o'zbekcha matnning ru/en varianti */
const dictText = async (prisma: PrismaClient, locale: TranslatedLocale, text: string | null) => {
  if (!text) return null;
  const row = await prisma.textTranslation.findUnique({ where: { sourceHash_locale: { sourceHash: textHash(text), locale } } });
  return row?.text ?? null;
};

/**
 * Mavzuning ru/en ma'ruzasi (Word + Markdown) — HistoricalSourceTranslation. Qoidalar o'zbekcha ma'ruzadagi bilan bir xil:
 * yozuv yo'q bo'lsa yaratiladi; fayl yo'q / yo'qolgan / avvalgi seed nusxasi eskirgan bo'lsa almashtiriladi (matn ham);
 * administrator o'zi yuklagan fayl va tahrirlangan sarlavha/tavsif o'zgarmaydi.
 */
const seedLectureTranslations = async (prisma: PrismaClient, sourceId: string, slug: string, uzTitle: string, uzSummary: string, adminId: string | null) => {
  let changed = 0;
  for (const locale of TRANSLATED_LOCALES) {
    const content = lectureText(slug, locale);
    if (!content || !existsSync(seedDocxPath(slug, locale))) continue;
    const mdTitle = content.match(/^# (.+)$/m)?.[1]?.trim();
    const dictTitle = await dictText(prisma, locale, uzTitle);
    const dictSummary = await dictText(prisma, locale, uzSummary);
    const existing = await prisma.historicalSourceTranslation.findUnique({ where: { sourceId_locale: { sourceId, locale } } });
    const title = existing?.title || dictTitle || mdTitle || uzTitle;
    const fileId = existing?.lectureFileId ?? null;
    const needsFile = !fileId || (await isFileLost(prisma, fileId)) || (await isOutdatedSeedFile(prisma, fileId, slug, [existing?.title ?? title, title], locale));
    const lectureFileId = needsFile ? await attachLectureFile(prisma, slug, title, adminId, locale) : null;
    if (!existing) {
      await prisma.historicalSourceTranslation.create({ data: { sourceId, locale, title, summary: dictSummary, lectureContent: content, lectureFileId } });
      changed += 1;
    } else {
      const data = {
        ...(lectureFileId ? { lectureFileId, lectureContent: content } : {}),
        ...(!existing.lectureContent && !existing.lectureFileId && !lectureFileId ? { lectureContent: content } : {}),
        ...(!existing.summary && dictSummary ? { summary: dictSummary } : {}),
      };
      if (Object.keys(data).length) {
        await prisma.historicalSourceTranslation.update({ where: { id: existing.id }, data });
        if (lectureFileId && fileId) await dropOldFile(prisma, fileId);
        changed += 1;
      }
    }
  }
  return changed;
};

export const seedLectures = async (prisma: PrismaClient, adminId: string | null) => {
  const periods = new Map<string, string>();
  for (const p of PERIODS) {
    const row = await prisma.historicalPeriod.upsert({ where: { slug: p.slug }, create: p, update: {} });
    periods.set(p.slug, row.id);
  }
  let created = 0;
  let filled = 0;
  for (const [i, l] of LECTURES.entries()) {
    const { period, coverUrl, coverPage, coverCredit, ...meta } = l;
    const cover = { mediaUrl: coverUrl, originalUrl: coverPage, license: coverCredit };
    const lectureContent = lectureText(l.slug);
    const existing = await prisma.historicalSource.findUnique({ where: { slug: l.slug } });
    if (!existing || existing.deletedAt) {
      const data = {
        ...meta,
        ...cover,
        type: 'WRITTEN' as const,
        status: 'PUBLISHED' as const,
        sortOrder: (i + 1) * 10,
        periodId: period ? periods.get(period) ?? null : null,
        lectureContent,
        // Mavzu qayta tiklanayotgan bo'lsa va fayli bor bo'lsa — o'sha qoladi
        lectureFileId: existing?.lectureFileId ?? (await attachLectureFile(prisma, l.slug, l.title, adminId)),
        createdById: adminId,
        deletedAt: null,
      };
      const row = existing ? await prisma.historicalSource.update({ where: { id: existing.id }, data }) : await prisma.historicalSource.create({ data });
      await seedLectureTranslations(prisma, row.id, l.slug, l.title, l.summary, adminId);
      created += 1;
    } else {
      // Ma'ruza fayli bo'sh, mazmuni yo'qolgan yoki avvalgi seed nusxasi eskirgan bo'lsa (ma'ruza yangilangan) almashtiriladi —
      // ishlayotgan administrator fayli almashtirilmaydi
      const oldFileId = existing.lectureFileId;
      const outdated = Boolean(oldFileId) && (await isOutdatedSeedFile(prisma, oldFileId!, l.slug, [existing.title, l.title]));
      const needsFile = !oldFileId || outdated || (await isFileLost(prisma, oldFileId));
      const lectureFileId = needsFile ? await attachLectureFile(prisma, l.slug, existing.title, adminId) : null;
      const data = {
        ...(lectureFileId ? { lectureFileId } : {}),
        // Seed yozgan eski fayl yangi nusxaga almashganda matn ham yangilanadi (ikkalasi bir hujjat)
        ...(outdated && lectureFileId && lectureContent ? { lectureContent } : {}),
        // Matn faqat ma'ruza umuman bo'lmasa qo'yiladi — administrator o'z faylini yuklagan bo'lsa, tayyor matn qaytarilmaydi
        ...(!existing.lectureContent && !existing.lectureFileId && lectureContent ? { lectureContent } : {}),
        // Darslik yozuvi avvalgi seed qiymati bo'lsa (muallifsiz yoki vergulli) — yangi ko'rinishga o'tkaziladi; admin tahriri o'zgarmaydi
        ...(existing.bookLabel && existing.bookLabel !== l.bookLabel && staleBookLabels(l.bookLabel).includes(existing.bookLabel) ? { bookLabel: l.bookLabel } : {}),
        // Afisha bo'sh yoki avvalgi tashqi (Wikimedia) havola bo'lsa — platformadagi nusxa qo'yiladi
        ...(!existing.mediaFileId && (!existing.mediaUrl || existing.mediaUrl.startsWith('https://upload.wikimedia.org/')) && existing.mediaUrl !== cover.mediaUrl ? cover : {}),
      };
      if (Object.keys(data).length) {
        await prisma.historicalSource.update({ where: { id: existing.id }, data });
        if (lectureFileId && oldFileId) await dropOldFile(prisma, oldFileId);
        filled += 1;
      }
      if ((await seedLectureTranslations(prisma, existing.id, l.slug, l.title, l.summary, adminId)) > 0 && !Object.keys(data).length) filled += 1;
    }
  }
  return { created, filled };
};

if (require.main === module) {
  const prisma = new PrismaClient();
  (async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN', deletedAt: null }, orderBy: { createdAt: 'asc' } });
    const r = await seedLectures(prisma, admin?.id ?? null);
    console.log(`Ma’ruza mavzulari: ${r.created} ta yaratildi, ${r.filled} tasi to‘ldirildi (fayl, matn yoki afisha).`);
  })()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

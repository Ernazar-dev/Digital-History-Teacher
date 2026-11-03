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
import { PERIODS } from './seed-data/periods';

const lectureText = (slug: string) => {
  const file = join(__dirname, 'seed-data', 'lectures', `${slug}.md`);
  return existsSync(file) ? readFileSync(file, 'utf8').trim() || null : null;
};

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/**
 * Ma'ruzaning Word fayli (seed-data/lectures/<slug>.docx) — platforma saqlash joyiga yoziladi va mavzuga biriktiriladi.
 * Talaba ma'ruzani shu fayl orqali o'qiydi va yuklab oladi.
 */
const seedDocxPath = (slug: string) => join(__dirname, 'seed-data', 'lectures', `${slug}.docx`);
const seedFileName = (title: string) => `${title.replace(/[^\p{L}\p{N}._ -]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 180)}.docx`;

const attachLectureFile = async (prisma: PrismaClient, slug: string, title: string, adminId: string | null) => {
  const file = seedDocxPath(slug);
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
const isOutdatedSeedFile = async (prisma: PrismaClient, mediaFileId: string, slug: string, titles: string[]) => {
  const file = await prisma.mediaFile.findUnique({ where: { id: mediaFileId }, select: { originalName: true, storage: true, storageKey: true } });
  if (!file || !titles.some((t) => seedFileName(t) === file.originalName) || !existsSync(seedDocxPath(slug))) return false;
  try {
    return !(await readAll(await driverFor(file.storage).read(file.storageKey))).equals(readFileSync(seedDocxPath(slug)));
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
      if (existing) await prisma.historicalSource.update({ where: { id: existing.id }, data });
      else await prisma.historicalSource.create({ data });
      created += 1;
    } else {
      // Ma'ruza fayli bo'sh, mazmuni yo'qolgan yoki avvalgi seed nusxasi eskirgan bo'lsa (ma'ruza yangilangan) almashtiriladi —
      // ishlayotgan administrator fayli almashtirilmaydi
      const oldFileId = existing.lectureFileId;
      const needsFile = !oldFileId || (await isFileLost(prisma, oldFileId)) || (await isOutdatedSeedFile(prisma, oldFileId, l.slug, [existing.title, l.title]));
      const lectureFileId = needsFile ? await attachLectureFile(prisma, l.slug, existing.title, adminId) : null;
      const data = {
        ...(lectureFileId ? { lectureFileId } : {}),
        // Matn faqat ma'ruza umuman bo'lmasa qo'yiladi — administrator o'z faylini yuklagan bo'lsa, tayyor matn qaytarilmaydi
        ...(!existing.lectureContent && !existing.lectureFileId && lectureContent ? { lectureContent } : {}),
        // Afisha bo'sh yoki avvalgi tashqi (Wikimedia) havola bo'lsa — platformadagi nusxa qo'yiladi
        ...(!existing.mediaFileId && (!existing.mediaUrl || existing.mediaUrl.startsWith('https://upload.wikimedia.org/')) && existing.mediaUrl !== cover.mediaUrl ? cover : {}),
      };
      if (Object.keys(data).length) {
        await prisma.historicalSource.update({ where: { id: existing.id }, data });
        if (lectureFileId && oldFileId) await dropOldFile(prisma, oldFileId);
        filled += 1;
      }
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

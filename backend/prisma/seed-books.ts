/**
 * Material papkasidagi tarixiy kitoblarni (Word) «Manbalar» bo'limiga qo'shadi. Kitob bo'laklarga bo'linmaydi — butunligicha
 * ochiladi; sahifa matnlari esa ro'yxatdagi qidiruv uchun `SourcePage` jadvaliga yoziladi. Har deployda xavfsiz:
 *  - kitob yo'q bo'lsa — yaratiladi; bor bo'lsa — faqat yo'qolgan Word fayl va sahifa matnlari tiklanadi.
 * Fayllar `seed-data/books/` ichida (tayyorlash: `node prisma/seed-data/build-books.mjs`).
 * Ishga tushirish: npm run db:seed:books
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { driverFor, storage } from '../src/modules/media/storage';

export const BOOKS_LABEL = 'Tarixiy asarlar';

interface SeedBook {
  slug: string;
  title: string;
  author: string;
  summary: string;
  dateLabel: string;
  yearFrom: number;
  yearTo: number;
  /** Vaqt chizig'idagi davr (periods.ts slug'i); null — davrga tegishli emas */
  period: string | null;
  /** Xaritada ko'rinishi uchun haqiqiy joy (faqat asar aniq joyga bog'liq bo'lsa) */
  coords?: { latitude: number; longitude: number };
  /** Muqova rasmi — frontend/public/covers ichida (manbasi: Wikimedia Commons) */
  coverUrl: string;
  coverPage: string;
  coverCredit: string;
}

export const BOOKS: SeedBook[] = [
  {
    slug: 'kitob-avesto',
    period: null,
    coverUrl: '/covers/kitob-avesto.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Faravahar_on_Fire_Temple,_Yazd.jpg',
    coverCredit: 'Faravahar — zardushtiylik ramzi, Yazd olovxonasi. Foto: Bernard Gagnon, CC BY-SA 4.0',
    title: 'Avesto — qadimgi yozma yodgorliklar',
    author: 'Qadimgi yozma yodgorliklar',
    summary: 'Zardushtiylik muqaddas kitobi Avesto va O‘rta Osiyoning qadimgi yozma yodgorliklari: qadimgi xalqlarning e’tiqodi, urf-odatlari va hayoti.',
    dateLabel: 'Mil. avv. I ming yillik',
    yearFrom: -1000,
    yearTo: -500,
  },
  {
    slug: 'kitob-buxoro-tarixi',
    period: 'ix-xiii-asrlar',
    coords: { latitude: 39.7747, longitude: 64.4108 },
    coverUrl: '/covers/kitob-buxoro-tarixi.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Ark_of_Bukhara_(%D0%A6%D0%B8%D1%82%D0%B0%D0%B4%D0%B5%D0%BB%D1%8C_%D0%90%D1%80%D0%BA._Buxoro_arki).jpg',
    coverCredit: 'Buxoro Arki. Foto: Petar Milošević, CC BY-SA 4.0',
    title: 'Buxoro tarixi',
    author: 'Abu Bakr Narshaxiy',
    summary: 'X asrda yozilgan asar: Buxoro shahrining paydo bo‘lishi, arab istilosi, Somoniylar davri va shahar hayoti haqida qadimiy manba.',
    dateLabel: 'X asr',
    yearFrom: 943,
    yearTo: 943,
  },
  {
    slug: 'kitob-zafarnoma',
    period: 'temuriylar-davri',
    coverUrl: '/covers/kitob-zafarnoma.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Sharaf_al-Din_Ali_Yazdi._Timur_Besieges_the_Georgian_Castle_of_Gortin._Miniature_manuscripts_(15th_century).jpg',
    coverCredit: '«Zafarnoma» miniatyurasi: Temur Gortin qal‘asini qamal qiladi. XV asr, jamoat mulki',
    title: 'Zafarnoma',
    author: 'Sharafiddin Ali Yazdiy',
    summary: 'Amir Temur hayoti va yurishlari haqidagi tarixiy asar: Temuriylar davlatining shakllanishi va Temurning harbiy yurishlari bayoni.',
    dateLabel: 'XV asr',
    yearFrom: 1425,
    yearTo: 1425,
  },
  {
    slug: 'kitob-boburnoma',
    period: 'temuriylar-davri',
    coverUrl: '/covers/kitob-boburnoma.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:News_of_the_loss_of_Andijan_(p._81b)._Miniature_from_the_manuscript_Baburnama_of_1590.jpg',
    coverCredit: '«Boburnoma» miniatyurasi: Andijon qo‘ldan ketgani haqida xabar, taxminan 1590. Jamoat mulki',
    title: 'Boburnoma',
    author: 'Zahiriddin Muhammad Bobur',
    summary: 'Bobur xotiralari: Farg‘ona, Samarqand, Kobul va Hindistondagi voqealar, davr tarixi, tabiat va xalqlar hayotining jonli tasviri.',
    dateLabel: 'XVI asr',
    yearFrom: 1530,
    yearTo: 1530,
  },
  {
    slug: 'kitob-shajarai-turk',
    period: 'buxoro-xonligi',
    coverUrl: '/covers/kitob-shajarai-turk.jpg',
    coverPage: 'https://commons.wikimedia.org/wiki/File:Tem%C3%BCjin_proclaimed_as_Genghis_Khan_in_1206_Jami%27_al-tawarikh_manuscript.jpg',
    coverCredit: 'Temuchin 1206-yilda Chingizxon deb e‘lon qilinadi. «Jome’ at-tavorix» miniatyurasi, jamoat mulki',
    title: 'Shajarai turk',
    author: 'Abulg‘oziy Bahodirxon',
    summary: 'Turkiy xalqlar shajarasi va tarixi: qadimgi davrlardan Chingizxon va uning avlodlari davrigacha bo‘lgan voqealar bayoni.',
    dateLabel: 'XVII asr',
    yearFrom: 1659,
    yearTo: 1659,
  },
];

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const dir = join(__dirname, 'seed-data', 'books');
const docxPath = (slug: string) => join(dir, `${slug}.docx`);
const pagesPath = (slug: string) => join(dir, `${slug}.pages.json`);

const readPages = (slug: string): string[] =>
  existsSync(pagesPath(slug)) ? (JSON.parse(readFileSync(pagesPath(slug), 'utf8')) as string[]) : [];

const fileName = (title: string) => `${title.replace(/[^\p{L}\p{N}._ -]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 180)}.docx`;

const attachPdf = async (prisma: PrismaClient, b: SeedBook, adminId: string | null) => {
  if (!existsSync(docxPath(b.slug))) return null;
  const data = readFileSync(docxPath(b.slug));
  const storageKey = `${randomUUID()}.docx`;
  await storage.save(storageKey, data);
  const media = await prisma.mediaFile.create({
    data: { originalName: fileName(b.title), storageKey, storage: storage.name, mimeType: DOCX_MIME, size: data.length, uploadedById: adminId },
  });
  return media.id;
};

/** Biriktirilgan Word yozuvi bor, lekin mazmuni saqlash joyida yo'qmi (masalan, vaqtinchalik disk tozalangan) */
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

const syncPages = async (prisma: PrismaClient, sourceId: string, slug: string) => {
  const pages = readPages(slug);
  if (!pages.length) return false;
  if ((await prisma.sourcePage.count({ where: { sourceId } })) === pages.length) return false;
  await prisma.$transaction([
    prisma.sourcePage.deleteMany({ where: { sourceId } }),
    ...Array.from({ length: Math.ceil(pages.length / 100) }, (_, i) =>
      prisma.sourcePage.createMany({
        data: pages.slice(i * 100, i * 100 + 100).map((text, j) => ({ sourceId, page: i * 100 + j + 1, text })),
      }),
    ),
  ]);
  return true;
};

export const seedBooks = async (prisma: PrismaClient, adminId: string | null) => {
  const periods = new Map((await prisma.historicalPeriod.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]));
  let created = 0;
  let filled = 0;
  for (const [i, b] of BOOKS.entries()) {
    const { slug, coverUrl, coverPage, coverCredit, period, coords, ...meta } = b;
    const periodId = period ? periods.get(period) ?? null : null;
    const cover = { mediaUrl: coverUrl, originalUrl: coverPage, license: coverCredit };
    const existing = await prisma.historicalSource.findUnique({ where: { slug } });
    let id: string;
    if (!existing || existing.deletedAt) {
      const data = {
        ...meta,
        ...cover,
        ...coords,
        periodId,
        type: 'WRITTEN' as const,
        status: 'PUBLISHED' as const,
        bookLabel: BOOKS_LABEL,
        // Kitoblar ro'yxatda eng tepada: ma'ruza mavzulari tartibi 10 dan boshlanadi
        sortOrder: i + 1,
        lectureFileId: existing?.lectureFileId ?? (await attachPdf(prisma, b, adminId)),
        createdById: adminId,
        deletedAt: null,
      };
      const row = existing
        ? await prisma.historicalSource.update({ where: { id: existing.id }, data })
        : await prisma.historicalSource.create({ data: { ...data, slug } });
      id = row.id;
      created += 1;
    } else {
      id = existing.id;
      // Muqova bo'sh bo'lsa to'ldiriladi — administrator qo'ygan rasm almashtirilmaydi
      if (!existing.mediaFileId && !existing.mediaUrl) await prisma.historicalSource.update({ where: { id }, data: cover });
      // Davr va xarita joyi ham faqat bo'sh bo'lsa to'ldiriladi
      const gaps = { ...(!existing.periodId && periodId ? { periodId } : {}), ...(existing.latitude == null && coords ? coords : {}) };
      if (Object.keys(gaps).length) await prisma.historicalSource.update({ where: { id }, data: gaps });
      if (!existing.lectureFileId || (await isFileLost(prisma, existing.lectureFileId))) {
        const lectureFileId = await attachPdf(prisma, b, adminId);
        if (lectureFileId) {
          await prisma.historicalSource.update({ where: { id }, data: { lectureFileId } });
          filled += 1;
        }
      }
    }
    if (await syncPages(prisma, id, slug)) filled += 1;
  }
  return { created, filled };
};

if (require.main === module) {
  const prisma = new PrismaClient();
  (async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN', deletedAt: null }, orderBy: { createdAt: 'asc' } });
    const r = await seedBooks(prisma, admin?.id ?? null);
    console.log(`Kitoblar: ${r.created} ta yaratildi, ${r.filled} ta qism to‘ldirildi (Word fayl yoki sahifa matni).`);
  })()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

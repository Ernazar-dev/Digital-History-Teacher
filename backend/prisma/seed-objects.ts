/**
 * Ma'ruza mavzulariga mos 3D modellar va 360° sayohatlarni kutubxonaga qo'shadi va mavzularga biriktiradi.
 * Har deployda xavfsiz ishlaydi:
 *  - obyekt yo'q bo'lsa — yaratiladi; bor bo'lsa — administrator tahriri o'zgarmaydi;
 *  - mavzuga bog'lanishlar faqat qo'shiladi (mavjudlari saqlanadi);
 *  - «Buxoro 360» qoralamasi faqat havolasi bo'sh bo'lsa to'ldiriladi va nashr etiladi.
 * Ishga tushirish: npm run db:seed:objects
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { BUXORO_360_UPDATE, OBJECTS_D, TOPIC_OBJECTS } from './seed-data/objects-d';

export const seedTopicObjects = async (prisma: PrismaClient, adminId: string | null) => {
  const periods = new Map((await prisma.historicalPeriod.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]));

  let created = 0;
  for (const o of OBJECTS_D) {
    if (await prisma.virtualObject.findUnique({ where: { slug: o.slug }, select: { id: true } })) continue;
    const { sources: _sources, tasks, period, ...rest } = o;
    const row = await prisma.virtualObject.create({ data: { ...rest, periodId: period ? periods.get(period) ?? null : null, createdById: adminId } });
    await prisma.virtualObjectTask.createMany({ data: tasks.map((t, i) => ({ ...t, sortOrder: i, virtualObjectId: row.id })) });
    created += 1;
  }

  // Avval qoralama (demo) bo'lgan Buxoro 360° obyekti haqiqiy havola bilan to'ldiriladi
  const buxoro = await prisma.virtualObject.findUnique({ where: { slug: BUXORO_360_UPDATE.slug }, select: { id: true, embedUrl: true } });
  let updated = 0;
  if (buxoro && !buxoro.embedUrl) {
    await prisma.virtualObject.update({ where: { id: buxoro.id }, data: BUXORO_360_UPDATE.data });
    updated = 1;
  }

  let linked = 0;
  for (const [topicSlug, objectSlugs] of Object.entries(TOPIC_OBJECTS)) {
    const source = await prisma.historicalSource.findFirst({ where: { slug: topicSlug, deletedAt: null }, select: { id: true } });
    if (!source) continue;
    const objects = await prisma.virtualObject.findMany({ where: { slug: { in: objectSlugs }, deletedAt: null }, select: { id: true } });
    const res = await prisma.virtualObjectSource.createMany({
      data: objects.map((o) => ({ virtualObjectId: o.id, sourceId: source.id })),
      skipDuplicates: true,
    });
    linked += res.count;
  }
  return { created, updated, linked };
};

if (require.main === module) {
  const prisma = new PrismaClient();
  (async () => {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN', deletedAt: null }, orderBy: { createdAt: 'asc' } });
    const r = await seedTopicObjects(prisma, admin?.id ?? null);
    console.log(`Mavzu obyektlari: ${r.created} ta yangi obyekt, ${r.updated} ta yangilandi, ${r.linked} ta yangi bog‘lanish.`);
  })()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

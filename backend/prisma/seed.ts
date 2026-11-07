/**
 * Prisma seed — boshlang'ich ma'lumotlar: davrlar, 13 ma'ruza mavzusi, muzey obyektlari. Qayta ishga tushirish xavfsiz (idempotent).
 * Demo foydalanuvchilar faqat NODE_ENV !== 'production' va SEED_DEMO_USERS=true bo'lganda yaratiladi.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { OBJECTS_A, type SeedObject } from './seed-data/objects-a';
import { OBJECTS_B } from './seed-data/objects-b';
import { OBJECTS_C } from './seed-data/objects-c';
import { PERIODS, TOPICS } from './seed-data/periods';
import { ensureAdmin } from '../src/modules/auth/admin-bootstrap';
import { seedDemo } from './seed-demo';
import { seedBooks } from './seed-books';
import { seedLectures } from './seed-lectures';

const prisma = new PrismaClient();

async function seedTaxonomy() {
  const periods = new Map<string, string>();
  for (const p of PERIODS) {
    const row = await prisma.historicalPeriod.upsert({ where: { slug: p.slug }, create: p, update: p });
    periods.set(p.slug, row.id);
  }
  const topics = new Map<string, string>();
  for (const t of TOPICS) {
    const data = { name: t.name, description: t.description ?? null, periodId: t.period ? periods.get(t.period) ?? null : null };
    const row = await prisma.historicalTopic.upsert({ where: { slug: t.slug }, create: { ...data, slug: t.slug }, update: data });
    topics.set(t.slug, row.id);
  }
  return { periods, topics };
}

async function seedObjects(periods: Map<string, string>, sources: Map<string, string>, adminId: string | null) {
  const ids = new Map<string, string>();
  const all: SeedObject[] = [...OBJECTS_A, ...OBJECTS_B, ...OBJECTS_C];
  for (const o of all) {
    const { sources: sourceSlugs, tasks, period, ...rest } = o;
    const data = { ...rest, periodId: period ? periods.get(period) ?? null : null, createdById: adminId };
    const row = await prisma.virtualObject.upsert({ where: { slug: o.slug }, create: data, update: data });
    ids.set(o.slug, row.id);
    await prisma.virtualObjectSource.deleteMany({ where: { virtualObjectId: row.id } });
    await prisma.virtualObjectSource.createMany({
      data: sourceSlugs.flatMap((s) => (sources.get(s) ? [{ virtualObjectId: row.id, sourceId: sources.get(s)! }] : [])),
    });
    // Topshiriqlar faqat birinchi marta yaratiladi (talaba javoblari task ID ga bog'langan)
    if ((await prisma.virtualObjectTask.count({ where: { virtualObjectId: row.id } })) === 0) {
      await prisma.virtualObjectTask.createMany({ data: tasks.map((t, i) => ({ ...t, sortOrder: i, virtualObjectId: row.id })) });
    }
  }
  return ids;
}

async function main() {
  console.log('Seed boshlandi...');
  const { periods } = await seedTaxonomy();

  // Administrator — faqat .env dagi ADMIN_USERNAME / ADMIN_PASSWORD asosida (kodda login-parol yo'q)
  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const admin =
    adminUsername && adminPassword
      ? await ensureAdmin(prisma, { username: adminUsername, password: adminPassword, fullName: process.env.ADMIN_FULL_NAME?.trim() || 'Administrator' })
      : null;
  if (!admin) console.warn('ADMIN_USERNAME/ADMIN_PASSWORD ko‘rsatilmagan — administrator yaratilmadi.');

  const demoUsers = Boolean(admin) && process.env.NODE_ENV !== 'production' && process.env.SEED_DEMO_USERS === 'true';
  const hash = (p: string) => argon2.hash(p, { type: argon2.argon2id });
  const users = demoUsers && admin ? await seedDemo.users(prisma, hash, admin.id) : null;

  const lectures = await seedLectures(prisma, admin?.id ?? null);
  console.log(`Ma’ruza mavzulari: ${lectures.created} ta yaratildi.`);
  const books = await seedBooks(prisma, admin?.id ?? null);
  console.log(`Kitoblar: ${books.created} ta yaratildi.`);
  // Muzey obyektlari eski manbalarga bog'lanmaydi (kutubxonada endi faqat ma'ruza mavzulari)
  const objects = await seedObjects(periods, new Map(), admin?.id ?? null);


  await seedDemo.content(prisma, { users, objects });
  console.log('Seed yakunlandi.', demoUsers ? 'Demo foydalanuvchilar .env (DEMO_*) asosida yaratildi.' : 'Demo foydalanuvchilar yaratilmadi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

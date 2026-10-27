/**
 * Prisma seed — demo/boshlang'ich ma'lumotlar. Qayta ishga tushirish xavfsiz (idempotent).
 * Demo foydalanuvchilar faqat NODE_ENV !== 'production' va SEED_DEMO_USERS=true bo'lganda yaratiladi.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { COMPONENTS, INDICATOR_DESCRIPTORS, LEVELS } from './seed-data/assessment';
import { CASE_QUESTIONS, REFLECTION_QUESTIONS, SURVEY_QUESTIONS, TEST_QUESTIONS, type SeedQuestion } from './seed-data/diagnostics';
import { OBJECTS_A, type SeedObject } from './seed-data/objects-a';
import { OBJECTS_B } from './seed-data/objects-b';
import { OBJECTS_C } from './seed-data/objects-c';
import { PERIODS, TOPICS } from './seed-data/periods';
import { SOURCES_A } from './seed-data/sources-a';
import { SOURCES_B } from './seed-data/sources-b';
import { SOURCES_C } from './seed-data/sources-c';
import { SOURCES_D } from './seed-data/sources-d';
import { SOURCES_E } from './seed-data/sources-e';
import { ensureAdmin } from '../src/modules/auth/admin-bootstrap';
import { seedDemo } from './seed-demo';

const prisma = new PrismaClient();
const DEMO_NOTE = 'DEMO yozuv: tavsif ta’limiy maqsadda tayyorlangan, ma’lumotlar birlamchi nashrlar bilan tekshirilishi kerak.';

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

async function seedSources(periods: Map<string, string>, topics: Map<string, string>, adminId: string | null) {
  const ids = new Map<string, string>();
  for (const s of [...SOURCES_A, ...SOURCES_B, ...SOURCES_C, ...SOURCES_D, ...SOURCES_E]) {
    const { topics: topicSlugs, variants, period, status, ...rest } = s;
    const data = {
      ...rest,
      periodId: period ? periods.get(period) ?? null : null,
      isDemo: true,
      notes: DEMO_NOTE,
      status: status ?? ('PUBLISHED' as const),
      createdById: adminId,
    };
    const row = await prisma.historicalSource.upsert({ where: { slug: s.slug }, create: data, update: data });
    ids.set(s.slug, row.id);
    await prisma.sourceTopic.deleteMany({ where: { sourceId: row.id } });
    await prisma.sourceTopic.createMany({
      data: topicSlugs.flatMap((t) => (topics.get(t) ? [{ sourceId: row.id, topicId: topics.get(t)! }] : [])),
    });
    await prisma.sourceVariant.deleteMany({ where: { sourceId: row.id } });
    await prisma.sourceVariant.createMany({ data: variants.map((v) => ({ ...v, sourceId: row.id })) });
  }
  return ids;
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

async function seedAssessment() {
  const ids = new Map<string, string>();
  for (const [i, c] of COMPONENTS.entries()) {
    const existing = await prisma.assessmentComponent.findUnique({ where: { code: c.code } });
    const row =
      existing ??
      (await prisma.assessmentComponent.create({
        data: { code: c.code, name: c.name, definition: c.definition, methods: c.methods, sortOrder: i, weight: c.weight },
      }));
    ids.set(c.code, row.id);
    if (existing) continue; // Admin o'zgartirgan konfiguratsiya qayta seed'da ustidan yozilmaydi
    await prisma.evidenceWeight.createMany({
      data: Object.entries(c.weights).map(([evidenceKind, weight]) => ({
        componentId: row.id,
        evidenceKind: evidenceKind as never,
        weight: weight as number,
      })),
    });
    for (const [ci, cr] of c.criteria.entries()) {
      await prisma.assessmentCriterion.create({
        data: {
          componentId: row.id,
          title: cr.title,
          description: cr.description,
          sortOrder: ci,
          indicators: {
            create: cr.indicators.map((title, ii) => {
              const [lowDescriptor = '', mediumDescriptor = '', highDescriptor = ''] = INDICATOR_DESCRIPTORS[title] ?? [];
              return { title, sortOrder: ii, lowDescriptor, mediumDescriptor, highDescriptor };
            }),
          },
        },
      });
    }
  }
  // Avval yaratilgan bazalar uchun: tavsifsiz indikatorlarga dastlabki daraja tavsiflari (admin tahrirlagani o'zgarmaydi)
  for (const [title, [lowDescriptor, mediumDescriptor, highDescriptor]] of Object.entries(INDICATOR_DESCRIPTORS)) {
    await prisma.assessmentIndicator.updateMany({
      where: { title, lowDescriptor: '', mediumDescriptor: '', highDescriptor: '' },
      data: { lowDescriptor, mediumDescriptor, highDescriptor },
    });
  }
  if ((await prisma.assessmentLevel.count()) === 0) {
    await prisma.assessmentLevel.createMany({ data: LEVELS.map((l, i) => ({ ...l, sortOrder: i })) });
  }
  return ids;
}

async function seedDiagnostic(
  title: string,
  stage: 'INITIAL' | 'INTERMEDIATE' | 'FINAL',
  kind: 'TEST' | 'SURVEY' | 'REFLECTION' | 'CASE',
  description: string,
  questions: SeedQuestion[],
  components: Map<string, string>,
  timeLimitMinutes: number | null,
  sourceId: string | null = null,
) {
  if (await prisma.diagnostic.findFirst({ where: { title } })) return;
  await prisma.diagnostic.create({
    data: {
      title, stage, kind, description, timeLimitMinutes, sourceId,
      questions: {
        create: questions.map((q, i) => ({
          componentId: components.get(q.component)!,
          type: q.type,
          prompt: q.prompt,
          options: q.options,
          correct: q.correct,
          points: q.points ?? 1,
          sortOrder: i,
        })),
      },
    },
  });
}

async function main() {
  console.log('Seed boshlandi...');
  const { periods, topics } = await seedTaxonomy();
  const components = await seedAssessment();

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

  const sources = await seedSources(periods, topics, admin?.id ?? null);
  const objects = await seedObjects(periods, sources, admin?.id ?? null);

  const same = 'Boshlang‘ich va yakuniy diagnostikada bir xil savollar ishlatiladi (natijalarni taqqoslash uchun).';
  await seedDiagnostic('Boshlang‘ich diagnostika: manbashunoslik va metodika testi', 'INITIAL', 'TEST', same, TEST_QUESTIONS, components, 30);
  await seedDiagnostic('Boshlang‘ich motivatsion so‘rovnoma', 'INITIAL', 'SURVEY', 'Likert shkalasi (1–5).', SURVEY_QUESTIONS, components, null);
  await seedDiagnostic('Boshlang‘ich refleksiv savollar', 'INITIAL', 'REFLECTION', 'Javoblar o‘qituvchi tomonidan baholanadi.', REFLECTION_QUESTIONS, components, null);
  await seedDiagnostic('Yakuniy diagnostika: manbashunoslik va metodika testi', 'FINAL', 'TEST', same, TEST_QUESTIONS, components, 30);
  await seedDiagnostic('Yakuniy motivatsion so‘rovnoma', 'FINAL', 'SURVEY', 'Likert shkalasi (1–5).', SURVEY_QUESTIONS, components, null);
  const caseSource = await prisma.historicalSource.findUnique({ where: { slug: 'klavixo-kundaligi' }, select: { id: true } });
  await seedDiagnostic(
    'Oraliq kompleks keys: Klavixo kundaligi asosida metodik qaror',
    'INTERMEDIATE',
    'CASE',
    'Hujjatni o‘rganing, tahlil qiling, ishonchliligini baholang, u asosida topshiriq ishlab chiqing va metodik qaroringizni izohlang. Baholashda tarixiy bilim ham, pedagogik qarorlar ham hisobga olinadi.',
    CASE_QUESTIONS,
    components,
    60,
    caseSource?.id ?? null,
  );

  await seedDemo.content(prisma, { users, sources, objects, components });
  console.log('Seed yakunlandi.', demoUsers ? 'Demo foydalanuvchilar .env (DEMO_*) asosida yaratildi.' : 'Demo foydalanuvchilar yaratilmadi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

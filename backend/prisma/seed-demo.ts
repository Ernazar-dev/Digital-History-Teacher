import type { PrismaClient } from '@prisma/client';

type Ids = Map<string, string>;
export interface DemoUsers {
  admin: string;
  teacher: string;
  students: string[];
}

const required = (name: string) => {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`SEED_DEMO_USERS=true bo'lganda ${name} .env faylida ko'rsatilishi kerak`);
  return v;
};

/** FAQAT DEVELOPMENT: demo hisoblar. Login va parollar kodda emas — .env (DEMO_*) dan olinadi. */
const demoAccounts = () => {
  const studentUsernames = required('DEMO_STUDENT_USERNAMES').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (studentUsernames.length !== 3) throw new Error('DEMO_STUDENT_USERNAMES — vergul bilan ajratilgan 3 ta login bo‘lishi kerak');
  const studentPassword = required('DEMO_STUDENT_PASSWORD');
  return [
    { key: 'teacher', username: required('DEMO_TEACHER_USERNAME').toLowerCase(), password: required('DEMO_TEACHER_PASSWORD'), fullName: 'O‘qituvchi', role: 'TEACHER' as const },
    ...studentUsernames.map((username, i) => ({ key: `s${i + 1}`, username, password: studentPassword, fullName: `Talaba ${i + 1}`, role: 'STUDENT' as const })),
  ];
};

export const seedDemo = {
  async users(prisma: PrismaClient, hash: (p: string) => Promise<string>, adminId: string): Promise<DemoUsers> {
    const ids: Record<string, string> = { admin: adminId };
    for (const a of demoAccounts()) {
      const existing = await prisma.user.findUnique({ where: { username: a.username } });
      const user =
        existing ??
        (await prisma.user.create({
          data: {
            username: a.username,
            passwordHash: await hash(a.password),
            fullName: a.fullName,
            role: a.role,
            status: 'ACTIVE',
            institution: 'Pedagogika oliy ta’lim muassasasi',
          },
        }));
      ids[a.key] = user.id;
      if (a.role === 'STUDENT') {
        await prisma.portfolio.upsert({ where: { studentId: user.id }, create: { studentId: user.id }, update: {} });
      }
    }
    return { admin: ids.admin, teacher: ids.teacher, students: [ids.s1, ids.s2, ids.s3] };
  },

  async content(
    prisma: PrismaClient,
    ctx: { users: DemoUsers | null; sources: Ids; objects: Ids; components: Ids },
  ) {
    const { users, sources, objects, components } = ctx;
    const teacherId = users?.teacher ?? null;

    // Rubrika (mezonlar kompetensiya komponentlariga bog'langan)
    const rubricTitle = 'Metodik mashg‘ulot ishlanmasini baholash rubrikasi (namuna)';
    const rubric =
      (await prisma.rubric.findFirst({ where: { title: rubricTitle } })) ??
      (await prisma.rubric.create({
        data: {
          title: rubricTitle,
          description: 'Namunaviy rubrika — o‘qituvchi o‘z mezonlariga moslashtiradi.',
          createdById: teacherId,
          criteria: {
            create: [
              { title: 'Manbalarni tanlash va asoslash', maxScore: 20, componentId: components.get('ACTIVITY'), sortOrder: 0 },
              { title: 'Manbalarni tanqidiy tahlil qilish', maxScore: 25, componentId: components.get('COGNITIVE'), sortOrder: 1 },
              { title: 'Topshiriq va interaktiv metodlarning maqsadga mosligi', maxScore: 25, componentId: components.get('ACTIVITY'), sortOrder: 2 },
              { title: 'Baholash mezonlarining aniqligi', maxScore: 15, componentId: components.get('ACTIVITY'), sortOrder: 3 },
              { title: 'Metodik qarorlar refleksiyasi', maxScore: 15, componentId: components.get('REFLECTIVE'), sortOrder: 4 },
            ],
          },
        },
      }));

    let expGroup: string | null = null;
    if (users) {
      const g1 =
        (await prisma.group.findFirst({ where: { name: 'TO-21 (tajriba guruhi)' } })) ??
        (await prisma.group.create({
          data: { name: 'TO-21 (tajriba guruhi)', kind: 'EXPERIMENTAL', academicYear: '2026–2027', teacherId: users.teacher },
        }));
      const g2 =
        (await prisma.group.findFirst({ where: { name: 'TO-22 (nazorat guruhi)' } })) ??
        (await prisma.group.create({
          data: { name: 'TO-22 (nazorat guruhi)', kind: 'CONTROL', academicYear: '2026–2027', teacherId: users.teacher },
        }));
      await prisma.groupMembership.createMany({
        data: [
          { groupId: g1.id, studentId: users.students[0] },
          { groupId: g1.id, studentId: users.students[1] },
          { groupId: g2.id, studentId: users.students[2] },
        ],
        skipDuplicates: true,
      });
      expGroup = g1.id;
    }

    await this.assignments(prisma, { teacherId, rubricId: rubric.id, sources, objects, expGroup });
    if (users) await this.sampleLesson(prisma, users.students[0], sources, objects);
  },

  async assignments(
    prisma: PrismaClient,
    ctx: { teacherId: string | null; rubricId: string; sources: Ids; objects: Ids; expGroup: string | null },
  ) {
    const { teacherId, rubricId, sources, objects, expGroup } = ctx;
    const due = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const list = [
      {
        title: '8-sinf uchun 15 daqiqalik guruhli mashg‘ulot (manbalar va 3D obyekt asosida)',
        type: 'VIRTUAL_OBJECT_LESSON' as const,
        scenario:
          'Siz 8-sinfda tarix darsini o‘tayotgan o‘qituvchisiz. Sizga ikkita yozma manba va bitta 3D tarixiy obyekt berilgan. 15 daqiqalik guruhli mashg‘ulot ishlab chiqing. O‘quvchilar manbalarni taqqoslashi va xulosalarini dalillar bilan asoslashlari kerak.',
        instructions:
          'Mashg‘ulot maqsadi, guruhlarga topshiriqlar, vaqt taqsimoti, kutilgan natija va baholash mezonlarini yozing. Har bir metodik qaroringizni qisqa asoslang.',
        evidenceKind: 'PRACTICAL_TASK' as const,
        dueDate: due(14),
        rubricId,
        sourceSlugs: ['zafarnoma-sharafuddin-ali-yazdiy', 'klavixo-kundaligi'],
        objectSlugs: ['bibixonim-masjidi'],
      },
      {
        title: 'Amir Temur haqidagi ikki manbani taqqoslash',
        type: 'SOURCE_COMPARISON' as const,
        scenario:
          'Amir Temur faoliyatiga oid ikki manbani — saroy tarixchisi asari va muxolif muallif asarini taqqoslang. O‘xshash va farqli jihatlarni aniqlang va xulosangizni dalillar bilan asoslang.',
        instructions: 'So‘ngra ushbu manbalarni maktab darsida qanday qo‘llash mumkinligini va o‘quvchilarga qanday topshiriq berishni yozing.',
        evidenceKind: 'SOURCE_ANALYSIS' as const,
        dueDate: due(10),
        rubricId: null,
        sourceSlugs: ['zafarnoma-sharafuddin-ali-yazdiy', 'ibn-arabshoh-ajoib-al-maqdur'],
        objectSlugs: [],
      },
      {
        title: '«O‘zbekistonda jadidchilik harakati» mavzusida 45 daqiqalik dars ishlanmasi',
        type: 'LESSON_PLAN' as const,
        scenario:
          'Dars konstruktori yordamida jadidchilik harakatiga oid raqamli manbalar asosida 45 daqiqalik dars ishlanmasini tayyorlang. O‘quvchilarga jadidlarning ta’limga oid qarashlarini tahlil qilish topshirig‘ini bering.',
        instructions: 'Dars ishlanmasini konstruktorda yarating va ushbu topshiriqqa biriktiring.',
        evidenceKind: 'LESSON_PLAN' as const,
        dueDate: due(21),
        rubricId,
        sourceSlugs: ['behbudiy-oyina-jurnali'],
        objectSlugs: [],
      },
      {
        title: 'Manbani o‘quvchilar yoshiga moslashtirish',
        type: 'SOURCE_ADAPTATION' as const,
        scenario:
          'Tanlangan tarixiy manba tavsifini 6–7-sinf o‘quvchilari uchun moslashtiring: qisqa matn, tushunarsiz so‘zlar lug‘ati va 3 ta savol tuzing.',
        instructions: 'Moslashtirishda manba mazmuni buzilmasligiga e’tibor bering va qaysi qismlarni nima uchun qisqartirganingizni izohlang.',
        evidenceKind: 'PRACTICAL_TASK' as const,
        dueDate: null,
        rubricId: null,
        sourceSlugs: ['boburnoma'],
        objectSlugs: [],
      },
      // 6-modul raqamli simulyatori: avtomatik tekshiriladigan topshiriqlar
      {
        title: 'Temuriylar davri voqealarini xronologik tartibga soling',
        type: 'CHRONOLOGY' as const,
        scenario:
          'Amir Temur va temuriylar davriga oid voqealar aralash tartibda berilgan. Ularni eng qadimgisidan eng keyingisigacha tartiblang.',
        instructions:
          'Simulyatorda tartibni belgilang. Javob maydonida shu topshiriqni 7-sinf darsida qanday qo‘llashingizni qisqa yozing.',
        evidenceKind: 'PRACTICAL_TASK' as const,
        dueDate: due(7),
        rubricId: null,
        sourceSlugs: ['zafarnoma-sharafuddin-ali-yazdiy', 'klavixo-kundaligi'],
        objectSlugs: [],
        simulator: {
          kind: 'CHRONOLOGY',
          events: [
            { id: 'e1', text: 'Amir Temur Movarounnahrda hokimiyatni qo‘lga oldi', year: 1370 },
            { id: 'e2', text: 'Samarqandda Bibixonim jome masjidi qurilishi boshlandi', year: 1399 },
            { id: 'e3', text: 'Anqara jangi', year: 1402 },
            { id: 'e4', text: 'Kastiliya elchisi Klavixo Samarqandga keldi', year: 1404 },
            { id: 'e5', text: 'Amir Temur vafot etdi', year: 1405 },
            { id: 'e6', text: 'Samarqanddagi Ulug‘bek madrasasi qurib bitkazildi', year: 1420 },
          ],
        },
      },
      {
        title: 'Buyuk ipak yo‘lidagi tarixiy shaharlarni xaritada belgilang',
        type: 'MAP_IDENTIFICATION' as const,
        scenario:
          'Buyuk ipak yo‘lining O‘zbekiston hududidagi tarixiy shaharlarini interaktiv xaritada belgilang. Ruxsat etilgan xato — 40 km.',
        instructions: 'Har bir shaharni xaritaga qo‘ying. Javob maydonida savdo yo‘li shaharlar taraqqiyotiga qanday ta’sir qilganini 3–4 gapda yozing.',
        evidenceKind: 'PRACTICAL_TASK' as const,
        dueDate: due(7),
        rubricId: null,
        sourceSlugs: [],
        objectSlugs: [],
        simulator: {
          kind: 'MAP',
          toleranceKm: 40,
          places: [
            { id: 'samarqand', label: 'Samarqand', lat: 39.6542, lng: 66.9597 },
            { id: 'buxoro', label: 'Buxoro', lat: 39.7747, lng: 64.4286 },
            { id: 'xiva', label: 'Xiva', lat: 41.3783, lng: 60.3639 },
            { id: 'shahrisabz', label: 'Shahrisabz', lat: 39.0578, lng: 66.8306 },
            { id: 'toshkent', label: 'Toshkent (Choch)', lat: 41.2995, lng: 69.2401 },
          ],
        },
      },
    ];
    for (const a of list) {
      if (await prisma.assignment.findFirst({ where: { title: a.title } })) continue;
      const { sourceSlugs, objectSlugs, ...data } = a;
      await prisma.assignment.create({
        data: {
          ...data,
          status: 'PUBLISHED',
          createdById: teacherId,
          groups: expGroup ? { create: [{ groupId: expGroup }] } : undefined,
          sources: { create: sourceSlugs.flatMap((s) => (sources.get(s) ? [{ sourceId: sources.get(s)! }] : [])) },
          virtualObjects: { create: objectSlugs.flatMap((o) => (objects.get(o) ? [{ virtualObjectId: objects.get(o)! }] : [])) },
        },
      });
    }
  },

  /** Talaba tomonidan boshlangan namunaviy dars ishlanmasi (qoralama) */
  async sampleLesson(prisma: PrismaClient, studentId: string, sources: Ids, objects: Ids) {
    const title = 'Amir Temur davrida Samarqand me’morchiligi (namuna qoralama)';
    if (await prisma.lessonPlan.findFirst({ where: { title } })) return;
    const lesson = await prisma.lessonPlan.create({
      data: {
        authorId: studentId,
        title,
        topic: 'Temuriylar davri me’morchiligi',
        gradeLevel: '8',
        durationMinutes: 45,
        goals: 'O‘quvchilarda me’moriy obidani tarixiy manba sifatida tahlil qilish ko‘nikmasini shakllantirish.',
        learningOutcomes: 'O‘quvchi obida tafsilotlarini dalil sifatida ishlatib, uning davri haqida asosli xulosa chiqaradi.',
        problemQuestions: ['Nega Amir Temur poytaxtda ulkan masjid qurdirgan?'],
        interactiveMethods: ['Guruhli ish', 'Kuzatuv varag‘i'],
        stages: {
          create: [
            { sortOrder: 0, title: 'Motivatsiya', durationMinutes: 5, teacherActivity: 'Muammoli savolni qo‘yadi', studentActivity: 'Taxminlarini aytadi' },
            { sortOrder: 1, title: '3D obyekt kuzatuvi', durationMinutes: 15, teacherActivity: 'Kuzatuv varag‘ini tarqatadi', studentActivity: 'Guruhlarda modelni o‘rganadi' },
          ],
        },
        resources: {
          create: [
            ...(sources.get('klavixo-kundaligi') ? [{ sourceId: sources.get('klavixo-kundaligi')!, purpose: 'Guvoh tavsifi bilan taqqoslash' }] : []),
            ...(objects.get('bibixonim-masjidi') ? [{ virtualObjectId: objects.get('bibixonim-masjidi')!, purpose: 'Kuzatuv obyekti' }] : []),
          ],
        },
      },
    });
    await prisma.lessonPlanVersion.create({
      data: { lessonPlanId: lesson.id, version: 1, snapshot: { title, note: 'Seed namunasi' }, note: 'Dastlabki versiya' },
    });
  },
};

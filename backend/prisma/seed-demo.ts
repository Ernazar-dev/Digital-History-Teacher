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
    ctx: { users: DemoUsers | null; objects: Ids },
  ) {
    const { users, objects } = ctx;
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
    }

    if (users) await this.sampleLesson(prisma, users.students[0], objects);
  },

  /** Talaba tomonidan boshlangan namunaviy dars ishlanmasi (qoralama) */
  async sampleLesson(prisma: PrismaClient, studentId: string, objects: Ids) {
    const title = 'Amir Temur davrida Samarqand me’morchiligi (namuna qoralama)';
    if (await prisma.lessonPlan.findFirst({ where: { title } })) return;
    const lesson = await prisma.lessonPlan.create({
      data: {
        authorId: studentId,
        title,
        topic: 'Temuriylar davri me’morchiligi',
        gradeLevel: '2',
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

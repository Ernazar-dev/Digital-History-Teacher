import { prisma } from '../../config/prisma';
import { AppError } from '../../shared/errors/AppError';
import { assertCanAccessStudent } from '../../shared/utils/access';
import { computeProfile } from '../assessments/competence.service';
import { studentAssignmentWhere } from '../assignments/assignments.service';
import { resolveOutcomes } from '../portfolios/portfolio.summary';

/**
 * Hujjat, 6-modul: «o'yin elementlari, reyting, yutuqlar va individual o'quv traektoriyasi».
 * Hammasi mavjud ishlardan HISOBLANADI (alohida jadval yo'q) — ballni sun'iy oshirib bo'lmaydi,
 * natija har doim o'qituvchi baholagan ishlarga mos keladi.
 */

const ACHIEVEMENT_BONUS = 5;
const LEVELS = [
  { min: 0, name: 'Izlanuvchi' },
  { min: 40, name: 'Manbashunos' },
  { min: 90, name: 'Tahlilchi' },
  { min: 150, name: 'Metodist' },
  { min: 230, name: 'Ustoz' },
];

interface Achievement { code: string; title: string; description: string; earned: boolean; current: number; target: number }

const levelFor = (points: number) => {
  const idx = LEVELS.reduce((acc, l, i) => (points >= l.min ? i : acc), 0);
  const next = LEVELS[idx + 1];
  return { index: idx + 1, name: LEVELS[idx].name, points, nextName: next?.name ?? null, nextAt: next?.min ?? null };
};

/** Talabaning ishlari, ballari va yutuqlari */
const evaluate = async (studentId: string) => {
  const portfolio = await prisma.portfolio.findUnique({ where: { studentId }, include: { items: true } });
  const items = portfolio?.items ?? [];
  const outcomes = await resolveOutcomes(items);
  const reviewed = items
    .map((i) => ({ ...i, outcome: outcomes.get(i.id)! }))
    .filter((i) => i.outcome.percent !== null && ['REVIEWED', 'GRADED'].includes(i.outcome.status ?? ''));

  const [perfectSims, revisedGraded, initial, final, profile] = await Promise.all([
    prisma.assignmentSubmission.findMany({
      where: { studentId, autoScore: 100, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'GRADED', 'RETURNED'] } },
      select: { assignment: { select: { type: true } } },
    }),
    prisma.assignmentSubmission.count({ where: { studentId, status: 'GRADED', version: { gte: 2 } } }),
    computeProfile(studentId, 'INITIAL'),
    computeProfile(studentId, 'FINAL'),
    computeProfile(studentId),
  ]);

  const count = (pred: (i: (typeof reviewed)[number]) => boolean) => reviewed.filter(pred).length;
  const submittedAnalyses = items.filter((i) => i.refType === 'SourceAnalysis').length;
  const strongAnalyses = count((i) => ['SourceAnalysis', 'SourceComparison'].includes(i.refType) && i.outcome.percent! >= 70);
  const a = (code: string, title: string, description: string, current: number, target: number): Achievement => ({
    code, title, description, current: Math.min(current, target), target, earned: current >= target,
  });
  const achievements: Achievement[] = [
    a('FIRST_ANALYSIS', 'Birinchi qadam', 'Birinchi manba tahlilini topshiring', submittedAnalyses, 1),
    a('CRITIC', 'Tanqidiy tahlilchi', '5 ta manba tahlili yoki taqqoslash 70% dan yuqori baholansin', strongAnalyses, 5),
    a('COMPARATOR', 'Taqqoslovchi', 'Manbalarni taqqoslash ishi baholansin', count((i) => i.refType === 'SourceComparison'), 1),
    a('LESSON_DESIGNER', 'Dars loyihachisi', 'Dars ishlanmasi 70% dan yuqori baholansin', count((i) => i.refType === 'LessonPlan' && i.outcome.percent! >= 70), 1),
    a('CHRONOLOGIST', 'Xronolog', 'Xronologiya simulyatorini xatosiz bajaring', perfectSims.filter((s) => s.assignment.type === 'CHRONOLOGY').length, 1),
    a('CARTOGRAPHER', 'Kartograf', 'Xarita simulyatorida barcha joylarni to‘g‘ri belgilang', perfectSims.filter((s) => s.assignment.type === 'MAP_IDENTIFICATION').length, 1),
    a('REVISER', 'Xatolar ustida ishlash', 'Qaytarilgan topshiriqni qayta ishlab, baho oling', revisedGraded, 1),
    a('HIGH_LEVEL', 'Yuqori daraja', 'Kamida bitta kompetensiya komponentida «Yuqori» darajaga chiqing', profile.components.filter((c) => c.level?.code === 'HIGH').length, 1),
    a(
      'GROWTH', 'O‘sish', 'Yakuniy diagnostika natijasi boshlang‘ichdan yuqori bo‘lsin',
      initial.overall !== null && final.overall !== null && final.overall > initial.overall ? 1 : 0, 1,
    ),
  ];

  const workPoints = reviewed.reduce((s, i) => s + Math.round(i.outcome.percent! / 10), 0);
  const points = workPoints + achievements.filter((x) => x.earned).length * ACHIEVEMENT_BONUS;
  return { points, workPoints, reviewedCount: reviewed.length, level: levelFor(points), achievements, profile };
};

const STEP_FOR: Record<string, { title: string; link: string; why: string }> = {
  COGNITIVE: { title: 'Manbani tanqidiy tahlil qiling', link: '/app/analysis', why: 'manbalarni bilish va tahlil qilish' },
  ACTIVITY: { title: 'Dars ishlanmasi yoki amaliy topshiriq bajaring', link: '/app/lessons/new', why: 'manba asosida dars loyihalash' },
  MOTIVATIONAL: { title: 'Motivatsiya so‘rovnomasini to‘ldiring: raqamli manbalar sizga nima berdi?', link: '/app/competence', why: 'kasbiy qiziqish va intilish' },
  REFLECTIVE: { title: 'O‘zingizni baholang va natijani o‘qituvchi bahosi bilan solishtiring', link: '/app/competence', why: 'o‘z faoliyatini tahlil qilish' },
};

/** Individual o'quv traektoriyasi: hozir nimani qilish kerak — muhimlik tartibida */
const trajectory = async (studentId: string, profile: Awaited<ReturnType<typeof computeProfile>>) => {
  const steps: { priority: number; kind: string; title: string; reason: string; link: string; due?: Date | null }[] = [];
  const returned = { studentId, status: 'RETURNED' as const };
  const [analyses, lessons, submissions, assignments, diagnostics, analyzedIds] = await Promise.all([
    prisma.sourceAnalysis.findMany({ where: returned, select: { id: true, source: { select: { title: true } } } }),
    prisma.lessonPlan.findMany({ where: { authorId: studentId, status: 'RETURNED', deletedAt: null }, select: { id: true, title: true } }),
    prisma.assignmentSubmission.findMany({ where: returned, select: { assignment: { select: { id: true, title: true } } } }),
    prisma.assignment.findMany({
      where: { AND: [studentAssignmentWhere(studentId), { submissions: { none: { studentId, status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'GRADED', 'RETURNED'] } } } }] },
      select: { id: true, title: true, dueDate: true },
      orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }],
      take: 5,
    }),
    prisma.diagnostic.findMany({
      where: { deletedAt: null, isActive: true, attempts: { none: { studentId, status: { not: 'IN_PROGRESS' } } } },
      select: { id: true, title: true, stage: true },
      orderBy: [{ stage: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.sourceAnalysis.findMany({ where: { studentId }, select: { sourceId: true } }),
  ]);

  for (const x of analyses) steps.push({ priority: 1, kind: 'RETURNED', title: `Qaytarilgan tahlilni qayta ishlang: ${x.source.title}`, reason: 'O‘qituvchi izohlarini hisobga oling', link: `/app/analysis/${x.id}` });
  for (const x of lessons) steps.push({ priority: 1, kind: 'RETURNED', title: `Qaytarilgan dars ishlanmasini yaxshilang: ${x.title}`, reason: 'O‘qituvchi izohlarini hisobga oling', link: `/app/lessons/${x.id}/edit` });
  for (const x of submissions) steps.push({ priority: 1, kind: 'RETURNED', title: `Qaytarilgan topshiriqni qayta topshiring: ${x.assignment.title}`, reason: 'O‘qituvchi izohlarini hisobga oling', link: `/app/assignments/${x.assignment.id}` });
  const DAY = 24 * 60 * 60 * 1000;
  for (const x of assignments) {
    const left = x.dueDate ? x.dueDate.getTime() - Date.now() : null;
    const reason = left === null ? 'Hali topshirilmagan' : left < 0 ? 'Muddati o‘tgan — imkon qadar tezroq topshiring' : left < 3 * DAY ? 'Muddat yaqinlashmoqda' : 'Hali topshirilmagan';
    steps.push({ priority: left !== null && left < 3 * DAY ? 1.5 : 2, kind: 'ASSIGNMENT', title: `Topshiriqni bajaring: ${x.title}`, reason, link: `/app/assignments/${x.id}`, due: x.dueDate });
  }
  for (const d of diagnostics.slice(0, 3)) steps.push({ priority: 3, kind: 'DIAGNOSTIC', title: `Diagnostikani topshiring: ${d.title}`, reason: 'Kompetensiya dinamikasini kuzatish uchun', link: `/app/diagnostics/${d.id}/take` });

  // Eng zaif komponentlar — dalil yo'q yoki «Yuqori» darajaga yetmagan
  const weak = profile.components
    .filter((c) => c.level?.code !== 'HIGH')
    .sort((a, b) => (a.score ?? -1) - (b.score ?? -1))
    .slice(0, 2);
  for (const c of weak) {
    const tpl = STEP_FOR[c.code];
    if (!tpl) continue;
    const reason = c.score === null ? `${c.name}: dalil hali yo‘q (${tpl.why})` : `${c.name}: ${c.score}% — ${c.level?.name ?? ''} daraja (${tpl.why})`;
    if (c.code === 'COGNITIVE') {
      // Hali tahlil qilinmagan manbani aniq taklif qilamiz
      const next = await prisma.historicalSource.findFirst({
        where: { status: 'PUBLISHED', deletedAt: null, id: { notIn: analyzedIds.map((s) => s.sourceId) } },
        select: { title: true, slug: true },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        steps.push({ priority: 4, kind: 'COMPONENT', title: `Manbani tanqidiy tahlil qiling: ${next.title}`, reason, link: `/app/sources/${next.slug}` });
        continue;
      }
    }
    steps.push({ priority: 4, kind: 'COMPONENT', title: tpl.title, reason, link: tpl.link });
  }
  return steps.sort((a, b) => a.priority - b.priority);
};

/** Ismni qisqartirish: reytingda boshqa talabalarning to'liq ismi ko'rsatilmaydi */
const mask = (fullName: string) =>
  fullName.split(/\s+/).filter(Boolean).map((p, i) => (i === 0 ? p : `${p[0]}.`)).join(' ');

export const progressService = {
  async get(actor: Express.AuthUser, studentId: string) {
    await assertCanAccessStudent(actor, studentId);
    const result = await evaluate(studentId);
    const steps = await trajectory(studentId, result.profile);
    const groups = await prisma.groupMembership.findMany({
      where: { studentId, group: { deletedAt: null } },
      select: { group: { select: { id: true, name: true } } },
    });
    const { profile: _profile, ...rest } = result;
    return { ...rest, trajectory: steps, groups: groups.map((g) => g.group) };
  },

  /** Guruh reytingi. Talaba faqat o'z guruhini ko'radi, boshqalarning ismi qisqartiriladi */
  async leaderboard(actor: Express.AuthUser, groupId: string) {
    const group = await prisma.group.findFirst({
      where: { id: groupId, deletedAt: null },
      include: { members: { include: { student: { select: { id: true, fullName: true } } } } },
    });
    if (!group) throw AppError.notFound('Guruh topilmadi');
    const isMember = group.members.some((m) => m.studentId === actor.id);
    if (actor.role === 'STUDENT' ? !isMember : actor.role === 'TEACHER' && group.teacherId !== actor.id) throw AppError.forbidden();

    const rows = await Promise.all(
      group.members.map(async (m) => {
        const r = await evaluate(m.studentId);
        return {
          studentId: m.studentId,
          name: actor.role === 'STUDENT' && m.studentId !== actor.id ? mask(m.student.fullName) : m.student.fullName,
          isMe: m.studentId === actor.id,
          points: r.points,
          level: r.level.name,
          achievements: r.achievements.filter((x) => x.earned).length,
        };
      }),
    );
    rows.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
    let rank = 0;
    let prev: number | null = null;
    const ranked = rows.map((r, i) => {
      if (r.points !== prev) rank = i + 1;
      prev = r.points;
      return { ...r, rank };
    });
    return { group: { id: group.id, name: group.name }, rows: ranked };
  },
};

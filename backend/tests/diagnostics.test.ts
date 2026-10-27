import { beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { autoScore } from '../src/modules/diagnostics/attempts.service';
import { api, ensureAssessmentConfig, userWithToken } from './helpers';

const opts = [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }, { id: 'c', text: 'C' }];

describe('Diagnostika: avtomatik baholash', () => {
  it('bir va ko‘p tanlovli, Likert va matnli savollar', () => {
    expect(autoScore({ type: 'SINGLE_CHOICE', options: opts, correct: ['b'], points: 2 }, 'b').score).toBe(2);
    expect(autoScore({ type: 'SINGLE_CHOICE', options: opts, correct: ['b'], points: 2 }, 'a').score).toBe(0);
    expect(autoScore({ type: 'MULTIPLE_CHOICE', options: opts, correct: ['a', 'c'], points: 1 }, ['c', 'a']).isCorrect).toBe(true);
    expect(autoScore({ type: 'MULTIPLE_CHOICE', options: opts, correct: ['a', 'c'], points: 1 }, ['a']).score).toBe(0);
    expect(autoScore({ type: 'LIKERT', options: opts, correct: null, points: 1 }, 'c').score).toBe(1);
    expect(autoScore({ type: 'LIKERT', options: opts, correct: null, points: 1 }, 'b').score).toBe(0.5);
    expect(autoScore({ type: 'TEXT', options: null, correct: null, points: 4 }, 'Javob').score).toBeNull();
    expect(autoScore({ type: 'TEXT', options: null, correct: null, points: 4 }, '').score).toBe(0);
  });
});

describe('Diagnostika: urinish oqimi', () => {
  let components: Record<string, string>;
  beforeAll(async () => {
    components = await ensureAssessmentConfig();
  });

  it('boshlash, saqlash, topshirish, matnni baholash va bosqichli dalillar', async () => {
    const teacher = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');
    const group = await api().post('/api/v1/groups').set(teacher.auth).send({ name: 'Diagnostika guruhi' });
    await api().post(`/api/v1/groups/${group.body.data.id}/members`).set(teacher.auth).send({ studentIds: [student.user.id] });

    const created = await api().post('/api/v1/diagnostics').set(teacher.auth).send({
      title: 'Boshlang‘ich test (sinov)', stage: 'INITIAL', kind: 'TEST',
      questions: [
        { componentId: components.COGNITIVE, type: 'SINGLE_CHOICE', prompt: 'Birlamchi manba?', options: opts, correct: ['b'] },
        { componentId: components.COGNITIVE, type: 'MULTIPLE_CHOICE', prompt: 'Togrilarini belgilang', options: opts, correct: ['a', 'c'] },
        { componentId: components.ACTIVITY, type: 'TEXT', prompt: 'Muammoli savol tuzing', points: 4 },
      ],
    });
    expect(created.status).toBe(201);
    const did = created.body.data.id;

    const view = await api().get(`/api/v1/diagnostics/${did}`).set(student.auth);
    expect(view.body.data.questions.every((q: { correct: unknown }) => q.correct === null)).toBe(true);

    const attempt = await api().post(`/api/v1/diagnostics/${did}/attempts`).set(student.auth);
    const atid = attempt.body.data.id;
    const [q1, q2, q3] = created.body.data.questions as { id: string }[];
    const answers = { [q1.id]: 'b', [q2.id]: ['a'], [q3.id]: 'Nega...?' };
    await api().put(`/api/v1/diagnostics/attempts/${atid}/responses`).set(student.auth).send({ answers });
    expect((await api().post(`/api/v1/diagnostics/attempts/${atid}/submit`).set(student.auth)).status).toBe(200);

    let records = await prisma.competenceRecord.findMany({ where: { refId: atid } });
    expect(records).toHaveLength(1);
    expect(records[0].score).toBe(50);
    expect(records[0].stage).toBe('INITIAL');

    const newQuestions = [{ componentId: components.COGNITIVE, type: 'TEXT', prompt: 'Yangi savol' }];
    const locked = await api().patch(`/api/v1/diagnostics/${did}`).set(teacher.auth).send({ questions: newQuestions });
    expect(locked.status).toBe(409);

    const graded = await api().post(`/api/v1/diagnostics/attempts/${atid}/grade`).set(teacher.auth).send({ grades: [{ questionId: q3.id, score: 3 }] });
    expect(graded.status).toBe(200);
    records = await prisma.competenceRecord.findMany({ where: { refId: atid } });
    expect(records).toHaveLength(2);
    const attemptRow = await prisma.diagnosticAttempt.findUnique({ where: { id: atid } });
    expect(attemptRow?.status).toBe('REVIEWED');

    const dyn = await api().get(`/api/v1/assessments/students/${student.user.id}/dynamics`).set(teacher.auth);
    expect(dyn.body.data.byStage.INITIAL.overall).not.toBeNull();
  });
});

describe('Baholash markazi: indikatorlar va kompleks keys (5-modul)', () => {
  let components: Record<string, string>;
  beforeAll(async () => {
    components = await ensureAssessmentConfig();
  });

  it('komponent indikatorlar bo‘yicha baholanadi: Past=1, O‘rta=2, Yuqori=3 ball', async () => {
    const teacher = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');
    const group = await api().post('/api/v1/groups').set(teacher.auth).send({ name: 'Indikator guruhi' });
    await api().post(`/api/v1/groups/${group.body.data.id}/members`).set(teacher.auth).send({ studentIds: [student.user.id] });

    const criterion = await prisma.assessmentCriterion.create({
      data: {
        componentId: components.ACTIVITY, title: `Sinov mezoni ${Date.now()}`,
        indicators: { create: [{ title: 'Ind A', sortOrder: 0, highDescriptor: 'aniq' }, { title: 'Ind B', sortOrder: 1 }, { title: 'Ind C', sortOrder: 2 }] },
      },
      include: { indicators: true },
    });
    const all = await prisma.assessmentIndicator.findMany({ where: { criterion: { componentId: components.ACTIVITY } } });
    const [a, b, c] = criterion.indicators.sort((x, y) => x.sortOrder - y.sortOrder);

    const partial = await api().post('/api/v1/assessments/indicator-ratings').set(teacher.auth)
      .send({ studentId: student.user.id, componentId: components.ACTIVITY, ratings: [{ indicatorId: a.id, level: 'HIGH' }] });
    expect(partial.status).toBe(422);

    const levels = { [a.id]: 'HIGH', [b.id]: 'MEDIUM', [c.id]: 'LOW' } as Record<string, string>;
    const ratings = all.map((i) => ({ indicatorId: i.id, level: levels[i.id] ?? 'MEDIUM' }));
    const res = await api().post('/api/v1/assessments/indicator-ratings').set(teacher.auth)
      .send({ studentId: student.user.id, componentId: components.ACTIVITY, stage: 'INTERMEDIATE', ratings, note: 'Kuzatuv' });
    expect(res.status).toBe(201);
    const points = ratings.reduce((s, r) => s + ({ LOW: 1, MEDIUM: 2, HIGH: 3 } as Record<string, number>)[r.level], 0);
    expect(res.body.data.score).toBeCloseTo((points / (ratings.length * 3)) * 100, 1);
    expect(res.body.data.evidenceKind).toBe('EXPERT');
    expect(res.body.data.details).toHaveLength(ratings.length);

    const otherStudent = await userWithToken('STUDENT');
    const denied = await api().post('/api/v1/assessments/indicator-ratings').set(teacher.auth)
      .send({ studentId: otherStudent.user.id, componentId: components.ACTIVITY, ratings });
    expect(denied.status).toBe(403);
  });

  it('kompleks keys: manba biriktiriladi, savollar komponentiga mos dalil beradi', async () => {
    const teacher = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');
    const group = await api().post('/api/v1/groups').set(teacher.auth).send({ name: 'Keys guruhi' });
    await api().post(`/api/v1/groups/${group.body.data.id}/members`).set(teacher.auth).send({ studentIds: [student.user.id] });
    const source = await prisma.historicalSource.create({
      data: { title: 'Keys hujjati', slug: `keys-${Date.now()}`, summary: 'Keys uchun manba', type: 'WRITTEN', status: 'PUBLISHED' },
    });

    const created = await api().post('/api/v1/diagnostics').set(teacher.auth).send({
      title: 'Kompleks keys (sinov)', stage: 'INTERMEDIATE', kind: 'CASE', sourceId: source.id,
      questions: [
        { componentId: components.COGNITIVE, type: 'TEXT', prompt: 'Hujjatni tahlil qiling', points: 10 },
        { componentId: components.ACTIVITY, type: 'TEXT', prompt: 'Topshiriq tuzing', points: 10 },
        { componentId: components.REFLECTIVE, type: 'TEXT', prompt: 'Qaroringizni izohlang', points: 10 },
      ],
    });
    expect(created.status).toBe(201);
    expect(created.body.data.source.id).toBe(source.id);
    const did = created.body.data.id;
    const view = await api().get(`/api/v1/diagnostics/${did}`).set(student.auth);
    expect(view.body.data.source.slug).toBe(source.slug);

    const attempt = await api().post(`/api/v1/diagnostics/${did}/attempts`).set(student.auth);
    const atid = attempt.body.data.id;
    const qs = created.body.data.questions as { id: string }[];
    await api().put(`/api/v1/diagnostics/attempts/${atid}/responses`).set(student.auth)
      .send({ answers: Object.fromEntries(qs.map((q) => [q.id, 'Javob'])) });
    await api().post(`/api/v1/diagnostics/attempts/${atid}/submit`).set(student.auth);
    await api().post(`/api/v1/diagnostics/attempts/${atid}/grade`).set(teacher.auth)
      .send({ grades: [{ questionId: qs[0].id, score: 8 }, { questionId: qs[1].id, score: 6 }, { questionId: qs[2].id, score: 9 }] });

    const records = await prisma.competenceRecord.findMany({ where: { refId: atid }, include: { component: { select: { code: true } } } });
    const kinds = Object.fromEntries(records.map((r) => [r.component.code, r.evidenceKind]));
    expect(kinds).toEqual({ COGNITIVE: 'SOURCE_ANALYSIS', ACTIVITY: 'PRACTICAL_TASK', REFLECTIVE: 'REFLECTION' });
    expect(records.find((r) => r.component.code === 'ACTIVITY')?.score).toBe(60);

    const bad = await api().post('/api/v1/diagnostics').set(teacher.auth).send({
      title: 'Yomon keys', stage: 'INTERMEDIATE', kind: 'CASE', sourceId: '00000000-0000-4000-8000-000000000000',
      questions: [{ componentId: components.COGNITIVE, type: 'TEXT', prompt: 'Savol' }],
    });
    expect(bad.status).toBe(400);
  });
});

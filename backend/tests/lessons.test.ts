import { beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { api, createSource, ensureAssessmentConfig, userWithToken } from './helpers';

/** Hujjatdagi 3-modul bandlarining qolgan qismi: vazifalar, topshiriqlar, metodlar, asosnoma */
const COMPLETION = {
  objectives: 'Manbani tahlil qilish ko‘nikmasini shakllantirish',
  individualTasks: 'Behbudiy maqolasidan asosiy g‘oyalarni ajrating',
  groupTasks: 'Guruhlarda jadidlarning ta’limga oid qarashlarini baholang',
  interactiveMethods: ['Guruhli ish', 'Insert'],
  methodicalRationale: 'Birlamchi manba o‘quvchini dalil bilan ishlashga undaydi',
};

const ready = async () => {
  const student = await userWithToken('STUDENT');
  const teacher = await userWithToken('TEACHER');
  const group = await api().post('/api/v1/groups').set(teacher.auth).send({ name: 'Dars guruhi' });
  await api().post(`/api/v1/groups/${group.body.data.id}/members`).set(teacher.auth).send({ studentIds: [student.user.id] });
  return { student, teacher };
};

describe('Dars konstruktori', () => {
  beforeAll(async () => {
    await ensureAssessmentConfig();
  });

  it('yaratish, versiyalash, to‘liqlik tekshiruvi, topshirish va ekspertiza', async () => {
    const { student, teacher } = await ready();
    const source = await createSource();

    const created = await api().post('/api/v1/lessons').set(student.auth).send({
      title: 'Jadidlar va ta’lim', topic: 'Jadidchilik', gradeLevel: '9', durationMinutes: 45,
    });
    expect(created.status).toBe(201);
    expect(created.body.data.currentVersion).toBe(1);
    const id = created.body.data.id;

    const notReady = await api().post(`/api/v1/lessons/${id}/submit`).set(student.auth);
    expect(notReady.status).toBe(422);
    expect(notReady.body.error.details.problems.length).toBeGreaterThan(3);

    const tooLong = await api().patch(`/api/v1/lessons/${id}`).set(student.auth).send({
      goals: 'Maqsad', learningOutcomes: 'Natija', assessmentCriteria: 'Mezon', reflectionQuestions: 'Savol',
      problemQuestions: ['Nega jadidlar yangi usul maktablarini ochgan?'],
      resources: [{ sourceId: source.id, purpose: 'Asosiy manba' }],
      stages: [{ title: 'Kirish', durationMinutes: 30 }, { title: 'Asosiy', durationMinutes: 30 }],
    });
    expect(tooLong.body.data.currentVersion).toBe(2);
    expect((await api().post(`/api/v1/lessons/${id}/submit`).set(student.auth)).status).toBe(422);

    await api().patch(`/api/v1/lessons/${id}`).set(student.auth).send({
      stages: [{ title: 'Kirish', durationMinutes: 10 }, { title: 'Asosiy', durationMinutes: 30 }],
      versionNote: 'Vaqt taqsimoti tuzatildi',
    });
    // Hujjatdagi bandlar: vazifalar, individual/guruhli topshiriqlar, metodlar, asosnoma ham majburiy
    const partial = await api().post(`/api/v1/lessons/${id}/submit`).set(student.auth);
    expect(partial.status).toBe(422);
    expect(partial.body.error.details.problems).toEqual([
      'Dars vazifalari kiritilmagan', 'Individual topshiriqlar kiritilmagan', 'Guruhli topshiriqlar kiritilmagan',
      'Kamida bitta interaktiv metod tanlang', 'Metodik qarorlaringiz asosnomasi kiritilmagan',
    ]);
    await api().patch(`/api/v1/lessons/${id}`).set(student.auth).send(COMPLETION);
    const submitted = await api().post(`/api/v1/lessons/${id}/submit`).set(student.auth);
    expect(submitted.status).toBe(200);
    expect(submitted.body.data.status).toBe('SUBMITTED');
    expect(submitted.body.data.versions).toHaveLength(4);

    const v1 = await api().get(`/api/v1/lessons/${id}/versions/1`).set(student.auth);
    expect(v1.body.data.snapshot.title).toBe('Jadidlar va ta’lim');

    const item = await prisma.portfolioItem.findFirst({ where: { refType: 'LessonPlan', refId: id } });
    expect(item?.sourceIds).toContain(source.id);

    const self = await api().post(`/api/v1/lessons/${id}/review`).set(student.auth).send({ decision: 'ACCEPT', comment: 'ok', score: 100 });
    expect(self.status).toBe(403);
    const review = await api().post(`/api/v1/lessons/${id}/review`).set(teacher.auth).send({
      decision: 'ACCEPT', comment: 'Metodik jihatdan asoslangan', score: 75, reflectiveScore: 60,
    });
    expect(review.body.data.status).toBe('REVIEWED');
    const records = await prisma.competenceRecord.findMany({ where: { refId: id } });
    expect(records.map((r) => r.evidenceKind).sort()).toEqual(['EXPERT', 'LESSON_PLAN']);
  });

  it('katalog mavzusi bog‘lanadi; ekspertiza o‘qituvchi rubrikasi mezonlari bo‘yicha hisoblanadi', async () => {
    const { student, teacher } = await ready();
    const topic = await prisma.historicalTopic.create({ data: { name: 'Jadidchilik', slug: `jadid-${Date.now()}` } });
    const source = await createSource();

    const bad = await api().post('/api/v1/lessons').set(student.auth)
      .send({ title: 'Noma’lum mavzu', topic: 'X', gradeLevel: '9', topicId: '00000000-0000-4000-8000-000000000000' });
    expect(bad.status).toBe(400);

    const created = await api().post('/api/v1/lessons').set(student.auth).send({
      title: 'Jadid maktablari', topic: topic.name, topicId: topic.id, gradeLevel: '9', durationMinutes: 45,
      goals: 'Maqsad', learningOutcomes: 'Natija', assessmentCriteria: 'Mezon', reflectionQuestions: 'Savol',
      problemQuestions: ['Savol?'], resources: [{ sourceId: source.id, purpose: '' }],
      stages: [{ title: 'Asosiy', durationMinutes: 40 }], ...COMPLETION,
    });
    expect(created.body.data.topicRef.id).toBe(topic.id);
    const id = created.body.data.id;
    const noPurpose = await api().post(`/api/v1/lessons/${id}/submit`).set(student.auth);
    expect(noPurpose.body.error.details.problems).toEqual(['Har bir manbaning darsdagi maqsadini yozing']);
    await api().patch(`/api/v1/lessons/${id}`).set(student.auth).send({ resources: [{ sourceId: source.id, purpose: 'Dalil manbasi' }] });
    expect((await api().post(`/api/v1/lessons/${id}/submit`).set(student.auth)).status).toBe(200);

    const rubric = await api().post('/api/v1/assignments/rubrics').set(teacher.auth).send({
      title: 'Dars ishlanmasi mezonlari',
      criteria: [{ title: 'Manbalardan foydalanish', maxScore: 10 }, { title: 'Metodik asoslanganlik', maxScore: 10 }],
    });
    expect(rubric.status).toBe(201);
    const [c1, c2] = rubric.body.data.criteria;

    const incomplete = await api().post(`/api/v1/lessons/${id}/review`).set(teacher.auth).send({
      decision: 'ACCEPT', comment: 'Baho', rubricId: rubric.body.data.id, criterionScores: [{ criterionId: c1.id, score: 8 }],
    });
    expect(incomplete.status).toBe(422);
    const over = await api().post(`/api/v1/lessons/${id}/review`).set(teacher.auth).send({
      decision: 'ACCEPT', comment: 'Baho', rubricId: rubric.body.data.id,
      criterionScores: [{ criterionId: c1.id, score: 11 }, { criterionId: c2.id, score: 5 }],
    });
    expect(over.status).toBe(422);

    const review = await api().post(`/api/v1/lessons/${id}/review`).set(teacher.auth).send({
      decision: 'ACCEPT', comment: 'Mezonlar bo‘yicha baholandi', rubricId: rubric.body.data.id,
      criterionScores: [{ criterionId: c1.id, score: 8, comment: 'Yaxshi' }, { criterionId: c2.id, score: 6 }],
    });
    expect(review.status).toBe(200);
    expect(review.body.data.score).toBe(70);
    expect(review.body.data.rubric.id).toBe(rubric.body.data.id);
    expect(review.body.data.criterionScores).toHaveLength(2);
    const evidence = await prisma.competenceRecord.findFirst({ where: { refId: id, evidenceKind: 'LESSON_PLAN' } });
    expect(evidence?.score).toBe(70);
  });
});

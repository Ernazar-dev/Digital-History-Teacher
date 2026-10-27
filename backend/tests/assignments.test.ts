import { beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { api, ensureAssessmentConfig, userWithToken } from './helpers';

describe('Topshiriqlar: topshirish, qaytarish, qayta ishlash, rubrika bo‘yicha baholash', () => {
  let components: Record<string, string>;
  beforeAll(async () => {
    components = await ensureAssessmentConfig();
  });

  it('to‘liq oqim va kompetensiya dalillari', async () => {
    const teacher = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');
    const outsider = await userWithToken('STUDENT');
    const group = await api().post('/api/v1/groups').set(teacher.auth).send({ name: 'Topshiriq guruhi' });
    await api().post(`/api/v1/groups/${group.body.data.id}/members`).set(teacher.auth).send({ studentIds: [student.user.id] });

    const rubric = await api().post('/api/v1/assignments/rubrics').set(teacher.auth).send({
      title: 'Test rubrikasi',
      criteria: [
        { title: 'Manbalar tahlili', maxScore: 50, componentId: components.COGNITIVE },
        { title: 'Metodik loyiha', maxScore: 50, componentId: components.ACTIVITY },
      ],
    });
    expect(rubric.status).toBe(201);

    const assignment = await api().post('/api/v1/assignments').set(teacher.auth).send({
      title: 'Guruhli mashg‘ulot loyihasi', scenario: 'Siz 8-sinf o‘qituvchisiz. 15 daqiqalik mashg‘ulot tuzing.',
      type: 'INTERACTIVE_TASK_DESIGN', status: 'PUBLISHED', rubricId: rubric.body.data.id, groupIds: [group.body.data.id],
    });
    expect(assignment.status).toBe(201);
    const aid = assignment.body.data.id;

    // Guruhga kirmagan talaba topshiriqni ko'rmaydi
    expect((await api().get(`/api/v1/assignments/${aid}`).set(outsider.auth)).status).toBe(404);
    const list = await api().get('/api/v1/assignments').set(student.auth);
    expect(list.body.data.find((a: { id: string }) => a.id === aid).myStatus).toBe('NOT_STARTED');

    await api().put(`/api/v1/assignments/${aid}/submission`).set(student.auth).send({ content: 'Birinchi versiya' });
    const sub1 = await api().post(`/api/v1/assignments/${aid}/submission/submit`).set(student.auth);
    expect(sub1.status).toBe(200);
    expect(sub1.body.data.status).toBe('SUBMITTED');
    const sid = sub1.body.data.id;

    // Topshirilgan javob tahrirlanmaydi
    expect((await api().put(`/api/v1/assignments/${aid}/submission`).set(student.auth).send({ content: 'x' })).status).toBe(400);

    const ret = await api().post(`/api/v1/submissions/${sid}/feedback`).set(teacher.auth).send({ decision: 'RETURN_FOR_REVISION', comment: 'Baholash mezonlarini qo‘shing' });
    expect(ret.body.data.status).toBe('RETURNED');

    await api().put(`/api/v1/assignments/${aid}/submission`).set(student.auth).send({ content: 'Ikkinchi versiya (mezonlar bilan)' });
    const sub2 = await api().post(`/api/v1/assignments/${aid}/submission/submit`).set(student.auth);
    expect(sub2.body.data.version).toBe(2);
    expect(sub2.body.data.revisions).toHaveLength(2);

    const criteria = rubric.body.data.criteria as { id: string }[];
    const missing = await api().post(`/api/v1/submissions/${sid}/feedback`).set(teacher.auth).send({
      decision: 'GRADE', comment: 'Baho', criterionScores: [{ criterionId: criteria[0].id, score: 40 }],
    });
    expect(missing.status).toBe(422);
    const over = await api().post(`/api/v1/submissions/${sid}/feedback`).set(teacher.auth).send({
      decision: 'GRADE', comment: 'Baho', criterionScores: [{ criterionId: criteria[0].id, score: 60 }, { criterionId: criteria[1].id, score: 10 }],
    });
    expect(over.status).toBe(422);

    const graded = await api().post(`/api/v1/submissions/${sid}/feedback`).set(teacher.auth).send({
      decision: 'GRADE', comment: 'Yaxshi ish', criterionScores: [{ criterionId: criteria[0].id, score: 40 }, { criterionId: criteria[1].id, score: 30 }],
    });
    expect(graded.status).toBe(200);
    expect(graded.body.data.status).toBe('GRADED');
    expect(graded.body.data.score).toBe(70);

    const records = await prisma.competenceRecord.findMany({ where: { studentId: student.user.id, refId: sid } });
    const byComp = Object.fromEntries(records.map((r) => [r.componentId, r.score]));
    expect(byComp[components.COGNITIVE]).toBe(80);
    expect(byComp[components.ACTIVITY]).toBe(60);

    const item = await prisma.portfolioItem.findFirst({ where: { refType: 'AssignmentSubmission', refId: sid } });
    expect(item?.version).toBe(2);
  });
});

describe('Raqamli simulyator: xronologiya va xarita (6-modul)', () => {
  beforeAll(async () => {
    await ensureAssessmentConfig();
  });

  const CHRONO = {
    kind: 'CHRONOLOGY',
    events: [
      { id: 'e1', text: 'Amir Temur Movarounnahrda hokimiyatga keldi', year: 1370 },
      { id: 'e2', text: 'Anqara jangi', year: 1402 },
      { id: 'e3', text: 'Klavixo elchiligi Samarqandga keldi', year: 1404 },
      { id: 'e4', text: 'Ulug‘bek madrasasi qurib bitkazildi', year: 1420 },
    ],
  };

  it('xronologiya: talabaga yillar ko‘rinmaydi, topshirishda avtomatik tekshiriladi', async () => {
    const teacher = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');

    const wrongType = await api().post('/api/v1/assignments').set(teacher.auth)
      .send({ title: 'Noto‘g‘ri tur', scenario: 'Voqealarni tartiblang va asoslang.', type: 'SOURCE_COMPARISON', simulator: CHRONO });
    expect(wrongType.status).toBe(400);

    const created = await api().post('/api/v1/assignments').set(teacher.auth).send({
      title: 'Temuriylar davri xronologiyasi', scenario: 'Voqealarni xronologik tartibga soling.', type: 'CHRONOLOGY',
      status: 'PUBLISHED', simulator: CHRONO,
    });
    expect(created.status).toBe(201);
    const id = created.body.data.id;

    const view = await api().get(`/api/v1/assignments/${id}`).set(student.auth);
    expect(view.body.data.simulator.events).toHaveLength(4);
    expect(view.body.data.simulator.events.every((e: Record<string, unknown>) => e.year === undefined)).toBe(true);
    // Talabaga voqealar to'g'ri xronologik tartibda berilmaydi
    expect(view.body.data.simulator.events.map((e: { id: string }) => e.id)).not.toEqual(['e1', 'e2', 'e3', 'e4']);

    await api().put(`/api/v1/assignments/${id}/submission`).set(student.auth).send({ content: '', simulatorAnswer: { order: ['e1', 'e2'] } });
    const incomplete = await api().post(`/api/v1/assignments/${id}/submission/submit`).set(student.auth);
    expect(incomplete.status).toBe(422);

    // e3 va e4 o'rni almashgan → 2/4 to'g'ri
    const saved = await api().put(`/api/v1/assignments/${id}/submission`).set(student.auth)
      .send({ content: 'Asoslash', simulatorAnswer: { order: ['e1', 'e2', 'e4', 'e3'] } });
    expect(saved.body.data.assignment.simulator.events[0].year).toBeUndefined();
    const submitted = await api().post(`/api/v1/assignments/${id}/submission/submit`).set(student.auth);
    expect(submitted.status).toBe(200);
    // Talaba o'qituvchi ko'rib chiqmaguncha natijani ko'rmaydi
    expect(submitted.body.data.autoScore).toBeNull();

    const row = await prisma.assignmentSubmission.findFirst({ where: { assignmentId: id, studentId: student.user.id } });
    expect(row?.autoScore).toBe(50);
    const review = await api().get(`/api/v1/submissions/${row!.id}`).set(teacher.auth);
    expect(review.body.data.autoDetails.correct).toBe(2);
    expect(review.body.data.assignment.simulator.events[0].year).toBe(1370);
  });

  it('xarita: masofa chegarasi ichidagi nuqtalar to‘g‘ri hisoblanadi', async () => {
    const teacher = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');
    const created = await api().post('/api/v1/assignments').set(teacher.auth).send({
      title: 'Ipak yo‘li shaharlari', scenario: 'Shaharlarni xaritada belgilang.', type: 'MAP_IDENTIFICATION', status: 'PUBLISHED',
      simulator: {
        kind: 'MAP', toleranceKm: 40,
        places: [
          { id: 'sam', label: 'Samarqand', lat: 39.6542, lng: 66.9597 },
          { id: 'xiv', label: 'Xiva', lat: 41.3783, lng: 60.3639 },
        ],
      },
    });
    const id = created.body.data.id;
    const view = await api().get(`/api/v1/assignments/${id}`).set(student.auth);
    expect(view.body.data.simulator.places[0].lat).toBeUndefined();

    await api().put(`/api/v1/assignments/${id}/submission`).set(student.auth).send({
      content: '', simulatorAnswer: { placements: { sam: { lat: 39.7, lng: 67.0 }, xiv: { lat: 39.77, lng: 64.43 } } },
    });
    expect((await api().post(`/api/v1/assignments/${id}/submission/submit`).set(student.auth)).status).toBe(200);
    const row = await prisma.assignmentSubmission.findFirst({ where: { assignmentId: id, studentId: student.user.id } });
    expect(row?.autoScore).toBe(50);
    const details = (row?.autoDetails as { details: { id: string; correct: boolean; distanceKm: number }[] }).details;
    expect(details.find((d) => d.id === 'sam')?.correct).toBe(true);
    expect(details.find((d) => d.id === 'xiv')?.distanceKm).toBeGreaterThan(300);
  });
});

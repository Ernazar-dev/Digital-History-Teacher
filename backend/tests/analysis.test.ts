import { beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { api, createSource, ensureAssessmentConfig, userWithToken } from './helpers';

const FULL_ANSWERS = {
  sourceType: 'Yozma manba', created: 'XV asr', author: 'Saroy tarixchisi', origin: 'Saroy buyurtmasi',
  purpose: 'Hukmdorni ulug‘lash', information: 'Yurishlar', evidence: 'Matndagi tafsilotlar',
  reliabilityLevel: 'MEDIUM', reliability: 'Boshqa manbalar bilan solishtirildi', limitations: 'Bir tomonlama',
  conclusion: 'Manba saroy nuqtayi nazarini aks ettiradi', teachingUse: 'Taqqoslash darsi',
  studentTasks: 'Fakt va bahoni ajrating',
};

const FULL_COMPARISON = {
  similarities: 'Ikkalasi ham yurishlarni tasvirlaydi', differences: 'Baholash ohangi farq qiladi',
  evidence: 'Birinchi manbada «...», ikkinchisida «...»', conclusion: 'Muallif pozitsiyasi talqinga ta’sir qiladi',
  teachingUse: 'Guruhlarda taqqoslash jadvali, o‘quvchilar fakt va bahoni ajratadi',
};

describe('Tahlil laboratoriyasi → portfolio → kompetensiya', () => {
  let components: Record<string, string>;
  beforeAll(async () => {
    components = await ensureAssessmentConfig();
  });

  it('turga mos shablon qaytaradi', async () => {
    const s = await userWithToken('STUDENT');
    const res = await api().get('/api/v1/source-analyses/template/MAP').set(s.auth);
    expect(res.status).toBe(200);
    const keys = res.body.data.map((q: { key: string }) => q.key);
    expect(keys).toContain('legend');
    expect(keys).toContain('studentTasks');
  });

  it('to‘liq oqim: saqlash, topshirish, ko‘rib chiqish, portfolio, dalil', async () => {
    const source = await createSource();
    const student = await userWithToken('STUDENT');
    const teacher = await userWithToken('TEACHER');
    const group = await api().post('/api/v1/groups').set(teacher.auth).send({ name: 'Tahlil guruhi' });
    await api().post(`/api/v1/groups/${group.body.data.id}/members`).set(teacher.auth).send({ studentIds: [student.user.id] });

    const created = await api().post('/api/v1/source-analyses').set(student.auth).send({ sourceId: source.id, answers: { sourceType: 'Yozma' } });
    expect(created.status).toBe(201);
    const id = created.body.data.id;

    const incomplete = await api().post(`/api/v1/source-analyses/${id}/submit`).set(student.auth);
    expect(incomplete.status).toBe(422);
    expect(incomplete.body.error.details.missing.length).toBeGreaterThan(0);

    expect((await api().patch(`/api/v1/source-analyses/${id}`).set(student.auth).send({ answers: FULL_ANSWERS })).status).toBe(200);
    const submitted = await api().post(`/api/v1/source-analyses/${id}/submit`).set(student.auth);
    expect(submitted.body.data.status).toBe('SUBMITTED');

    // Topshirilgandan keyin tahrirlab bo'lmaydi
    expect((await api().patch(`/api/v1/source-analyses/${id}`).set(student.auth).send({ answers: FULL_ANSWERS })).status).toBe(400);

    const item = await prisma.portfolioItem.findFirst({ where: { refType: 'SourceAnalysis', refId: id } });
    expect(item?.sourceIds).toContain(source.id);

    // Boshqa talaba ko'ra olmaydi
    const other = await userWithToken('STUDENT');
    expect((await api().get(`/api/v1/source-analyses/${id}`).set(other.auth)).status).toBe(403);

    const review = await api().post(`/api/v1/source-analyses/${id}/review`).set(teacher.auth).send({ decision: 'ACCEPT', comment: 'Yaxshi tahlil', score: 82 });
    expect(review.status).toBe(200);
    expect(review.body.data.status).toBe('REVIEWED');

    const records = await prisma.competenceRecord.findMany({ where: { studentId: student.user.id } });
    expect(records).toHaveLength(1);
    expect(records[0].componentId).toBe(components.COGNITIVE);
    expect(records[0].evidenceKind).toBe('SOURCE_ANALYSIS');

    const profile = await api().get('/api/v1/assessments/me/profile').set(student.auth);
    const cognitive = profile.body.data.components.find((c: { code: string }) => c.code === 'COGNITIVE');
    expect(cognitive.score).toBe(82);
    expect(cognitive.level.code).toBe('HIGH');
    expect(profile.body.data.warnings.length).toBeGreaterThan(0);
  });

  it('ishonchlilik darajasi faqat ruxsat etilgan qiymat; ochiq qoralama takrorlanmaydi', async () => {
    const source = await createSource();
    const student = await userWithToken('STUDENT');
    const first = await api().post('/api/v1/source-analyses').set(student.auth).send({ sourceId: source.id });
    const again = await api().post('/api/v1/source-analyses').set(student.auth).send({ sourceId: source.id });
    expect(again.body.data.id).toBe(first.body.data.id);

    const id = first.body.data.id;
    await api().patch(`/api/v1/source-analyses/${id}`).set(student.auth).send({ answers: { ...FULL_ANSWERS, reliabilityLevel: 'juda yaxshi' } });
    const bad = await api().post(`/api/v1/source-analyses/${id}/submit`).set(student.auth);
    expect(bad.status).toBe(422);
    expect(bad.body.error.details.missing).toEqual(['Manbaning ishonchlilik darajasini baholang']);

    await api().patch(`/api/v1/source-analyses/${id}`).set(student.auth).send({ answers: FULL_ANSWERS });
    expect((await api().post(`/api/v1/source-analyses/${id}/submit`).set(student.auth)).status).toBe(200);
    // Topshirilgandan keyin shu manba bo'yicha yangi tahlil ochiladi
    const next = await api().post('/api/v1/source-analyses').set(student.auth).send({ sourceId: source.id });
    expect(next.body.data.id).not.toBe(id);
  });

  it('taqqoslash: barcha hujjat maydonlari majburiy, baholovchi qayd etiladi, qoralama o‘chiriladi', async () => {
    const [a, b] = [await createSource(), await createSource()];
    const student = await userWithToken('STUDENT');
    const teacher = await userWithToken('TEACHER');
    const group = await api().post('/api/v1/groups').set(teacher.auth).send({ name: 'Taqqoslash guruhi' });
    await api().post(`/api/v1/groups/${group.body.data.id}/members`).set(teacher.auth).send({ studentIds: [student.user.id] });

    const dup = await api().post('/api/v1/source-comparisons').set(student.auth).send({ title: 'Takror', sourceIds: [a.id, a.id] });
    expect(dup.status).toBe(400);

    const c = await api().post('/api/v1/source-comparisons').set(student.auth)
      .send({ title: 'Amir Temur haqida ikki manba', sourceIds: [a.id, b.id], similarities: 'x', differences: 'y', conclusion: 'z' });
    expect(c.status).toBe(201);
    const id = c.body.data.id;

    const incomplete = await api().post(`/api/v1/source-comparisons/${id}/submit`).set(student.auth);
    expect(incomplete.status).toBe(422);
    expect(incomplete.body.error.details.missing).toHaveLength(2);

    await api().patch(`/api/v1/source-comparisons/${id}`).set(student.auth).send(FULL_COMPARISON);
    expect((await api().post(`/api/v1/source-comparisons/${id}/submit`).set(student.auth)).status).toBe(200);
    // Topshirilgan ishni o'chirib bo'lmaydi
    expect((await api().delete(`/api/v1/source-comparisons/${id}`).set(student.auth)).status).toBe(400);

    const review = await api().post(`/api/v1/source-comparisons/${id}/review`).set(teacher.auth).send({ decision: 'ACCEPT', comment: 'Asosli', score: 75 });
    expect(review.body.data.reviewedBy.id).toBe(teacher.user.id);
    expect(review.body.data.reviewedAt).toBeTruthy();

    const draft = await api().post('/api/v1/source-comparisons').set(student.auth).send({ title: 'Qoralama ish', sourceIds: [a.id, b.id] });
    expect((await api().delete(`/api/v1/source-comparisons/${draft.body.data.id}`).set(student.auth)).status).toBe(204);
  });
});

import { beforeAll, describe, expect, it } from 'vitest';
import { api, createSource, ensureAssessmentConfig, userWithToken } from './helpers';

const ANSWERS = {
  sourceType: 'Yozma', created: 'XV asr', author: 'Tarixchi', origin: 'Saroy', purpose: 'Ulug‘lash', information: 'Yurishlar',
  evidence: 'Iqtibos', reliabilityLevel: 'MEDIUM', reliability: 'Solishtirildi', limitations: 'Bir tomonlama',
  conclusion: 'Xulosa', teachingUse: 'Taqqoslash darsi', studentTasks: 'Fakt va bahoni ajrating',
};

describe('Shaxsiy kabinet va elektron portfolio (7-modul)', () => {
  let components: Record<string, string>;
  beforeAll(async () => {
    components = await ensureAssessmentConfig();
  });

  it('ish natijasi, o‘qituvchi izohlari, diagnostika va kompetensiya dinamikasi bir joyda', async () => {
    const student = await userWithToken('STUDENT');
    const teacher = await userWithToken('TEACHER');
    const group = await api().post('/api/v1/groups').set(teacher.auth).send({ name: 'Portfolio guruhi' });
    await api().post(`/api/v1/groups/${group.body.data.id}/members`).set(teacher.auth).send({ studentIds: [student.user.id] });

    // Manba tahlili → o'qituvchi izohi va bahosi
    const source = await createSource();
    const analysis = await api().post('/api/v1/source-analyses').set(student.auth).send({ sourceId: source.id, answers: ANSWERS });
    await api().post(`/api/v1/source-analyses/${analysis.body.data.id}/submit`).set(student.auth);
    await api().post(`/api/v1/source-analyses/${analysis.body.data.id}/review`).set(teacher.auth)
      .send({ decision: 'ACCEPT', comment: 'Dalillar yaxshi tanlangan', score: 82 });

    // Boshlang'ich diagnostika (avtomatik baholanadi)
    const opts = [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }];
    const diag = await api().post('/api/v1/diagnostics').set(teacher.auth).send({
      title: 'Portfolio testi', stage: 'INITIAL', kind: 'TEST',
      questions: [{ componentId: components.COGNITIVE, type: 'SINGLE_CHOICE', prompt: 'Savol', options: opts, correct: ['a'] }],
    });
    const attempt = await api().post(`/api/v1/diagnostics/${diag.body.data.id}/attempts`).set(student.auth);
    await api().put(`/api/v1/diagnostics/attempts/${attempt.body.data.id}/responses`).set(student.auth)
      .send({ answers: { [diag.body.data.questions[0].id]: 'a' } });
    await api().post(`/api/v1/diagnostics/attempts/${attempt.body.data.id}/submit`).set(student.auth);

    const p = await api().get('/api/v1/portfolios/me').set(student.auth);
    expect(p.status).toBe(200);
    const item = p.body.data.items.find((i: { refType: string }) => i.refType === 'SourceAnalysis');
    expect(item.outcome).toMatchObject({ status: 'REVIEWED', percent: 82, teacherComment: 'Dalillar yaxshi tanlangan' });
    expect(p.body.data.teacherComments[0]).toMatchObject({ comment: 'Dalillar yaxshi tanlangan', percent: 82 });
    expect(p.body.data.diagnostics).toEqual([expect.objectContaining({ stage: 'INITIAL', percent: 100, status: 'REVIEWED' })]);
    expect(p.body.data.dynamics.map((d: { stage: string }) => d.stage)).toEqual(['INITIAL', 'INTERMEDIATE', 'FINAL']);
    expect(p.body.data.dynamics[0].overall).not.toBeNull();

    // O'qituvchi talaba portfoliosini ko'radi, begona talaba esa yo'q
    expect((await api().get(`/api/v1/portfolios/students/${student.user.id}`).set(teacher.auth)).status).toBe(200);
    const other = await userWithToken('STUDENT');
    expect((await api().get(`/api/v1/portfolios/students/${student.user.id}`).set(other.auth)).status).toBe(403);
  });

  it('profil sahifasidagi portfolio: talaba fayl yuklaydi, fayl faqat egasi va ruxsatli foydalanuvchiga ochiladi', async () => {
    const student = await userWithToken('STUDENT');
    const other = await userWithToken('STUDENT');
    const pdf = Buffer.from('%PDF-1.4 sinov portfolio');

    const bad = await api().post('/api/v1/portfolios/me/files').set(student.auth).attach('file', Buffer.from('oddiy matn'), { filename: 'x.pdf', contentType: 'application/pdf' });
    expect(bad.status).toBe(400);

    const up = await api().post('/api/v1/portfolios/me/files').set(student.auth).field('title', 'Dars ishlanmam').attach('file', pdf, { filename: 'ishlanma.pdf', contentType: 'application/pdf' });
    expect(up.status).toBe(201);
    expect(up.body.data.title).toBe('Dars ishlanmam');
    const { id, file } = up.body.data;

    const list = await api().get('/api/v1/portfolios/me/files').set(student.auth);
    expect(list.body.data.map((f: { id: string }) => f.id)).toEqual([id]);

    // Ochiq media manzili portfolio faylini bermaydi
    expect((await api().get(`/api/v1/media/${file.id}`)).status).toBe(404);
    expect((await api().get(`/api/v1/portfolios/files/${id}/download`).set(other.auth)).status).toBe(403);
    const own = await api().get(`/api/v1/portfolios/files/${id}/download`).set(student.auth);
    expect(own.status).toBe(200);
    expect(own.headers['content-type']).toContain('application/pdf');

    expect((await api().delete(`/api/v1/portfolios/files/${id}`).set(other.auth)).status).toBe(404);
    expect((await api().delete(`/api/v1/portfolios/files/${id}`).set(student.auth)).status).toBe(204);
    expect((await api().get('/api/v1/portfolios/me/files').set(student.auth)).body.data).toEqual([]);
  });
});

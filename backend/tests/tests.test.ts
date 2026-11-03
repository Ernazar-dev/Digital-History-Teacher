import { describe, expect, it } from 'vitest';
import { api, createSource, userWithToken } from './helpers';

const PDF = Buffer.from('%PDF-1.4 sinov test fayli');

const uploadPdf = async (auth: Record<string, string>) => {
  const res = await api().post('/api/v1/media').set(auth).attach('file', PDF, { filename: 'test.pdf', contentType: 'application/pdf' });
  expect(res.status).toBe(201);
  return res.body.data.id as string;
};

describe('Topshiriqlar: fayl asosidagi test', () => {
  it('o‘qituvchi test yuklaydi, talaba bir marta topshiradi, natija va to‘g‘ri javoblar ko‘rinadi', async () => {
    const teacher = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');
    const topic = await createSource({ title: 'Amir Temur davlati' });
    const fileId = await uploadPdf(teacher.auth);

    // Talaba test yarata olmaydi
    expect((await api().post('/api/v1/tests').set(student.auth).send({ title: 'X', fileId, answerKey: ['A'] })).status).toBe(403);
    // Noto'g'ri javob varianti rad etiladi
    expect((await api().post('/api/v1/tests').set(teacher.auth).send({ title: 'X', fileId, answerKey: ['E'] })).status).toBe(400);

    const created = await api().post('/api/v1/tests').set(teacher.auth).send({
      title: 'Amir Temur davlati — test', sourceId: topic.id, fileId, answerKey: ['A', 'C', 'B', 'D'],
    });
    expect(created.status).toBe(201);
    expect(created.body.data.questionCount).toBe(4);
    const id = created.body.data.id;

    // Talabaga kalit ko'rsatilmaydi
    const view = await api().get(`/api/v1/tests/${id}`).set(student.auth);
    expect(view.body.data.answerKey).toBeNull();
    expect(view.body.data.file.id).toBe(fileId);
    expect(view.body.data.source.id).toBe(topic.id);

    // Mavzu sahifasida test havolasi chiqadi
    const topicPage = await api().get(`/api/v1/sources/${topic.slug}`).set(student.auth);
    expect(topicPage.body.data.tests.map((t: { id: string }) => t.id)).toContain(id);

    expect((await api().post(`/api/v1/tests/${id}/attempt`).set(student.auth).send({ answers: ['A', 'B'] })).status).toBe(400);
    const sent = await api().post(`/api/v1/tests/${id}/attempt`).set(student.auth).send({ answers: ['A', 'B', 'B', null] });
    expect(sent.status).toBe(201);
    expect(sent.body.data).toMatchObject({ correctCount: 2, total: 4, percent: 50, answerKey: ['A', 'C', 'B', 'D'] });

    // Ikkinchi marta topshirib bo'lmaydi
    expect((await api().post(`/api/v1/tests/${id}/attempt`).set(student.auth).send({ answers: ['A', 'C', 'B', 'D'] })).status).toBe(409);
    const after = await api().get(`/api/v1/tests/${id}`).set(student.auth);
    expect(after.body.data.myAttempt).toMatchObject({ percent: 50, answers: ['A', 'B', 'B', null] });

    const list = await api().get('/api/v1/tests').set(student.auth);
    expect(list.body.data.find((t: { id: string }) => t.id === id).myAttempt.percent).toBe(50);

    // Progress: mavzu bo'yicha natija
    const progress = await api().get('/api/v1/progress/me').set(student.auth);
    const row = progress.body.data.topics.find((t: { id: string }) => t.id === topic.id);
    expect(row.tests[0].attempt.percent).toBe(50);
  });

  it('kalit tuzatilsa natijalar qayta hisoblanadi; o‘qituvchi qayta topshirishga ruxsat beradi', async () => {
    const teacher = await userWithToken('TEACHER');
    const otherTeacher = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');
    const fileId = await uploadPdf(teacher.auth);
    const id = (await api().post('/api/v1/tests').set(teacher.auth).send({ title: 'Kalit testi', fileId, answerKey: ['A', 'A'] })).body.data.id;

    await api().post(`/api/v1/tests/${id}/attempt`).set(student.auth).send({ answers: ['A', 'B'] });
    expect((await api().patch(`/api/v1/tests/${id}`).set(otherTeacher.auth).send({ answerKey: ['A', 'B'] })).status).toBe(403);
    const fixed = await api().patch(`/api/v1/tests/${id}`).set(teacher.auth).send({ answerKey: ['A', 'B'] });
    expect(fixed.status).toBe(200);

    const results = await api().get(`/api/v1/tests/${id}/results`).set(teacher.auth);
    expect(results.body.data).toHaveLength(1);
    expect(results.body.data[0]).toMatchObject({ correctCount: 2, percent: 100, student: { id: student.user.id } });

    expect((await api().get(`/api/v1/tests/${id}/results`).set(student.auth)).status).toBe(403);
    const reset = await api().delete(`/api/v1/tests/${id}/attempts/${results.body.data[0].id}`).set(teacher.auth);
    expect(reset.status).toBe(204);
    expect((await api().post(`/api/v1/tests/${id}/attempt`).set(student.auth).send({ answers: ['B', 'B'] })).status).toBe(201);

    // Yashirilgan test talabaga ko'rinmaydi
    await api().patch(`/api/v1/tests/${id}`).set(teacher.auth).send({ isPublished: false });
    expect((await api().get(`/api/v1/tests/${id}`).set(student.auth)).status).toBe(404);
  });
});

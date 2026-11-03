import { describe, expect, it } from 'vitest';
import { api, userWithToken } from './helpers';

const UID = 'af54f5280eb249beb6501eab4769c351';

describe('Shaxsiy kabinet va elektron portfolio (7-modul)', () => {
  it('ish natijasi va o‘qituvchi izohlari bir joyda', async () => {
    const student = await userWithToken('STUDENT');
    const teacher = await userWithToken('TEACHER');
    const admin = await userWithToken('ADMIN');
    const group = await api().post('/api/v1/groups').set(teacher.auth).send({ name: 'Portfolio guruhi' });
    await api().post(`/api/v1/groups/${group.body.data.id}/members`).set(teacher.auth).send({ studentIds: [student.user.id] });

    // Virtual obyekt asosidagi ish → o'qituvchi izohi va bahosi
    const obj = (await api().post('/api/v1/virtual-objects').set(admin.auth).send({
      title: 'Portfolio 3D obyekti', type: 'MODEL_3D', provider: 'SKETCHFAB', description: 'Sinov uchun tavsif matni',
      status: 'PUBLISHED', externalUrl: `https://sketchfab.com/models/${UID}`, tasks: [{ kind: 'OBSERVATION', prompt: 'Nimani kuzatdingiz?' }],
    })).body.data;
    await api().put(`/api/v1/virtual-objects/${obj.id}/response`).set(student.auth)
      .send({ answers: { [obj.tasks[0].id]: 'Peshtoq bezaklari' }, activityDesign: '15 daqiqalik mashg‘ulot' });
    const submitted = await api().post(`/api/v1/virtual-objects/${obj.id}/response/submit`).set(student.auth);
    await api().post(`/api/v1/virtual-objects/responses/${submitted.body.data.id}/review`).set(teacher.auth)
      .send({ decision: 'ACCEPT', comment: 'Kuzatuv yaxshi', score: 82 });

    const p = await api().get('/api/v1/portfolios/me').set(student.auth);
    expect(p.status).toBe(200);
    const item = p.body.data.items.find((i: { refType: string }) => i.refType === 'VirtualObjectResponse');
    expect(item.outcome).toMatchObject({ status: 'REVIEWED', percent: 82, teacherComment: 'Kuzatuv yaxshi' });
    expect(p.body.data.teacherComments[0]).toMatchObject({ comment: 'Kuzatuv yaxshi', percent: 82 });

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

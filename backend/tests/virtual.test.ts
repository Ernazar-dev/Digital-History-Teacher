import { beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { api, ensureAssessmentConfig, userWithToken } from './helpers';

const UID = 'af54f5280eb249beb6501eab4769c351';
const base = {
  title: 'Sinov 3D obyekti', type: 'MODEL_3D', provider: 'SKETCHFAB', description: 'Sinov uchun tavsif matni',
  status: 'PUBLISHED', tasks: [{ kind: 'OBSERVATION', prompt: 'Nimani kuzatdingiz?' }],
};

describe('Virtual muzey (3D/360°)', () => {
  beforeAll(async () => {
    await ensureAssessmentConfig();
  });

  it('Sketchfab embed URL model sahifasidan hosil qilinadi, begona domen rad etiladi', async () => {
    const admin = await userWithToken('ADMIN');
    const ok = await api().post('/api/v1/virtual-objects').set(admin.auth).send({ ...base, externalUrl: `https://sketchfab.com/3d-models/registan-${UID}` });
    expect(ok.status).toBe(201);
    expect(ok.body.data.embedUrl).toBe(`https://sketchfab.com/models/${UID}/embed`);

    const evil = await api().post('/api/v1/virtual-objects').set(admin.auth).send({ ...base, title: 'Yomon', externalUrl: 'https://example.org/x', embedUrl: 'https://evil.example/frame' });
    expect(evil.status).toBe(400);

    const wrongProvider = await api().post('/api/v1/virtual-objects').set(admin.auth).send({
      ...base, title: '360 xato', type: 'TOUR_360', provider: 'UZBEKISTAN360', externalUrl: 'https://uzbekistan360.uz/ru', embedUrl: `https://sketchfab.com/models/${UID}/embed`,
    });
    expect(wrongProvider.status).toBe(400);

    const teacher = await userWithToken('TEACHER');
    expect((await api().post('/api/v1/virtual-objects').set(teacher.auth).send({ ...base, externalUrl: `https://sketchfab.com/models/${UID}` })).status).toBe(403);
  });

  it('yashirilgan obyekt talabaga ko‘rinmaydi; talaba ishi topshiriladi va portfolioga tushadi', async () => {
    const admin = await userWithToken('ADMIN');
    const student = await userWithToken('STUDENT');
    const created = await api().post('/api/v1/virtual-objects').set(admin.auth).send({ ...base, title: 'Portfolio obyekti', externalUrl: `https://sketchfab.com/models/${UID}` });
    const obj = created.body.data;

    await api().patch(`/api/v1/virtual-objects/${obj.id}/active`).set(admin.auth).send({ isActive: false });
    expect((await api().get(`/api/v1/virtual-objects/${obj.id}`).set(student.auth)).status).toBe(404);
    await api().patch(`/api/v1/virtual-objects/${obj.id}/active`).set(admin.auth).send({ isActive: true });

    const empty = await api().post(`/api/v1/virtual-objects/${obj.id}/response/submit`).set(student.auth);
    expect(empty.status).toBe(400);
    const taskId = obj.tasks[0].id;
    // Mashg'ulot loyihasisiz topshirib bo'lmaydi
    await api().put(`/api/v1/virtual-objects/${obj.id}/response`).set(student.auth).send({ answers: { [taskId]: 'Peshtoq bezaklari' } });
    const noDesign = await api().post(`/api/v1/virtual-objects/${obj.id}/response/submit`).set(student.auth);
    expect(noDesign.status).toBe(422);
    expect(noDesign.body.error.details.missing).toEqual(['Obyekt asosidagi mashg‘ulot loyihasi yozilmagan']);
    const saved = await api().put(`/api/v1/virtual-objects/${obj.id}/response`).set(student.auth).send({ answers: { [taskId]: 'Peshtoq bezaklari' }, activityDesign: '15 daqiqalik mashg‘ulot' });
    expect(saved.status).toBe(200);
    const submitted = await api().post(`/api/v1/virtual-objects/${obj.id}/response/submit`).set(student.auth);
    expect(submitted.body.data.status).toBe('SUBMITTED');
    const item = await prisma.portfolioItem.findFirst({ where: { refType: 'VirtualObjectResponse', refId: submitted.body.data.id } });
    expect(item?.type).toBe('VIRTUAL_WORK');

    const review = await api().post(`/api/v1/virtual-objects/responses/${submitted.body.data.id}/review`).set(admin.auth).send({ decision: 'ACCEPT', comment: 'Yaxshi', score: 70 });
    expect(review.status).toBe(200);
    expect(review.body.data.score).toBe(70);
    expect(review.body.data.reviewedBy.id).toBe(admin.user.id);
    const rec = await prisma.competenceRecord.findFirst({ where: { refId: submitted.body.data.id } });
    expect(rec?.evidenceKind).toBe('PRACTICAL_TASK');
  });
});

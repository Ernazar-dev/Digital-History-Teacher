import { describe, expect, it } from 'vitest';
import { isAllowedEmbedUrl, sketchfabEmbedFromUrl } from '../src/shared/utils/embed';
import { api, createSource, userWithToken } from './helpers';

describe('Embed URL xavfsizligi', () => {
  it('faqat ruxsat etilgan https hostlar', () => {
    const hosts = ['sketchfab.com', 'uzbekistan360.uz'];
    expect(isAllowedEmbedUrl('https://sketchfab.com/models/abc/embed', hosts)).toBe(true);
    expect(isAllowedEmbedUrl('https://www.sketchfab.com/models/abc/embed', hosts)).toBe(true);
    expect(isAllowedEmbedUrl('http://sketchfab.com/models/abc/embed', hosts)).toBe(false);
    expect(isAllowedEmbedUrl('https://evil.com/?q=sketchfab.com', hosts)).toBe(false);
    expect(isAllowedEmbedUrl('https://sketchfab.com.evil.com/x', hosts)).toBe(false);
    expect(isAllowedEmbedUrl('javascript:alert(1)', hosts)).toBe(false);
  });

  it('Sketchfab sahifa URL idan embed URL hosil qiladi, ID taxmin qilinmaydi', () => {
    const uid = 'af54f5280eb249beb6501eab4769c351';
    expect(sketchfabEmbedFromUrl(`https://sketchfab.com/models/${uid}`)).toBe(`https://sketchfab.com/models/${uid}/embed`);
    expect(sketchfabEmbedFromUrl(`https://sketchfab.com/3d-models/registan-${uid}`)).toBe(`https://sketchfab.com/models/${uid}/embed`);
    expect(sketchfabEmbedFromUrl('https://sketchfab.com/GlobalDigitalHeritage')).toBeNull();
  });
});

describe('Manbalar kutubxonasi', () => {
  it('admin CRUD, variantlar va ruxsat etilmagan embed domeni', async () => {
    const admin = await userWithToken('ADMIN');
    const bad = await api().post('/api/v1/sources').set(admin.auth).send({
      title: 'Embed test', summary: 'Embed tekshiruvi uchun manba', type: 'VISUAL', embedUrl: 'https://evil.example/frame',
    });
    expect(bad.status).toBe(400);

    const created = await api().post('/api/v1/sources').set(admin.auth).send({
      title: 'Sinov solnomasi', summary: 'Sinov uchun solnoma tavsifi', type: 'WRITTEN', status: 'PUBLISHED',
      yearFrom: 1400, yearTo: 1450,
      variants: [
        { kind: 'ORIGINAL', title: 'Asl matn', content: 'Asl matn parchasi' },
        { kind: 'EDUCATIONAL_ADAPTATION', title: 'Moslashtirilgan', content: 'Soddalashtirilgan matn' },
      ],
    });
    expect(created.status).toBe(201);
    expect(created.body.data.variants).toHaveLength(2);
    const id = created.body.data.id;

    const list = await api().get('/api/v1/sources').query({ q: 'Sinov solnomasi', type: 'WRITTEN' });
    expect(list.body.data.some((s: { id: string }) => s.id === id)).toBe(true);
    expect(list.body.meta.total).toBeGreaterThanOrEqual(1);

    const upd = await api().patch(`/api/v1/sources/${id}`).set(admin.auth).send({ limitations: 'Yangi cheklov' });
    expect(upd.body.data.limitations).toBe('Yangi cheklov');

    const badYears = await api().post('/api/v1/sources').set(admin.auth).send({
      title: 'Yil xatosi', summary: 'Yillar tartibi notogri', type: 'WRITTEN', yearFrom: 1500, yearTo: 1400,
    });
    expect(badYears.status).toBe(400);

    expect((await api().delete(`/api/v1/sources/${id}`).set(admin.auth)).status).toBe(204);
    expect((await api().get(`/api/v1/sources/${id}`)).status).toBe(404);
  });

  it('o‘qituvchi o‘quv materialini (DOCX/PDF) yuklab manbaga biriktiradi', async () => {
    const teacher = await userWithToken('TEACHER');
    const docx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(64)]);
    const up = await api().post('/api/v1/media').set(teacher.auth)
      .attach('file', docx, { filename: 'dars.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    expect(up.status).toBe(201);
    const pdf = await api().post('/api/v1/media').set(teacher.auth)
      .attach('file', Buffer.from('%PDF-1.4 test'), { filename: 'manba.pdf', contentType: 'application/pdf' });
    expect(pdf.status).toBe(201);

    const created = await api().post('/api/v1/sources').set(teacher.auth).send({
      title: 'Material sinovi', summary: 'Yuklangan material bilan manba', type: 'WRITTEN', fileIds: [up.body.data.id, pdf.body.data.id],
    });
    expect(created.status).toBe(201);
    expect(created.body.data.files.map((f: { originalName: string }) => f.originalName)).toEqual(['dars.docx', 'manba.pdf']);

    const url = `/api/v1/sources/${created.body.data.id}`;
    const upd = await api().patch(url).set(teacher.auth).send({ fileIds: [pdf.body.data.id] });
    expect(upd.body.data.files).toHaveLength(1);

    const missing = await api().patch(url).set(teacher.auth)
      .send({ fileIds: ['00000000-0000-4000-8000-000000000000'] });
    expect(missing.status).toBe(400);
  });

  it('taqqoslash ishi (2-modul) uchun manbalar', async () => {
    const student = await userWithToken('STUDENT');
    const a = await createSource();
    const b = await createSource();
    const cmp = await api().post('/api/v1/source-comparisons').set(student.auth).send({ title: 'Ikki manba', sourceIds: [a.id, b.id] });
    expect(cmp.status).toBe(201);
    expect(cmp.body.data.items.map((i: { sourceId: string }) => i.sourceId)).toEqual([a.id, b.id]);
  });

  it('amaliy topshiriqlar saqlanadi, 3D/360 manba turi emas', async () => {
    const admin = await userWithToken('ADMIN');
    const tasks = 'Hududni aniqlang\nLegendani izohlang';
    const res = await api().post('/api/v1/sources').set(admin.auth).send({
      title: 'Topshiriqli manba', summary: 'Amaliy topshiriqlar tekshiruvi', type: 'MAP', status: 'PUBLISHED', practicalTasks: tasks,
    });
    expect(res.status).toBe(201);
    expect((await api().get(`/api/v1/sources/${res.body.data.slug}`)).body.data.practicalTasks).toBe(tasks);
    const bad = await api().post('/api/v1/sources').set(admin.auth).send({ title: '3D manba', summary: '3D turi rad etilishi kerak', type: 'MODEL_3D' });
    expect(bad.status).toBe(400);
  });
});

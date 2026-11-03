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

describe('Manbalar kutubxonasi: ma’ruza mavzulari', () => {
  it('mavzu: ma’ruza matni, taqdimot va video (fayl yoki YouTube)', async () => {
    const admin = await userWithToken('ADMIN');
    const pptx = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.alloc(64)]);
    const pres = await api().post('/api/v1/media').set(admin.auth)
      .attach('file', pptx, { filename: 'taqdimot.pptx', contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    expect(pres.status).toBe(201);

    const notYoutube = await api().post('/api/v1/sources').set(admin.auth).send({
      title: 'Video xatosi', summary: 'Faqat YouTube havolasi qabul qilinadi', videoUrl: 'https://evil.example/video',
    });
    expect(notYoutube.status).toBe(400);

    const created = await api().post('/api/v1/sources').set(admin.auth).send({
      title: 'Sinov mavzusi', summary: 'Ma’ruza, taqdimot va videoli mavzu', bookLabel: 'I kitob · 12-mavzu', sortOrder: 5,
      lectureContent: '# Reja – 1. Kirish', presentationFileId: pres.body.data.id, videoUrl: 'https://www.youtube.com/watch?v=abc123',
      yearFrom: 1400, yearTo: 1450,
    });
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ type: 'WRITTEN', status: 'PUBLISHED', lectureContent: '# Reja – 1. Kirish' });
    expect(created.body.data.presentationFile.originalName).toBe('taqdimot.pptx');
    const id = created.body.data.id;

    // Ro'yxatda ma'ruza matni yuborilmaydi, faqat belgisi
    const list = await api().get('/api/v1/sources').query({ q: 'Sinov mavzusi' });
    const row = list.body.data.find((s: { id: string }) => s.id === id);
    expect(row).toMatchObject({ hasLecture: true, bookLabel: 'I kitob · 12-mavzu' });
    expect(row.lectureContent).toBeUndefined();

    const missing = await api().patch(`/api/v1/sources/${id}`).set(admin.auth).send({ videoFileId: '00000000-0000-4000-8000-000000000000' });
    expect(missing.status).toBe(400);
    const upd = await api().patch(`/api/v1/sources/${id}`).set(admin.auth).send({ videoUrl: null, lectureContent: 'Yangi matn' });
    expect(upd.body.data).toMatchObject({ videoUrl: null, lectureContent: 'Yangi matn' });

    // Administrator o'z ma'ruza faylini yuklasa — tayyor matn o'rniga shu fayl ko'rsatiladi
    const docx = await api().post('/api/v1/media').set(admin.auth)
      .attach('file', pptx, { filename: 'maruza.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    expect(docx.status).toBe(201);
    const replaced = await api().patch(`/api/v1/sources/${id}`).set(admin.auth).send({ lectureFileId: docx.body.data.id });
    expect(replaced.body.data).toMatchObject({ lectureContent: null, lectureFile: { originalName: 'maruza.docx' } });

    const badYears = await api().post('/api/v1/sources').set(admin.auth).send({
      title: 'Yil xatosi', summary: 'Yillar tartibi notogri', yearFrom: 1500, yearTo: 1400,
    });
    expect(badYears.status).toBe(400);

    expect((await api().delete(`/api/v1/sources/${id}`).set(admin.auth)).status).toBe(204);
    expect((await api().get(`/api/v1/sources/${id}`)).status).toBe(404);
  });

  it('o‘qituvchi faqat o‘z mavzusini tahrirlaydi; talaba mavzu qo‘sha olmaydi', async () => {
    const teacher = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');
    const other = await createSource();
    expect((await api().patch(`/api/v1/sources/${other.id}`).set(teacher.auth).send({ title: 'Boshqa nom' })).status).toBe(403);
    expect((await api().post('/api/v1/sources').set(student.auth).send({ title: 'Talaba mavzusi', summary: 'Ruxsat etilmasligi kerak' })).status).toBe(403);
  });
});

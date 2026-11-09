import { describe, expect, it } from 'vitest';
import { api, userWithToken } from './helpers';

describe('Manbalar: ko‘p tillilik (uz/ru/en)', () => {
  it('tarjima bo‘lsa ru da ko‘rinadi, yetishmagan qismlar o‘zbekchada qoladi', async () => {
    const admin = await userWithToken('ADMIN');
    const created = await api().post('/api/v1/sources').set(admin.auth).send({
      title: 'Amir Temur davri', summary: 'Temuriylar davlati haqida mavzu', lectureContent: '# Reja – kirish', videoUrl: 'https://www.youtube.com/watch?v=uz1',
    });
    expect(created.status).toBe(201);
    const { id, slug } = created.body.data;

    // Tarjima yo'q: ru so'rovida o'zbekcha va fallbacks
    const before = await api().get(`/api/v1/sources/${slug}`).set('X-Lang', 'ru');
    expect(before.body.data).toMatchObject({ title: 'Amir Temur davri', lang: 'uz' });
    expect(before.body.data.fallbacks).toContain('lecture');

    // Tarjimani faqat xodim saqlaydi, til faqat ru|en
    const anon = await api().put(`/api/v1/sources/${id}/translations/ru`).send({ title: 'Эпоха Амира Темура' });
    expect(anon.status).toBe(401);
    const badLocale = await api().put(`/api/v1/sources/${id}/translations/de`).set(admin.auth).send({ title: 'Zeit' });
    expect(badLocale.status).toBe(400);

    const put = await api().put(`/api/v1/sources/${id}/translations/ru`).set(admin.auth).send({
      title: 'Эпоха Амира Темура', summary: 'Тема о государстве Темуридов', lectureContent: '# План – введение',
    });
    expect(put.status).toBe(200);

    const ru = await api().get(`/api/v1/sources/${slug}`).set('X-Lang', 'ru');
    expect(ru.body.data).toMatchObject({ title: 'Эпоха Амира Темура', lang: 'ru', lectureContent: '# План – введение' });
    expect(ru.body.data.availableLocales).toEqual(['uz', 'ru']);
    // Video tarjimada yo'q — o'zbekcha qoladi va belgilanadi
    expect(ru.body.data.videoUrl).toBe('https://www.youtube.com/watch?v=uz1');
    expect(ru.body.data.fallbacks).toEqual(['video']);

    // O'zbekcha asosiy yozuv o'zgarmaydi; en uchun tarjima yo'q
    const uz = await api().get(`/api/v1/sources/${slug}`);
    expect(uz.body.data).toMatchObject({ title: 'Amir Temur davri', lectureContent: '# Reja – kirish' });
    const en = await api().get(`/api/v1/sources/${slug}`).query({ lang: 'en' });
    expect(en.body.data.lang).toBe('uz');

    // Ro'yxat va qidiruv
    const list = await api().get('/api/v1/sources').query({ q: 'Эпоха' }).set('X-Lang', 'ru');
    const row = list.body.data.find((s: { id: string }) => s.id === id);
    expect(row).toMatchObject({ title: 'Эпоха Амира Темура', hasLecture: true });
    const uzSearch = await api().get('/api/v1/sources').query({ q: 'Эпоха' });
    expect(uzSearch.body.data.find((s: { id: string }) => s.id === id)).toBeUndefined();

    const listT = await api().get(`/api/v1/sources/${id}/translations`).set(admin.auth);
    expect(listT.body.data).toHaveLength(1);

    const del = await api().delete(`/api/v1/sources/${id}/translations/ru`).set(admin.auth);
    expect(del.status).toBe(204);
    const after = await api().get(`/api/v1/sources/${slug}`).set('X-Lang', 'ru');
    expect(after.body.data.lang).toBe('uz');
  });
});

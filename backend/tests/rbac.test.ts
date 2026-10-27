import { describe, expect, it } from 'vitest';
import { prisma } from '../src/config/prisma';
import { api, createSource, userWithToken } from './helpers';

const sourceBody = { title: 'Yangi tarixiy hujjat', summary: 'Bu test uchun tarixiy hujjat tavsifi.', type: 'WRITTEN' };

describe('Rollar bo‘yicha ruxsatlar (RBAC)', () => {
  it('talaba manba yarata olmaydi, o‘qituvchi yaratgan manba darhol nashr etiladi', async () => {
    const student = await userWithToken('STUDENT');
    const teacher = await userWithToken('TEACHER');
    expect((await api().post('/api/v1/sources').set(student.auth).send(sourceBody)).status).toBe(403);
    expect((await api().post('/api/v1/sources').send(sourceBody)).status).toBe(401);
    const draft = await api().post('/api/v1/sources').set(teacher.auth).send(sourceBody);
    expect(draft.status).toBe(201);
    expect(draft.body.data.status).toBe('PUBLISHED');
    // Boshqa o'qituvchining manbasini tahrirlay olmaydi
    const other = await userWithToken('TEACHER');
    expect((await api().patch(`/api/v1/sources/${draft.body.data.id}`).set(other.auth).send({ title: 'Boshqa nom' })).status).toBe(403);
  });

  it('talaba va mehmon nashr etilmagan manbani ko‘rmaydi', async () => {
    const draft = await createSource({ status: 'DRAFT' });
    const student = await userWithToken('STUDENT');
    expect((await api().get(`/api/v1/sources/${draft.id}`)).status).toBe(404);
    expect((await api().get(`/api/v1/sources/${draft.id}`).set(student.auth)).status).toBe(404);
    const admin = await userWithToken('ADMIN');
    expect((await api().get(`/api/v1/sources/${draft.id}`).set(admin.auth)).status).toBe(200);
  });

  it('admin endpointlari faqat admin uchun', async () => {
    const teacher = await userWithToken('TEACHER');
    expect((await api().get('/api/v1/admin/settings').set(teacher.auth)).status).toBe(403);
    expect((await api().post('/api/v1/users').set(teacher.auth).send({})).status).toBe(403);
    const admin = await userWithToken('ADMIN');
    expect((await api().get('/api/v1/admin/audit-logs').set(admin.auth)).status).toBe(200);
  });

  it('admin talabani guruhga biriktiradi, almashtiradi va guruhdan chiqaradi', async () => {
    const admin = await userWithToken('ADMIN');
    const teacher = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');
    const [g1, g2] = await Promise.all(['A', 'B'].map((n) => prisma.group.create({ data: { name: `Guruh ${n} ${Date.now()}`, teacherId: teacher.user.id } })));
    const setGroup = (auth: Record<string, string>, groupId: string | null, id = student.user.id) =>
      api().post(`/api/v1/users/${id}/group`).set(auth).send({ groupId });
    const groupsOf = async () => (await prisma.groupMembership.findMany({ where: { studentId: student.user.id } })).map((m) => m.groupId);

    expect((await setGroup(teacher.auth, g1.id)).status).toBe(403);
    expect((await setGroup(admin.auth, g1.id, teacher.user.id)).status).toBe(400);
    expect((await setGroup(admin.auth, g1.id)).status).toBe(204);
    expect(await groupsOf()).toEqual([g1.id]);
    // Almashtirish — eski guruhdan chiqariladi
    expect((await setGroup(admin.auth, g2.id)).status).toBe(204);
    expect(await groupsOf()).toEqual([g2.id]);
    const list = await api().get('/api/v1/users').query({ q: student.user.username }).set(admin.auth);
    expect(list.body.data[0].groups).toEqual([{ id: g2.id, name: g2.name }]);
    expect((await setGroup(admin.auth, null)).status).toBe(204);
    expect(await groupsOf()).toEqual([]);
  });

  it('talaba ro‘yxatdan o‘tishda guruh tanlaydi; guruhsiz talaba bir marta o‘zi qo‘shiladi', async () => {
    const teacher = await userWithToken('TEACHER');
    const [g1, g2] = await Promise.all(['R1', 'R2'].map((n) => prisma.group.create({ data: { name: `Guruh ${n} ${Date.now()}`, teacherId: teacher.user.id } })));

    // Ochiq ro'yxat: login talab qilinmaydi, faqat id va nom
    const pub = await api().get('/api/v1/groups/public');
    expect(pub.status).toBe(200);
    expect(pub.body.data.find((g: { id: string }) => g.id === g1.id)).toEqual({ id: g1.id, name: g1.name });

    const username = `reg-${Date.now()}`;
    const reg = await api().post('/api/v1/auth/register').send({ username, password: 'Password123', fullName: 'Guruhli Talaba', role: 'STUDENT', groupId: g1.id });
    expect(reg.status).toBe(201);
    const regUser = await prisma.user.findUniqueOrThrow({ where: { username }, include: { memberships: true } });
    expect(regUser.memberships.map((m) => m.groupId)).toEqual([g1.id]);

    // Guruhsiz talaba o'zi qo'shiladi, ikkinchi marta — rad etiladi (almashtirish faqat admin orqali)
    const student = await userWithToken('STUDENT');
    expect((await api().post(`/api/v1/groups/${g1.id}/join`).set(student.auth)).status).toBe(204);
    expect((await api().post(`/api/v1/groups/${g2.id}/join`).set(student.auth)).status).toBe(409);
    expect((await api().post(`/api/v1/groups/${g2.id}/join`).set(teacher.auth)).status).toBe(403);
  });

  it('logotip sifatida yuklangan rasm manzili yoki http(s) havola qabul qilinadi', async () => {
    const admin = await userWithToken('ADMIN');
    const put = (logo: string) => api().put('/api/v1/admin/settings').set(admin.auth).send({ 'platform.logoUrl': logo });
    expect((await put('/api/v1/media/00000000-0000-4000-8000-000000000000')).status).toBe(200);
    expect((await put('https://example.org/logo.png')).status).toBe(200);
    expect((await put('javascript:alert(1)')).status).toBe(400);
    expect((await put('/api/v1/users')).status).toBe(400);
    expect((await put('')).status).toBe(200);
  });

  it('o‘qituvchi faqat o‘z guruhidagi talabaning portfoliosini ko‘radi', async () => {
    const teacherA = await userWithToken('TEACHER');
    const teacherB = await userWithToken('TEACHER');
    const student = await userWithToken('STUDENT');
    const group = await api().post('/api/v1/groups').set(teacherA.auth).send({ name: 'Guruh A', kind: 'EXPERIMENTAL' });
    expect(group.status).toBe(201);
    const add = await api().post(`/api/v1/groups/${group.body.data.id}/members`).set(teacherA.auth).send({ studentIds: [student.user.id] });
    expect(add.status).toBe(200);
    expect((await api().get(`/api/v1/portfolios/students/${student.user.id}`).set(teacherA.auth)).status).toBe(200);
    expect((await api().get(`/api/v1/portfolios/students/${student.user.id}`).set(teacherB.auth)).status).toBe(403);
    const other = await userWithToken('STUDENT');
    expect((await api().get(`/api/v1/portfolios/students/${student.user.id}`).set(other.auth)).status).toBe(403);
  });

  it('bloklangan foydalanuvchi tokeni darhol yaroqsiz bo‘ladi', async () => {
    const student = await userWithToken('STUDENT');
    await prisma.user.update({ where: { id: student.user.id }, data: { status: 'BLOCKED' } });
    expect((await api().get('/api/v1/auth/me').set(student.auth)).status).toBe(401);
  });
});

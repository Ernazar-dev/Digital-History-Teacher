import { describe, expect, it } from 'vitest';
import { api, createUser, PASSWORD } from './helpers';

const cookieOf = (res: { headers: Record<string, unknown> }) =>
  ((res.headers['set-cookie'] as string[] | undefined) ?? []).find((c) => c.startsWith('dht_refresh='))?.split(';')[0];

describe('Autentifikatsiya', () => {
  it('talaba ro‘yxatdan o‘tadi va tizimga kiradi', async () => {
    const username = `reg-${Date.now()}`;
    const reg = await api().post('/api/v1/auth/register').send({ username, password: 'Parol12345', fullName: 'Yangi Talaba' });
    expect(reg.status).toBe(201);
    expect(reg.body.data.user.status).toBe('ACTIVE');
    expect(reg.body.data.user).not.toHaveProperty('passwordHash');
    expect(reg.body.data.user.email).toBeNull();
    // Faol hisob darhol sessiya oladi — qayta login shart emas
    expect(reg.body.data.accessToken).toBeTruthy();
    expect(cookieOf(reg)).toBeTruthy();

    // Login katta-kichik harfga sezgir emas
    const login = await api().post('/api/v1/auth/login').send({ username: username.toUpperCase(), password: 'Parol12345' });
    expect(login.status).toBe(200);
    expect(login.body.data.accessToken).toBeTruthy();
    const cookie = (login.headers['set-cookie'] as unknown as string[]).join(';');
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Strict/i);
  });

  it('kuchsiz parol, noto‘g‘ri login va email validatsiyadan o‘tmaydi', async () => {
    const res = await api().post('/api/v1/auth/register').send({ username: 'a b', email: 'xato', password: '123', fullName: 'A' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('noto‘g‘ri parol — 401, band login — 409', async () => {
    const user = await createUser('STUDENT');
    const bad = await api().post('/api/v1/auth/login').send({ username: user.username, password: 'Notogri123' });
    expect(bad.status).toBe(401);
    const dup = await api().post('/api/v1/auth/register').send({ username: user.username, password: 'Parol12345', fullName: 'Dublikat' });
    expect(dup.status).toBe(409);
  });

  it('brute-force: 5 ta noto‘g‘ri paroldan keyin hisob vaqtincha yopiladi (to‘g‘ri parol bilan ham)', async () => {
    const user = await createUser('STUDENT');
    for (let i = 0; i < 5; i++) {
      expect((await api().post('/api/v1/auth/login').send({ username: user.username, password: `Xato${i}parol1` })).status).toBe(401);
    }
    const locked = await api().post('/api/v1/auth/login').send({ username: user.username, password: PASSWORD });
    expect(locked.status).toBe(429);
    expect(locked.body.error.code).toBe('TOO_MANY_REQUESTS');
    // Boshqa hisobga ta'sir qilmaydi
    const other = await createUser('STUDENT');
    expect((await api().post('/api/v1/auth/login').send({ username: other.username, password: PASSWORD })).status).toBe(200);
  });

  it('SQL injection va XSS satrlari oddiy matn sifatida ishlanadi', async () => {
    const sqli = await api().post('/api/v1/auth/login').send({ username: "admin' OR '1'='1", password: "' OR 1=1 --" });
    expect([400, 401]).toContain(sqli.status);
    const search = await api().get('/api/v1/sources').query({ q: "'; DROP TABLE \"User\"; --" });
    expect(search.status).toBe(200);
    expect(search.body.data).toEqual([]);
    const user = await createUser('STUDENT');
    expect((await api().post('/api/v1/auth/login').send({ username: user.username, password: PASSWORD })).status).toBe(200);
  });

  it('juda katta so‘rov tanasi 413 bilan rad etiladi (500 emas)', async () => {
    const res = await api().post('/api/v1/auth/login').set('Content-Type', 'application/json').send(`{"username":"${'a'.repeat(1_200_000)}"}`);
    expect(res.status).toBe(413);
  });

  it('o‘qituvchi tasdiqlanmaguncha kira olmaydi', async () => {
    const username = `t-${Date.now()}`;
    const reg = await api().post('/api/v1/auth/register').send({ username, email: `${username}@test.local`, password: 'Parol12345', fullName: 'Oqituvchi', role: 'TEACHER' });
    expect(reg.body.data.user.status).toBe('PENDING');
    expect(reg.body.data.accessToken).toBeNull();
    expect(cookieOf(reg)).toBeUndefined();
    const login = await api().post('/api/v1/auth/login').send({ username, password: 'Parol12345' });
    expect(login.status).toBe(403);
  });

  it('refresh token rotatsiyasi, CSRF header va qayta ishlatishni aniqlash', async () => {
    const user = await createUser('STUDENT');
    const login = await api().post('/api/v1/auth/login').send({ username: user.username, password: PASSWORD });
    const cookie1 = cookieOf(login)!;

    const noHeader = await api().post('/api/v1/auth/refresh').set('Cookie', cookie1);
    expect(noHeader.status).toBe(403);

    const r1 = await api().post('/api/v1/auth/refresh').set('Cookie', cookie1).set('X-Requested-With', 'dht');
    expect(r1.status).toBe(200);
    const cookie2 = cookieOf(r1)!;
    expect(cookie2).not.toBe(cookie1);

    // Eski token qayta ishlatilsa — barcha sessiyalar bekor qilinadi
    const reuse = await api().post('/api/v1/auth/refresh').set('Cookie', cookie1).set('X-Requested-With', 'dht');
    expect(reuse.status).toBe(401);
    const after = await api().post('/api/v1/auth/refresh').set('Cookie', cookie2).set('X-Requested-With', 'dht');
    expect(after.status).toBe(401);
  });

  it('cookie bo‘lmasa refresh xato emas — 204 (mehmon)', async () => {
    const res = await api().post('/api/v1/auth/refresh').set('X-Requested-With', 'dht');
    expect(res.status).toBe(204);
  });

  it('/auth/me tokensiz — 401, token bilan — foydalanuvchi', async () => {
    expect((await api().get('/api/v1/auth/me')).status).toBe(401);
    const user = await createUser('TEACHER');
    const login = await api().post('/api/v1/auth/login').send({ username: user.username, password: PASSWORD });
    const me = await api().get('/api/v1/auth/me').set('Authorization', `Bearer ${login.body.data.accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.role).toBe('TEACHER');
  });

  it('parolni tiklash tokeni bir martalik', async () => {
    const user = await createUser('STUDENT');
    const f = await api().post('/api/v1/auth/forgot-password').send({ username: user.username });
    const token = f.body.data.devResetToken as string;
    expect(token).toBeTruthy();
    expect((await api().post('/api/v1/auth/reset-password').send({ token, password: 'YangiParol123' })).status).toBe(200);
    expect((await api().post('/api/v1/auth/reset-password').send({ token, password: 'YangiParol456' })).status).toBe(400);
    expect((await api().post('/api/v1/auth/login').send({ username: user.username, password: 'YangiParol123' })).status).toBe(200);
  });
});

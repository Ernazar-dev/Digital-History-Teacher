import { beforeAll, describe, expect, it } from 'vitest';
import { api, createSource, ensureAssessmentConfig, userWithToken } from './helpers';

const ANSWERS = {
  sourceType: 'Yozma', created: 'XV asr', author: 'Tarixchi', origin: 'Saroy', purpose: 'Ulug‘lash', information: 'Yurishlar',
  evidence: 'Iqtibos', reliabilityLevel: 'MEDIUM', reliability: 'Solishtirildi', limitations: 'Bir tomonlama',
  conclusion: 'Xulosa', teachingUse: 'Taqqoslash darsi', studentTasks: 'Fakt va bahoni ajrating',
};

describe('O‘yin elementlari va individual traektoriya', () => {
  beforeAll(async () => {
    await ensureAssessmentConfig();
  });

  it('ball baholangan ishlardan hisoblanadi, reyting va traektoriya to‘g‘ri', async () => {
    const teacher = await userWithToken('TEACHER');
    const s1 = await userWithToken('STUDENT');
    const s2 = await userWithToken('STUDENT');
    const outsider = await userWithToken('STUDENT');
    const group = await api().post('/api/v1/groups').set(teacher.auth).send({ name: 'Reyting guruhi' });
    const gid = group.body.data.id;
    await api().post(`/api/v1/groups/${gid}/members`).set(teacher.auth).send({ studentIds: [s1.user.id, s2.user.id] });

    // Yangi talaba: ball 0, traektoriyada komponent bo'yicha tavsiya bor
    const fresh = await api().get('/api/v1/progress/me').set(s1.auth);
    expect(fresh.status).toBe(200);
    expect(fresh.body.data.points).toBe(0);
    expect(fresh.body.data.level.name).toBe('Izlanuvchi');
    expect(fresh.body.data.trajectory.some((t: { kind: string }) => t.kind === 'COMPONENT')).toBe(true);

    // s1 manba tahlilini topshiradi, o'qituvchi qaytaradi → traektoriyada birinchi o'rinda
    const source = await createSource();
    const an = await api().post('/api/v1/source-analyses').set(s1.auth).send({ sourceId: source.id, answers: ANSWERS });
    const aid = an.body.data.id;
    await api().post(`/api/v1/source-analyses/${aid}/submit`).set(s1.auth);
    await api().post(`/api/v1/source-analyses/${aid}/review`).set(teacher.auth).send({ decision: 'RETURN', comment: 'Dalil yetarli emas' });
    const afterReturn = await api().get('/api/v1/progress/me').set(s1.auth);
    expect(afterReturn.body.data.trajectory[0]).toMatchObject({ kind: 'RETURNED', link: `/app/analysis/${aid}` });

    // Qayta topshirib, 85% olsa: 9 ball + yutuqlar bonusi
    await api().post(`/api/v1/source-analyses/${aid}/submit`).set(s1.auth);
    await api().post(`/api/v1/source-analyses/${aid}/review`).set(teacher.auth).send({ decision: 'ACCEPT', comment: 'Yaxshi', score: 85 });
    const p = await api().get('/api/v1/progress/me').set(s1.auth);
    expect(p.body.data.workPoints).toBe(9);
    expect(p.body.data.achievements.find((x: { code: string }) => x.code === 'FIRST_ANALYSIS').earned).toBe(true);
    expect(p.body.data.points).toBe(9 + 5 * p.body.data.achievements.filter((x: { earned: boolean }) => x.earned).length);

    // Reyting: s1 birinchi; talabaga boshqalarning ismi qisqartiriladi, o'qituvchiga to'liq
    const lb = await api().get(`/api/v1/progress/groups/${gid}/leaderboard`).set(s2.auth);
    expect(lb.body.data.rows[0].studentId).toBe(s1.user.id);
    const other = lb.body.data.rows.find((r: { isMe: boolean }) => !r.isMe);
    expect(other.name).not.toBe(s1.user.fullName);
    const lbTeacher = await api().get(`/api/v1/progress/groups/${gid}/leaderboard`).set(teacher.auth);
    expect(lbTeacher.body.data.rows[0].name).toBe(s1.user.fullName);
    expect((await api().get(`/api/v1/progress/groups/${gid}/leaderboard`).set(outsider.auth)).status).toBe(403);

    // O'qituvchi talabaning traektoriyasini ko'radi; begona talaba uchun emas
    expect((await api().get(`/api/v1/progress/students/${s1.user.id}`).set(teacher.auth)).status).toBe(200);
    expect((await api().get(`/api/v1/progress/students/${outsider.user.id}`).set(teacher.auth)).status).toBe(403);
  });
});

import type { Role } from '@prisma/client';
import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/config/prisma';
import { hashPassword } from '../src/shared/utils/password';

export const app = createApp();
export const api = () => request(app);
export const PASSWORD = 'Password123';

let counter = 0;

export const createUser = async (role: Role, status: 'ACTIVE' | 'PENDING' = 'ACTIVE') => {
  counter += 1;
  const username = `${role.toLowerCase()}${counter}-${Date.now()}`;
  const user = await prisma.user.create({
    data: {
      username, fullName: `${role} ${counter}`, role, status, passwordHash: await hashPassword(PASSWORD),
      ...(role === 'STUDENT' ? { portfolio: { create: {} } } : {}),
    },
  });
  return user;
};

export const tokenFor = async (username: string) => {
  const res = await api().post('/api/v1/auth/login').send({ username, password: PASSWORD });
  if (res.status !== 200) throw new Error(`Login xatosi: ${res.status} ${JSON.stringify(res.body)}`);
  return res.body.data.accessToken as string;
};

export const userWithToken = async (role: Role) => {
  const user = await createUser(role);
  return { user, token: await tokenFor(user.username), auth: { Authorization: `Bearer ${await tokenFor(user.username)}` } };
};

/** Hujjatdagi 4 komponent va 3 daraja — minimal baholash konfiguratsiyasi */
export const ensureAssessmentConfig = async () => {
  const comps = [
    { code: 'MOTIVATIONAL', weights: { SURVEY: 0.5, REFLECTION: 0.3, SELF_ASSESSMENT: 0.2 } },
    { code: 'COGNITIVE', weights: { TEST: 0.5, SOURCE_ANALYSIS: 0.5 } },
    { code: 'ACTIVITY', weights: { PRACTICAL_TASK: 0.4, LESSON_PLAN: 0.6 } },
    { code: 'REFLECTIVE', weights: { SELF_ASSESSMENT: 0.3, EXPERT: 0.3, REFLECTION: 0.2, PORTFOLIO: 0.2 } },
  ];
  for (const [i, c] of comps.entries()) {
    const existing = await prisma.assessmentComponent.findUnique({ where: { code: c.code } });
    if (existing) continue;
    await prisma.assessmentComponent.create({
      data: {
        code: c.code, name: c.code, definition: `${c.code} ta'rifi`, sortOrder: i,
        evidenceWeights: { create: Object.entries(c.weights).map(([k, w]) => ({ evidenceKind: k as never, weight: w })) },
      },
    });
  }
  if ((await prisma.assessmentLevel.count()) === 0) {
    await prisma.assessmentLevel.createMany({
      data: [
        { code: 'LOW', name: 'Past', description: 'past', minPercent: 0, maxPercent: 54.9, sortOrder: 0 },
        { code: 'MEDIUM', name: 'O‘rta', description: 'o‘rta', minPercent: 55, maxPercent: 79.9, sortOrder: 1 },
        { code: 'HIGH', name: 'Yuqori', description: 'yuqori', minPercent: 80, maxPercent: 100, sortOrder: 2 },
      ],
    });
  }
  return Object.fromEntries((await prisma.assessmentComponent.findMany()).map((c) => [c.code, c.id]));
};

export const createSource = async (overrides: Record<string, unknown> = {}) => {
  counter += 1;
  return prisma.historicalSource.create({
    data: {
      title: `Test manba ${counter}`, slug: `test-manba-${counter}-${Date.now()}`, summary: 'Test uchun manba tavsifi',
      type: 'WRITTEN', status: 'PUBLISHED', ...overrides,
    },
  });
};

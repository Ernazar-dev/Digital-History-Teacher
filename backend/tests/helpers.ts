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

export const createSource = async (overrides: Record<string, unknown> = {}) => {
  counter += 1;
  return prisma.historicalSource.create({
    data: {
      title: `Test manba ${counter}`, slug: `test-manba-${counter}-${Date.now()}`, summary: 'Test uchun manba tavsifi',
      type: 'WRITTEN', status: 'PUBLISHED', ...overrides,
    },
  });
};

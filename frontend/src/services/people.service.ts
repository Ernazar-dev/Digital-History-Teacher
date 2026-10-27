import type { Group, GroupKind, Role, User, UserStatus } from '@/types/api';
import { cleanParams, del, getData, getPage, patchData, postData } from './api';

export const usersService = {
  list: (f: { role?: Role; status?: UserStatus; q?: string; page?: number; pageSize?: number } = {}) =>
    getPage<User>('/users', cleanParams({ ...f })),
  create: (body: { username: string; email?: string; password: string; fullName: string; institution?: string; role: Role; status: UserStatus }) =>
    postData<User>('/users', body),
  update: (id: string, body: { fullName?: string; institution?: string | null; role?: Role; status?: UserStatus }) =>
    patchData<User>(`/users/${id}`, body),
  approve: (id: string) => postData<User>(`/users/${id}/approve`),
  resetPassword: (id: string, password: string) => postData(`/users/${id}/reset-password`, { password }),
  setGroup: (id: string, groupId: string | null) => postData(`/users/${id}/group`, { groupId }),
  remove: (id: string) => del(`/users/${id}`),
};

export interface GroupInput { name: string; description?: string | null; kind: GroupKind; academicYear?: string | null; teacherId?: string }

export const groupsService = {
  list: () => getData<Group[]>('/groups'),
  /** Ro'yxatdan o'tish formasi uchun — faqat nomlar */
  publicList: () => getData<{ id: string; name: string }[]>('/groups/public'),
  /** Guruhsiz talaba o'zi guruh tanlaydi */
  join: (id: string) => postData(`/groups/${id}/join`),
  get: (id: string) => getData<Group>(`/groups/${id}`),
  create: (body: GroupInput) => postData<Group>('/groups', body),
  update: (id: string, body: Partial<GroupInput>) => patchData<Group>(`/groups/${id}`, body),
  remove: (id: string) => del(`/groups/${id}`),
  addMembers: (id: string, studentIds: string[]) => postData<Group>(`/groups/${id}/members`, { studentIds }),
  removeMember: (id: string, studentId: string) => del(`/groups/${id}/members/${studentId}`),
};

import { http } from '@/lib/http';
import type { User } from '@/types/api';

export interface LoginInput { username: string; password: string }
export interface RegisterInput { username: string; email?: string; password: string; fullName: string; institution?: string; groupId?: string }

export const authService = {
  login: (input: LoginInput) => http.post<{ data: { user: User; accessToken: string } }>('/auth/login', input).then((r) => r.data.data),
  /** accessToken — hisob darhol faol bo'lsa (sessiya ochiladi), aks holda null */
  register: (input: RegisterInput) => http.post<{ data: { user: User; accessToken: string | null; message: string } }>('/auth/register', input).then((r) => r.data.data),
  logout: () => http.post('/auth/logout', null, { headers: { 'X-Requested-With': 'dht' } }),
  me: () => http.get<{ data: User }>('/auth/me').then((r) => r.data.data),
  updateProfile: (input: { fullName?: string; email?: string | null; institution?: string | null }) => http.patch<{ data: User }>('/auth/me', input).then((r) => r.data.data),
  changePassword: (input: { currentPassword: string; newPassword: string }) => http.post('/auth/change-password', input),
  forgotPassword: (username: string) =>
    http.post<{ data: { message: string; devResetToken?: string } }>('/auth/forgot-password', { username }).then((r) => r.data.data),
  resetPassword: (token: string, password: string) =>
    http.post<{ data: { message: string } }>('/auth/reset-password', { token, password }).then((r) => r.data.data),
};

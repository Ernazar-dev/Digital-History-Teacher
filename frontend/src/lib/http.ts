import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/auth.store';
import { useLoginPrompt } from '@/features/auth/loginPrompt.store';
import type { ApiErrorBody } from '@/types/api';

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1';

/** Yagona axios instansi — barcha servislar shundan foydalanadi */
export const http = axios.create({ baseURL, withCredentials: true, timeout: 30000 });

/** Mehmon o'zgartiruvchi amal (POST/PUT/PATCH/DELETE) qilmoqchi bo'lganda — so'rov yuborilmaydi, "Kirish" oynasi ochiladi */
export class AuthRequiredError extends Error {
  constructor() {
    super('Bu amalni bajarish uchun tizimga kiring yoki ro‘yxatdan o‘ting');
    this.name = 'AuthRequiredError';
  }
}

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const method = (config.method ?? 'get').toLowerCase();
  if (!token && method !== 'get' && !config.url?.includes('/auth/')) {
    useLoginPrompt.getState().show();
    throw new AuthRequiredError();
  }
  return config;
});

/** Bir vaqtda bir nechta 401 kelganda faqat bitta refresh so'rovi yuboriladi */
let refreshing: Promise<string | null> | null = null;

export const refreshSession = async (): Promise<string | null> => {
  refreshing ??= axios
    .post(`${baseURL}/auth/refresh`, null, { withCredentials: true, headers: { 'X-Requested-With': 'dht' } })
    .then((res) => {
      if (res.status === 204 || !res.data?.data) {
        useAuthStore.getState().clear();
        return null;
      }
      const { user, accessToken } = res.data.data;
      useAuthStore.getState().setSession(user, accessToken);
      return accessToken as string;
    })
    .catch(() => {
      useAuthStore.getState().clear();
      return null;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
};

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthCall = original?.url?.includes('/auth/');
    if (error.response?.status === 401 && original && !original._retry && !isAuthCall && useAuthStore.getState().accessToken) {
      original._retry = true;
      const token = await refreshSession();
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      }
    }
    return Promise.reject(error);
  },
);

/** Server xatosini foydalanuvchiga tushunarli matnga aylantiradi */
export const errorMessage = (err: unknown, fallback = 'Kutilmagan xato yuz berdi'): string => {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) return 'Server bilan aloqa yo‘q. Internet yoki serverni tekshiring.';
    const body = err.response.data?.error;
    if (body?.details && typeof body.details === 'object') {
      const d = body.details as { missing?: string[]; problems?: string[] } | { path: string; message: string }[];
      if (Array.isArray(d) && d.length) return `${body.message}: ${d.map((x) => x.message).join('; ')}`;
      if (!Array.isArray(d) && d.missing?.length) return `${body.message}: ${d.missing.join('; ')}`;
      if (!Array.isArray(d) && d.problems?.length) return `${body.message}: ${d.problems.join('; ')}`;
    }
    return body?.message ?? fallback;
  }
  return err instanceof Error ? err.message : fallback;
};

export const errorDetails = (err: unknown): string[] => {
  if (!axios.isAxiosError<ApiErrorBody>(err)) return [];
  const d = err.response?.data?.error?.details as { missing?: string[]; problems?: string[] } | undefined;
  return d?.missing ?? d?.problems ?? [];
};

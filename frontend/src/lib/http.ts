import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/auth.store';
import { useLoginPrompt } from '@/features/auth/loginPrompt.store';
import i18n, { currentLang } from '@/i18n';
import type { ApiErrorBody } from '@/types/api';

const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1';

/** Yagona axios instansi — barcha servislar shundan foydalanadi */
export const http = axios.create({ baseURL, withCredentials: true, timeout: 30000 });

/** Mehmon oʻzgartiruvchi amal (POST/PUT/PATCH/DELETE) qilmoqchi boʻlganda — soʻrov yuborilmaydi, "Kirish" oynasi ochiladi */
export class AuthRequiredError extends Error {
  constructor() {
    super(i18n.t('errors.authRequired'));
    this.name = 'AuthRequiredError';
  }
}

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Server kontentni shu tilda qaytaradi (tarjima boʻlmasa — oʻzbekcha)
  // (soʻrov oʻzi til bergan boʻlsa — masalan, tahrirlash uchun asosiy yozuv — oʻzgartirilmaydi)
  if (!config.headers['X-Lang']) config.headers['X-Lang'] = currentLang();
  const method = (config.method ?? 'get').toLowerCase();
  if (!token && method !== 'get' && !config.url?.includes('/auth/')) {
    useLoginPrompt.getState().show();
    throw new AuthRequiredError();
  }
  return config;
});

/** Bir vaqtda bir nechta 401 kelganda faqat bitta refresh soʻrovi yuboriladi */
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
export const errorMessage = (err: unknown, fallback = i18n.t('errors.unexpected')): string => {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) return i18n.t('errors.noConnection');
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

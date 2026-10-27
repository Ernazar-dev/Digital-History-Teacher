import { http } from '@/lib/http';
import type { PageMeta } from '@/types/api';

/** `{ data }` javobdan ma'lumotni ajratadi */
export const getData = <T>(url: string, params?: object) => http.get<{ data: T }>(url, { params }).then((r) => r.data.data);
export const getPage = <T>(url: string, params?: object) =>
  http.get<{ data: T[]; meta: PageMeta }>(url, { params }).then((r) => r.data);
export const postData = <T>(url: string, body?: unknown) => http.post<{ data: T }>(url, body).then((r) => r.data?.data);
export const putData = <T>(url: string, body?: unknown) => http.put<{ data: T }>(url, body).then((r) => r.data?.data);
export const patchData = <T>(url: string, body?: unknown) => http.patch<{ data: T }>(url, body).then((r) => r.data?.data);
export const del = (url: string) => http.delete(url).then(() => undefined);

/** Bo'sh qiymatlarni so'rov parametrlaridan chiqarib tashlaydi */
export const cleanParams = (p: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined && v !== null && v !== ''));

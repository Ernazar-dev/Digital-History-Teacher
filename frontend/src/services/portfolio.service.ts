import { http } from '@/lib/http';
import type { AuditLog, Portfolio, PortfolioItem, PortfolioItemDetail, PublicSettings, Reflection, Settings } from '@/types/api';
import { cleanParams, del, getData, getPage, patchData, postData, putData } from './api';

export const portfolioService = {
  mine: () => getData<Portfolio>('/portfolios/me'),
  student: (studentId: string) => getData<Portfolio>(`/portfolios/students/${studentId}`),
  updateSummary: (summary: string) => patchData('/portfolios/me', { summary }),
  item: (id: string) => getData<PortfolioItemDetail>(`/portfolios/items/${id}`),
  updateItem: (id: string, body: { isFeatured?: boolean }) => patchData<PortfolioItem>(`/portfolios/items/${id}`, body),
  addReflection: (body: { title: string; content: string }) => postData<Reflection>('/portfolios/reflections', body),
  deleteReflection: (id: string) => del(`/portfolios/reflections/${id}`),
};

export const adminService = {
  settings: () => getData<Settings>('/admin/settings'),
  saveSettings: (body: Partial<Settings>) => putData<Settings>('/admin/settings', body),
  publicSettings: () => getData<PublicSettings>('/settings/public'),
  auditLogs: (f: { page?: number; pageSize?: number; entity?: string; action?: string }) =>
    getPage<AuditLog>('/admin/audit-logs', cleanParams({ ...f })),
  uploadMedia: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return http.post<{ data: { id: string; originalName: string; mimeType: string; size: number } }>('/media', fd).then((r) => r.data.data);
  },
};

/** Profil sahifasidagi elektron portfolio fayli (talaba o'zi yuklaydi) */
export interface PortfolioFile {
  id: string; title: string; createdAt: string;
  file: { id: string; originalName: string; mimeType: string; size: number } | null;
}

export const portfolioFilesService = {
  mine: () => getData<PortfolioFile[]>('/portfolios/me/files'),
  student: (studentId: string) => getData<PortfolioFile[]>(`/portfolios/students/${studentId}/files`),
  upload: (file: File, title?: string) => {
    const body = new FormData();
    body.append('file', file);
    if (title) body.append('title', title);
    return postData<PortfolioFile>('/portfolios/me/files', body);
  },
  remove: (id: string) => del(`/portfolios/files/${id}`),
  /** Fayl ruxsat tekshiruvi bilan beriladi — token bilan yuklab olinadi */
  download: (id: string) => http.get<Blob>(`/portfolios/files/${id}/download`, { responseType: 'blob' }).then((r) => r.data),
};

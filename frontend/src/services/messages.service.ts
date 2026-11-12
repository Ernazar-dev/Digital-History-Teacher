import { cleanParams, del, getData, getPage, patchData, postData } from './api';

export interface ContactMessage {
  id: string; name: string; email: string | null; phone: string | null; message: string; isRead: boolean; createdAt: string;
}
export interface ContactInput { name: string; email?: string; phone?: string; message: string }

export const messagesService = {
  /** Oçiq forma: mehmon ham yubora oladi */
  send: (body: ContactInput) => postData<{ sent: true }>('/messages', cleanParams({ ...body })),
  /** Administrator: xabarlar röyxati (+ öqilmaganlar soni) */
  list: (params: { page?: number; pageSize?: number; unread?: boolean }) =>
    getPage<ContactMessage>('/messages', cleanParams({ ...params })),
  unreadCount: () => getData<{ count: number }>('/messages/unread-count').then((d) => d.count),
  setRead: (id: string, isRead: boolean) => patchData<ContactMessage>(`/messages/${id}`, { isRead }),
  remove: (id: string) => del(`/messages/${id}`),
};

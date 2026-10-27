import type { ObjectType, Provider, VirtualObject, VirtualObjectListItem, VirtualResponse } from '@/types/api';
import { cleanParams, del, getData, getPage, patchData, postData, putData } from './api';
import type { ReviewInput } from './catalog.service';

export interface ObjectFilters { q?: string; type?: ObjectType; provider?: Provider; periodId?: string; status?: string; page?: number; pageSize?: number }
export type ObjectInput = Partial<Omit<VirtualObject, 'id' | 'tasks' | 'sources' | 'period' | 'assignments' | 'myResponse'>> & {
  sourceIds?: string[];
  tasks?: { kind: string; prompt: string }[];
};

export const museumService = {
  list: (f: ObjectFilters) => getPage<VirtualObjectListItem>('/virtual-objects', cleanParams({ ...f })),
  get: (idOrSlug: string) => getData<VirtualObject>(`/virtual-objects/${idOrSlug}`),
  create: (body: ObjectInput) => postData<VirtualObject>('/virtual-objects', body),
  update: (id: string, body: ObjectInput) => patchData<VirtualObject>(`/virtual-objects/${id}`, body),
  setActive: (id: string, isActive: boolean) => patchData<VirtualObject>(`/virtual-objects/${id}/active`, { isActive }),
  remove: (id: string) => del(`/virtual-objects/${id}`),
  saveResponse: (id: string, body: { answers: Record<string, string>; activityDesign: string }) =>
    putData<VirtualResponse>(`/virtual-objects/${id}/response`, body),
  submitResponse: (id: string) => postData<VirtualResponse>(`/virtual-objects/${id}/response/submit`),
  responses: (id: string) => getData<VirtualResponse[]>(`/virtual-objects/${id}/responses`),
  myResponses: () => getData<VirtualResponse[]>('/virtual-objects/responses/mine'),
  response: (responseId: string) => getData<VirtualResponse>(`/virtual-objects/responses/${responseId}`),
  reviewResponse: (responseId: string, body: ReviewInput) => postData<VirtualResponse>(`/virtual-objects/responses/${responseId}/review`, body),
};

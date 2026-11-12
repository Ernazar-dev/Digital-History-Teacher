import type { Period, Source, SourceListItem, SourceTranslation, SourceType, Topic, WorkStatus } from '@/types/api';
import { cleanParams, del, getData, getPage, patchData, postData, putData } from './api';

export interface SourceTranslationInput {
  title: string; summary: string | null; lectureContent: string | null;
  lectureFileId: string | null; presentationFileId: string | null; videoFileId: string | null; videoUrl: string | null;
}

export interface SourceFilters {
  q?: string; type?: SourceType; periodId?: string; topicId?: string; status?: string;
  sort?: 'order' | 'newest' | 'title'; page?: number; pageSize?: number;
}
export type SourceInput = Partial<Pick<Source,
  | 'title' | 'summary' | 'periodId' | 'bookLabel' | 'sortOrder' | 'dateLabel' | 'yearFrom' | 'yearTo' | 'lectureContent'
  | 'references' | 'mediaFileId' | 'lectureFileId' | 'presentationFileId' | 'videoFileId' | 'videoUrl' | 'status' | 'mediaUrl' | 'license' | 'originalUrl'
>> & { topicIds?: string[] };

export const catalogService = {
  periods: () => getData<Period[]>('/periods'),
  createPeriod: (body: Partial<Period>) => postData<Period>('/periods', body),
  updatePeriod: (id: string, body: Partial<Period>) => patchData<Period>(`/periods/${id}`, body),
  deletePeriod: (id: string) => del(`/periods/${id}`),
  topics: (periodId?: string) => getData<Topic[]>('/topics', cleanParams({ periodId })),
  /** Boshqaruv (tahrirlash) uchun: tarjima qilinmagan asosiy nomlar */
  periodsBase: () => getData<Period[]>('/periods', undefined, { 'X-Lang': 'uz' }),
  topicsBase: () => getData<Topic[]>('/topics', undefined, { 'X-Lang': 'uz' }),
  createTopic: (body: Partial<Topic>) => postData<Topic>('/topics', body),
  deleteTopic: (id: string) => del(`/topics/${id}`),
};

export const sourcesService = {
  list: (f: SourceFilters) => getPage<SourceListItem>('/sources', cleanParams({ ...f })),
  get: (idOrSlug: string) => getData<Source>(`/sources/${idOrSlug}`),
  /** Tahrirlash uchun: interfeys tilidan qat'i nazar asosiy (oʻzbekcha) yozuv — tarjima ustiga yozilib ketmasligi uchun */
  getBase: (idOrSlug: string) => getData<Source>(`/sources/${idOrSlug}`, undefined, { 'X-Lang': 'uz' }),
  translations: (id: string) => getData<SourceTranslation[]>(`/sources/${id}/translations`),
  saveTranslation: (id: string, locale: 'ru' | 'en', body: SourceTranslationInput) =>
    putData<SourceTranslation>(`/sources/${id}/translations/${locale}`, body),
  removeTranslation: (id: string, locale: 'ru' | 'en') => del(`/sources/${id}/translations/${locale}`),
  create: (body: SourceInput) => postData<Source>('/sources', body),
  update: (id: string, body: SourceInput) => patchData<Source>(`/sources/${id}`, body),
  remove: (id: string) => del(`/sources/${id}`),
};

export interface ReviewInput { decision: 'RETURN' | 'ACCEPT'; comment: string; score?: number }
export interface WorkFilters { status?: WorkStatus; studentId?: string; sourceId?: string; page?: number; pageSize?: number }

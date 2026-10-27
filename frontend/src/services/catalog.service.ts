import type {
  AnalysisQuestion, Comparison, Period, Source, SourceAnalysis, SourceListItem, SourceType, Topic, WorkStatus,
} from '@/types/api';
import { cleanParams, del, getData, getPage, patchData, postData } from './api';

export interface SourceFilters {
  q?: string; type?: SourceType; periodId?: string; topicId?: string; status?: string;
  sort?: 'newest' | 'oldest' | 'title' | 'year'; page?: number; pageSize?: number;
}
export type SourceInput = Partial<Omit<Source, 'id' | 'topics' | 'period' | 'files'>> & { topicIds?: string[]; fileIds?: string[] };

export const catalogService = {
  periods: () => getData<Period[]>('/periods'),
  createPeriod: (body: Partial<Period>) => postData<Period>('/periods', body),
  updatePeriod: (id: string, body: Partial<Period>) => patchData<Period>(`/periods/${id}`, body),
  deletePeriod: (id: string) => del(`/periods/${id}`),
  topics: (periodId?: string) => getData<Topic[]>('/topics', cleanParams({ periodId })),
  createTopic: (body: Partial<Topic>) => postData<Topic>('/topics', body),
  deleteTopic: (id: string) => del(`/topics/${id}`),
};

export const sourcesService = {
  list: (f: SourceFilters) => getPage<SourceListItem>('/sources', cleanParams({ ...f })),
  get: (idOrSlug: string) => getData<Source>(`/sources/${idOrSlug}`),
  create: (body: SourceInput) => postData<Source>('/sources', body),
  update: (id: string, body: SourceInput) => patchData<Source>(`/sources/${id}`, body),
  remove: (id: string) => del(`/sources/${id}`),
};

export interface ReviewInput { decision: 'RETURN' | 'ACCEPT'; comment: string; score?: number }
export interface WorkFilters { status?: WorkStatus; studentId?: string; sourceId?: string; page?: number; pageSize?: number }

export const analysisService = {
  template: (type: SourceType) => getData<AnalysisQuestion[]>(`/source-analyses/template/${type}`),
  list: (f: WorkFilters = {}) => getPage<SourceAnalysis>('/source-analyses', cleanParams({ ...f })),
  get: (id: string) => getData<SourceAnalysis>(`/source-analyses/${id}`),
  create: (sourceId: string) => postData<SourceAnalysis>('/source-analyses', { sourceId, answers: {} }),
  save: (id: string, answers: Record<string, string>) => patchData<SourceAnalysis>(`/source-analyses/${id}`, { answers }),
  submit: (id: string) => postData<SourceAnalysis>(`/source-analyses/${id}/submit`),
  review: (id: string, body: ReviewInput) => postData<SourceAnalysis>(`/source-analyses/${id}/review`, body),
  remove: (id: string) => del(`/source-analyses/${id}`),
};

export interface ComparisonInput {
  title: string; sourceIds: string[]; similarities?: string; differences?: string; evidence?: string;
  conclusion?: string; teachingUse?: string; notes?: Record<string, string>;
}

export const comparisonService = {
  list: (f: WorkFilters = {}) => getPage<Comparison>('/source-comparisons', cleanParams({ ...f })),
  get: (id: string) => getData<Comparison>(`/source-comparisons/${id}`),
  create: (body: ComparisonInput) => postData<Comparison>('/source-comparisons', body),
  update: (id: string, body: Partial<ComparisonInput>) => patchData<Comparison>(`/source-comparisons/${id}`, body),
  submit: (id: string) => postData<Comparison>(`/source-comparisons/${id}/submit`),
  review: (id: string, body: ReviewInput) => postData<Comparison>(`/source-comparisons/${id}/review`, body),
  remove: (id: string) => del(`/source-comparisons/${id}`),
};

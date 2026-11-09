import type {
  LessonListItem, LessonPlan, Test, TestAttemptResult, TestListItem, TestOption, TestResultRow, WorkStatus,
} from '@/types/api';
import { cleanParams, del, getData, getPage, patchData, postData } from './api';

export type LessonInput = Partial<
  Omit<LessonPlan, 'id' | 'author' | 'reviewedBy' | 'versions' | 'resources'>
> & {
  resources?: { sourceId: string | null; virtualObjectId: string | null; purpose: string }[];
  versionNote?: string;
};

export interface LessonReviewInput { decision: 'RETURN' | 'ACCEPT'; comment: string; score?: number }

export const lessonsService = {
  list: (f: { status?: WorkStatus; authorId?: string; q?: string; page?: number; pageSize?: number } = {}) =>
    getPage<LessonListItem>('/lessons', cleanParams({ pageSize: 50, ...f })),
  get: (id: string) => getData<LessonPlan>(`/lessons/${id}`),
  /** Tahrirlash uchun: tarjima qilinmagan (metod nomlari o'zbekcha qiymatda) yozuv */
  getBase: (id: string) => getData<LessonPlan>(`/lessons/${id}`, undefined, { 'X-Lang': 'uz' }),
  version: (id: string, v: number) =>
    getData<{ version: number; snapshot: Record<string, unknown>; note: string | null; createdAt: string }>(`/lessons/${id}/versions/${v}`),
  create: (body: LessonInput) => postData<LessonPlan>('/lessons', body),
  update: (id: string, body: LessonInput) => patchData<LessonPlan>(`/lessons/${id}`, body),
  submit: (id: string) => postData<LessonPlan>(`/lessons/${id}/submit`),
  review: (id: string, body: LessonReviewInput) => postData<LessonPlan>(`/lessons/${id}/review`, body),
  remove: (id: string) => del(`/lessons/${id}`),
};

export interface TestInput {
  title: string; description?: string | null; sourceId?: string | null; fileId: string;
  answerKey: TestOption[]; isPublished: boolean;
}

/** Topshiriqlar: fayl asosidagi testlar */
export const testsService = {
  list: () => getData<TestListItem[]>('/tests'),
  get: (id: string) => getData<Test>(`/tests/${id}`),
  create: (body: TestInput) => postData<Test>('/tests', body),
  update: (id: string, body: Partial<TestInput>) => patchData<Test>(`/tests/${id}`, body),
  remove: (id: string) => del(`/tests/${id}`),
  submit: (id: string, answers: (TestOption | null)[]) => postData<TestAttemptResult>(`/tests/${id}/attempt`, { answers }),
  results: (id: string) => getData<TestResultRow[]>(`/tests/${id}/results`),
  resetAttempt: (id: string, attemptId: string) => del(`/tests/${id}/attempts/${attemptId}`),
};

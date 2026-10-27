import type {
  Assignment, AssignmentStatus, AssignmentType, Diagnostic, DiagnosticAttempt, LessonListItem, LessonPlan,
  ReviewItem, Rubric, SimulatorAnswer, SimulatorConfig, Submission, SubmissionStatus, WorkStatus,
} from '@/types/api';
import { cleanParams, del, getData, getPage, patchData, postData, putData } from './api';

export interface AssignmentInput {
  title: string; scenario: string; instructions?: string | null; type: AssignmentType; status: AssignmentStatus;
  dueDate?: string | null; maxScore: number; rubricId?: string | null; evidenceKind: string;
  groupIds: string[]; sourceIds: string[]; virtualObjectIds: string[];
  simulator?: SimulatorConfig | null;
}
export interface FeedbackInput {
  decision: 'COMMENT' | 'RETURN_FOR_REVISION' | 'GRADE'; comment: string;
  criterionScores?: { criterionId: string; score: number }[]; totalScore?: number;
}
export interface RubricInput {
  title: string; description?: string | null;
  criteria: { title: string; description?: string | null; maxScore: number; componentId?: string | null }[];
}

export const assignmentsService = {
  list: (f: { status?: AssignmentStatus; type?: AssignmentType; q?: string; page?: number; pageSize?: number } = {}) =>
    getPage<Assignment>('/assignments', cleanParams({ pageSize: 50, ...f })),
  get: (id: string) => getData<Assignment>(`/assignments/${id}`),
  create: (body: AssignmentInput) => postData<Assignment>('/assignments', body),
  update: (id: string, body: Partial<AssignmentInput>) => patchData<Assignment>(`/assignments/${id}`, body),
  remove: (id: string) => del(`/assignments/${id}`),
  saveSubmission: (id: string, body: { content: string; lessonPlanId?: string | null; simulatorAnswer?: SimulatorAnswer | null }) =>
    putData<Submission>(`/assignments/${id}/submission`, body),
  submit: (id: string) => postData<Submission>(`/assignments/${id}/submission/submit`),
  rubrics: () => getData<Rubric[]>('/assignments/rubrics'),
  createRubric: (body: RubricInput) => postData<Rubric>('/assignments/rubrics', body),
  updateRubric: (id: string, body: RubricInput) => putData<Rubric>(`/assignments/rubrics/${id}`, body),
  deleteRubric: (id: string) => del(`/assignments/rubrics/${id}`),
};

export const submissionsService = {
  list: (f: { assignmentId?: string; studentId?: string; status?: SubmissionStatus; page?: number; pageSize?: number } = {}) =>
    getPage<Submission>('/submissions', cleanParams({ pageSize: 50, ...f })),
  get: (id: string) => getData<Submission>(`/submissions/${id}`),
  startReview: (id: string) => postData<Submission>(`/submissions/${id}/start-review`),
  feedback: (id: string, body: FeedbackInput) => postData<Submission>(`/submissions/${id}/feedback`, body),
};

export type LessonInput = Partial<
  Omit<LessonPlan, 'id' | 'author' | 'reviewedBy' | 'assignment' | 'versions' | 'resources'>
> & {
  resources?: { sourceId: string | null; virtualObjectId: string | null; purpose: string }[];
  versionNote?: string;
};

export interface LessonReviewInput {
  decision: 'RETURN' | 'ACCEPT'; comment: string; score?: number; reflectiveScore?: number;
  rubricId?: string; criterionScores?: { criterionId: string; score: number; comment?: string }[];
}

export const lessonsService = {
  list: (f: { status?: WorkStatus; authorId?: string; q?: string; page?: number; pageSize?: number } = {}) =>
    getPage<LessonListItem>('/lessons', cleanParams({ pageSize: 50, ...f })),
  get: (id: string) => getData<LessonPlan>(`/lessons/${id}`),
  version: (id: string, v: number) =>
    getData<{ version: number; snapshot: Record<string, unknown>; note: string | null; createdAt: string }>(`/lessons/${id}/versions/${v}`),
  create: (body: LessonInput) => postData<LessonPlan>('/lessons', body),
  update: (id: string, body: LessonInput) => patchData<LessonPlan>(`/lessons/${id}`, body),
  submit: (id: string) => postData<LessonPlan>(`/lessons/${id}/submit`),
  review: (id: string, body: LessonReviewInput) => postData<LessonPlan>(`/lessons/${id}/review`, body),
  remove: (id: string) => del(`/lessons/${id}`),
};

export interface DiagnosticInput {
  title: string; description?: string | null; stage: string; kind: string; isActive: boolean; timeLimitMinutes?: number | null;
  questions: {
    componentId: string; type: string; prompt: string; options?: { id: string; text: string }[] | null;
    correct?: string[] | null; points: number;
  }[];
}
export interface AttemptRow {
  id: string; status: string; submittedAt: string | null; autoScore: number | null; maxAutoScore: number | null;
  student: { id: string; fullName: string };
}

export const diagnosticsService = {
  list: () => getData<Diagnostic[]>('/diagnostics'),
  get: (id: string) => getData<Diagnostic>(`/diagnostics/${id}`),
  create: (body: DiagnosticInput) => postData<Diagnostic>('/diagnostics', body),
  update: (id: string, body: Partial<DiagnosticInput>) => patchData<Diagnostic>(`/diagnostics/${id}`, body),
  remove: (id: string) => del(`/diagnostics/${id}`),
  attempts: (id: string) => getData<AttemptRow[]>(`/diagnostics/${id}/attempts`),
  start: (id: string) => postData<{ id: string }>(`/diagnostics/${id}/attempts`),
  attempt: (attemptId: string) => getData<DiagnosticAttempt>(`/diagnostics/attempts/${attemptId}`),
  saveAnswers: (attemptId: string, answers: Record<string, unknown>) =>
    putData(`/diagnostics/attempts/${attemptId}/responses`, { answers }),
  submit: (attemptId: string) => postData(`/diagnostics/attempts/${attemptId}/submit`),
  grade: (attemptId: string, grades: { questionId: string; score: number; comment?: string }[]) =>
    postData(`/diagnostics/attempts/${attemptId}/grade`, { grades }),
};

export const reviewService = { queue: () => getData<ReviewItem[]>('/analytics/review-queue') };

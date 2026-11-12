import { getData } from './api';

export interface ProgressAttempt { correctCount: number; total: number; percent: number; submittedAt: string }
export interface ProgressTest { id: string; title: string; questionCount: number; attempt: ProgressAttempt | null }
export interface Progress {
  summary: { testsTotal: number; testsDone: number; averagePercent: number | null };
  topics: { id: string; title: string; slug: string; bookLabel: string | null; tests: ProgressTest[] }[];
  otherTests: ProgressTest[];
  groups: { id: string; name: string }[];
}

/** Öquv yöli: mavzular tartibida testlar va natijalar */
export const progressService = {
  mine: () => getData<Progress>('/progress/me'),
  student: (studentId: string) => getData<Progress>(`/progress/students/${studentId}`),
};

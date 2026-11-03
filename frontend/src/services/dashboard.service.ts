import type { ReviewItem } from '@/types/api';
import { getData } from './api';

export interface StudentDashboard {
  role: 'STUDENT';
  pendingTests: { id: string; title: string; questionCount: number; createdAt: string; source: { title: string; slug: string } | null }[];
  recentResults: {
    id: string; title: string; questionCount: number; source: { title: string; slug: string } | null;
    attempt: { percent: number; correctCount: number; total: number; submittedAt: string };
  }[];
  testStats: { total: number; done: number; averagePercent: number | null };
  recentActivity: { id: string; type: string; title: string; updatedAt: string }[];
}
export interface TeacherDashboardData {
  groups: { id: string; name: string; kind: string; members: number }[];
  totalStudents: number;
  pendingReviewCount: number;
  pendingReviews: ReviewItem[];
  tests: { id: string; title: string; isPublished: boolean; questionCount: number; attemptCount: number }[];
}
export interface TeacherDashboard extends TeacherDashboardData { role: 'TEACHER' }
export interface AdminDashboard {
  role: 'ADMIN';
  users: { byRole: Record<string, number>; byStatus: Record<string, number> };
  virtualObjects: Record<string, number>;
  counts: { topics: number; tests: number; testAttempts: number; lessonPlans: number };
  activity: { day: string; count: number }[];
  recentAudit: { id: string; action: string; entity: string; createdAt: string; actor: { fullName: string } | null }[];
  teaching: TeacherDashboardData;
}
export type Dashboard = StudentDashboard | TeacherDashboard | AdminDashboard;

export const dashboardService = { get: () => getData<Dashboard>('/analytics/dashboard') };

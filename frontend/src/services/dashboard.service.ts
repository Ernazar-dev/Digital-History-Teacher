import type { AssignmentType } from '@/types/api';
import { getData } from './api';

export interface StudentDashboard {
  role: 'STUDENT';
  activeAssignments: { id: string; title: string; type: AssignmentType; dueDate: string | null; status: string }[];
  upcomingDeadlines: { id: string; title: string; dueDate: string | null; status: string }[];
  assignmentStats: { total: number; graded: number; active: number };
  recentActivity: { id: string; type: string; title: string; updatedAt: string }[];
  recentFeedback: {
    id: string; comment: string; decision: string; createdAt: string; submission: { assignment: { id: string; title: string } };
  }[];
  portfolio: { total: number; byType: Record<string, number> };
  competence: {
    overall: number | null; level: { name: string } | null;
    components: { code: string; name: string; score: number | null; level: { name: string } | null }[];
  };
}
export interface TeacherDashboardData {
  groups: { id: string; name: string; kind: string; members: number; averageOverall: number | null; assessedStudents: number }[];
  totalStudents: number;
  pendingReviewCount: number;
  pendingReviews: { kind: string; id: string; title: string; student: { fullName: string }; submittedAt: string | null }[];
  assignments: { id: string; title: string; status: string; dueDate: string | null; counts: Record<string, number>; total: number }[];
}
export interface TeacherDashboard extends TeacherDashboardData { role: 'TEACHER' }
export interface AdminDashboard {
  role: 'ADMIN';
  users: { byRole: Record<string, number>; byStatus: Record<string, number> };
  sources: Record<string, number>;
  virtualObjects: Record<string, number>;
  counts: { assignments: number; submissions: number; diagnosticAttempts: number; lessonPlans: number; sourceAnalyses: number };
  activity: { day: string; count: number }[];
  recentAudit: { id: string; action: string; entity: string; createdAt: string; actor: { fullName: string } | null }[];
  teaching: TeacherDashboardData;
}
export type Dashboard = StudentDashboard | TeacherDashboard | AdminDashboard;

export const dashboardService = { get: () => getData<Dashboard>('/analytics/dashboard') };

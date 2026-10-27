import { getData } from './api';

export interface Achievement { code: string; title: string; description: string; earned: boolean; current: number; target: number }
export interface TrajectoryStep { priority: number; kind: 'RETURNED' | 'ASSIGNMENT' | 'DIAGNOSTIC' | 'COMPONENT'; title: string; reason: string; link: string; due?: string | null }
export interface Progress {
  points: number; workPoints: number; reviewedCount: number;
  level: { index: number; name: string; points: number; nextName: string | null; nextAt: number | null };
  achievements: Achievement[]; trajectory: TrajectoryStep[]; groups: { id: string; name: string }[];
}
export interface Leaderboard {
  group: { id: string; name: string };
  rows: { studentId: string; name: string; isMe: boolean; points: number; level: string; achievements: number; rank: number }[];
}

/** O'yin elementlari (ball, daraja, yutuqlar, reyting) va individual o'quv traektoriyasi */
export const progressService = {
  mine: () => getData<Progress>('/progress/me'),
  student: (studentId: string) => getData<Progress>(`/progress/students/${studentId}`),
  leaderboard: (groupId: string) => getData<Leaderboard>(`/progress/groups/${groupId}/leaderboard`),
};

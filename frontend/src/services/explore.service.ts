import type { AssignmentType, ObjectType, Period, SourceType, WorkStatus } from '@/types/api';
import { cleanParams, getData } from './api';

export interface SearchResults {
  sources: { id: string; title: string; slug: string; type: SourceType; summary: string; dateLabel: string | null; period: { name: string } | null }[];
  objects: { id: string; title: string; slug: string; type: ObjectType; location: string | null; thumbnailUrl: string | null }[];
  assignments: { id: string; title: string; type: AssignmentType; dueDate: string | null }[];
  lessons: { id: string; title: string; topic: string; gradeLevel: string; status: WorkStatus; author: { fullName: string } }[];
  periods: Period[];
  topics: { id: string; name: string; period: { name: string } | null }[];
}
export interface MapFeature {
  kind: 'source' | 'object'; id: string; title: string; slug: string; type: string; latitude: number; longitude: number;
  dateLabel?: string | null; location?: string | null; thumbnailUrl?: string | null; period: { id: string; name: string } | null;
}
export interface TimelinePeriod extends Period {
  sources: { id: string; title: string; slug: string; type: SourceType; dateLabel: string | null; yearFrom: number | null; yearTo: number | null }[];
  virtualObjects: { id: string; title: string; slug: string; type: ObjectType; periodLabel: string | null; thumbnailUrl?: string | null }[];
  topics: { id: string; name: string }[];
  /** Landing kartasi uchun muqova rasmi (obyekt yoki manba rasmi) */
  coverUrl?: string | null;
}

export const exploreService = {
  search: (q: string, types: string[] = [], periodId?: string) =>
    getData<SearchResults>('/explore/search', cleanParams({ q, types: types.join(','), periodId })),
  map: (periodId?: string) =>
    getData<{ features: MapFeature[]; withoutCoordinates: number }>('/explore/map', cleanParams({ periodId })),
  timeline: () => getData<TimelinePeriod[]>('/explore/timeline'),
};

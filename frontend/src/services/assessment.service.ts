import { http } from '@/lib/http';
import type { AssessmentConfig, AssessmentStage, CompetenceProfile, Dynamics, EvidenceKind, GroupKind, IndicatorLevel } from '@/types/api';
import { cleanParams, del, getData, patchData, postData, putData } from './api';

export interface GroupSummary {
  group: { id: string; name: string; kind: GroupKind };
  components: { code: string; name: string }[];
  rows: {
    student: { id: string; fullName: string; username: string; email: string | null };
    initial: number | null; final: number | null; overall: number | null; level: { name: string } | null;
    components: Record<string, number | null>;
  }[];
}
export interface ExperimentSummary {
  disclaimer: string;
  groups: {
    kind: 'EXPERIMENTAL' | 'CONTROL'; n: number; nWithInitial: number; nWithFinal: number;
    initialMean: number | null; finalMean: number | null; groups: { id: string; name: string; size: number }[];
    components: { code: string; name: string; initialMean: number | null; finalMean: number | null }[];
  }[];
}
export interface LevelInput { code: string; name: string; description: string; minPercent: number; maxPercent: number }

export const assessmentsService = {
  config: () => getData<AssessmentConfig>('/assessments/config'),
  myProfile: (stage?: AssessmentStage) => getData<CompetenceProfile>('/assessments/me/profile', cleanParams({ stage })),
  profile: (studentId: string, stage?: AssessmentStage) =>
    getData<CompetenceProfile>(`/assessments/students/${studentId}/profile`, cleanParams({ stage })),
  dynamics: (studentId: string) => getData<Dynamics>(`/assessments/students/${studentId}/dynamics`),
  expertRecord: (body: {
    studentId: string; componentId: string; stage: AssessmentStage; evidenceKind: EvidenceKind; score: number; note?: string;
  }) => postData('/assessments/records', body),
  groupSummary: (groupId: string) => getData<GroupSummary>(`/assessments/groups/${groupId}/summary`),
  experiment: () => getData<ExperimentSummary>('/assessments/experiment'),
  downloadGroupCsv: async (groupId: string, name: string) => {
    const res = await http.get(`/assessments/groups/${groupId}/export.csv`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
  updateComponent: (id: string, body: { name?: string; definition?: string; methods?: string | null; weight?: number }) =>
    patchData(`/assessments/components/${id}`, body),
  replaceWeights: (id: string, weights: { evidenceKind: EvidenceKind; weight: number }[]) =>
    putData(`/assessments/components/${id}/weights`, { weights }),
  addCriterion: (componentId: string, body: { title: string; description?: string }) =>
    postData(`/assessments/components/${componentId}/criteria`, body),
  deleteCriterion: (id: string) => del(`/assessments/criteria/${id}`),
  addIndicator: (criterionId: string, body: { title: string }) => postData(`/assessments/criteria/${criterionId}/indicators`, body),
  updateIndicator: (id: string, body: { title?: string; lowDescriptor?: string; mediumDescriptor?: string; highDescriptor?: string }) =>
    patchData(`/assessments/indicators/${id}`, body),
  rateIndicators: (body: {
    studentId: string; componentId: string; stage: AssessmentStage; ratings: { indicatorId: string; level: IndicatorLevel }[]; note?: string;
  }) => postData('/assessments/indicator-ratings', body),
  deleteIndicator: (id: string) => del(`/assessments/indicators/${id}`),
  replaceLevels: (levels: LevelInput[]) => putData('/assessments/levels', levels),
};

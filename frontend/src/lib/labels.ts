/** Enum qiymatlarining o'zbekcha nomlari va rang belgilari — bitta joyda */
import type {
  GroupKind, ObjectType, PortfolioItemType, Provider, PublicationStatus, Role, SourceType, TaskKind, UserStatus, WorkStatus,
} from '@/types/api';

export const ROLE: Record<Role, string> = { ADMIN: 'Administrator', TEACHER: 'O‘qituvchi', STUDENT: 'Talaba' };
export const USER_STATUS: Record<UserStatus, { label: string; color: string }> = {
  PENDING: { label: 'Tasdiq kutilmoqda', color: 'gold' },
  ACTIVE: { label: 'Faol', color: 'green' },
  BLOCKED: { label: 'Bloklangan', color: 'red' },
};
export const SOURCE_TYPE: Record<SourceType, string> = {
  WRITTEN: 'Yozma manba', VISUAL: 'Vizual manba', MAP: 'Xarita', AUDIO: 'Audio', VIDEO: 'Video',
  ARCHAEOLOGICAL: 'Arxeologik manba',
};
export const PUBLICATION: Record<PublicationStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Qoralama', color: 'default' },
  REVIEWED: { label: 'Tekshirilgan', color: 'blue' },
  PUBLISHED: { label: 'Nashr etilgan', color: 'green' },
};
export const WORK_STATUS: Record<WorkStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Qoralama', color: 'default' },
  SUBMITTED: { label: 'Topshirilgan', color: 'blue' },
  UNDER_REVIEW: { label: 'Tekshirilmoqda', color: 'purple' },
  RETURNED: { label: 'Qayta ishlashga qaytarilgan', color: 'orange' },
  REVIEWED: { label: 'Baholangan', color: 'green' },
};
export const OBJECT_TYPE: Record<ObjectType, string> = { MODEL_3D: '3D model', TOUR_360: '360° sayohat', VIRTUAL_MUSEUM: 'Virtual muzey', OTHER: 'Boshqa' };
export const PROVIDER: Record<Provider, string> = { SKETCHFAB: 'Sketchfab', UZBEKISTAN360: 'Uzbekistan360', OTHER: 'Boshqa' };
export const TASK_KIND: Record<TaskKind, string> = {
  OBSERVATION: 'Kuzatuv savoli', EVIDENCE: 'Tarixiy dalillarni aniqlash', COMPARISON: 'Manba bilan taqqoslash',
  DISCUSSION: 'Guruhli muhokama', LESSON_APPLICATION: 'Darsda qo‘llash', MATERIAL_CREATION: 'Metodik material yaratish',
};
export const GROUP_KIND: Record<GroupKind, { label: string; color: string }> = {
  REGULAR: { label: 'Oddiy guruh', color: 'default' },
  EXPERIMENTAL: { label: 'Tajriba guruhi', color: 'geekblue' },
  CONTROL: { label: 'Nazorat guruhi', color: 'volcano' },
};
export const PORTFOLIO_TYPE: Record<PortfolioItemType, string> = {
  ASSIGNMENT: 'Topshiriq', SOURCE_ANALYSIS: 'Manba tahlili', SOURCE_COMPARISON: 'Manbalar taqqoslanishi',
  LESSON_PLAN: 'Dars ishlanmasi', VIRTUAL_WORK: 'Virtual obyekt asosidagi ish', DIAGNOSTIC: 'Diagnostika',
  SELF_ASSESSMENT: 'O‘zini o‘zi baholash', REFLECTION: 'Refleksiv yozuv', UPLOAD: 'Yuklangan fayl',
};
export const toOptions = <K extends string>(map: Record<K, string | { label: string }>) =>
  (Object.entries(map) as [K, string | { label: string }][]).map(([value, v]) => ({
    value,
    label: typeof v === 'string' ? v : v.label,
  }));

/**
 * Enum qiymatlarining nomlari (joriy tilda) va rang belgilari — bitta joyda.
 * Nomlar o'qilgan paytda i18n'dan olinadi, shuning uchun til almashganda yangilanadi.
 */
import i18n from '@/i18n';
import type {
  GroupKind, ObjectType, PortfolioItemType, Provider, PublicationStatus, Role, SourceType, TaskKind, UserStatus, WorkStatus,
} from '@/types/api';

const tr = (group: string, key: string) => i18n.t(`labels.${group}.${key}`);

/** { KEY: 'Nom' } ko'rinishidagi xarita; qiymat har o'qilganda joriy tilda hisoblanadi */
const names = <K extends string>(group: string, keys: readonly K[]): Record<K, string> => {
  const out = {} as Record<K, string>;
  for (const k of keys) Object.defineProperty(out, k, { enumerable: true, get: () => tr(group, k) });
  return out;
};

/** { KEY: { label, color } } ko'rinishidagi xarita */
const tags = <K extends string>(group: string, colors: Record<K, string>): Record<K, { label: string; color: string }> => {
  const out = {} as Record<K, { label: string; color: string }>;
  for (const k of Object.keys(colors) as K[]) {
    Object.defineProperty(out, k, {
      enumerable: true,
      get: () => ({ label: tr(group, k), color: colors[k] }),
    });
  }
  return out;
};

export const ROLE: Record<Role, string> = names('role', ['ADMIN', 'TEACHER', 'STUDENT']);
export const USER_STATUS = tags<UserStatus>('userStatus', { PENDING: 'gold', ACTIVE: 'green', BLOCKED: 'red' });
export const SOURCE_TYPE: Record<SourceType, string> = names('sourceType', ['WRITTEN', 'VISUAL', 'MAP', 'AUDIO', 'VIDEO', 'ARCHAEOLOGICAL']);
export const PUBLICATION = tags<PublicationStatus>('publication', { DRAFT: 'default', REVIEWED: 'blue', PUBLISHED: 'green' });
export const WORK_STATUS = tags<WorkStatus>('workStatus', {
  DRAFT: 'default', SUBMITTED: 'blue', UNDER_REVIEW: 'purple', RETURNED: 'orange', REVIEWED: 'green',
});
export const OBJECT_TYPE: Record<ObjectType, string> = names('objectType', ['MODEL_3D', 'TOUR_360', 'VIRTUAL_MUSEUM', 'OTHER']);
export const PROVIDER: Record<Provider, string> = names('provider', ['SKETCHFAB', 'UZBEKISTAN360', 'OTHER']);
export const TASK_KIND: Record<TaskKind, string> = names('taskKind', [
  'OBSERVATION', 'EVIDENCE', 'COMPARISON', 'DISCUSSION', 'LESSON_APPLICATION', 'MATERIAL_CREATION',
]);
export const GROUP_KIND = tags<GroupKind>('groupKind', { REGULAR: 'default', EXPERIMENTAL: 'geekblue', CONTROL: 'volcano' });
export const PORTFOLIO_TYPE: Record<PortfolioItemType, string> = names('portfolioType', [
  'ASSIGNMENT', 'SOURCE_ANALYSIS', 'SOURCE_COMPARISON', 'LESSON_PLAN', 'VIRTUAL_WORK', 'DIAGNOSTIC', 'SELF_ASSESSMENT', 'REFLECTION', 'UPLOAD',
]);
export const toOptions = <K extends string>(map: Record<K, string | { label: string }>) =>
  (Object.entries(map) as [K, string | { label: string }][]).map(([value, v]) => ({
    value,
    label: typeof v === 'string' ? v : v.label,
  }));

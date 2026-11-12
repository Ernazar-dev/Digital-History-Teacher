import {
  BankOutlined, BookOutlined, BulbOutlined, CheckSquareOutlined, DashboardOutlined,
  ContactsOutlined, GlobalOutlined, InfoCircleOutlined, MailOutlined, QuestionCircleOutlined, ReadOutlined, RiseOutlined,
  SettingOutlined, TeamOutlined, UserOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import i18n from '@/i18n';
import type { Role } from '@/types/api';

export interface NavItem { key: string; label: string; icon?: ReactNode; roles?: Role[]; children?: NavItem[]; section?: string }

const ALL: Role[] = ['ADMIN', 'TEACHER', 'STUDENT'];
const STAFF: Role[] = ['ADMIN', 'TEACHER'];

/** `label` va `section` — i18n kalitlari; oʻqilganda joriy tilda hisoblanadi */
const navItem = (i: NavItem): NavItem => {
  const o: NavItem = { ...i };
  Object.defineProperty(o, 'label', { enumerable: true, get: () => i18n.t(i.label) });
  if (i.section) Object.defineProperty(o, 'section', { enumerable: true, get: () => i18n.t(i.section as string) });
  return o;
};

/** Oʻqituvchi/administrator sidebari — boʻlimlar ma'no boʻyicha guruhlangan (section) */
const NAV_DEFS: NavItem[] = [
  { key: '/app', label: 'nav.home', icon: <DashboardOutlined />, roles: ALL },
  { key: '/app/guide', label: 'staffNav.guide', icon: <QuestionCircleOutlined />, roles: STAFF },

  { key: '/app/sources', label: 'nav.sources', icon: <BookOutlined />, roles: ALL, section: 'staffNav.content' },
  { key: '/app/museum', label: 'nav.museum', icon: <BankOutlined />, roles: ALL, section: 'staffNav.content' },
  { key: '/app/explore', label: 'nav.explore', icon: <GlobalOutlined />, roles: ALL, section: 'staffNav.content' },
  { key: '/app/methodology', label: 'nav.methodology', icon: <BulbOutlined />, roles: ALL, section: 'staffNav.content' },

  { key: '/app/lessons', label: 'footer.lessonBuilder', icon: <ReadOutlined />, roles: ALL, section: 'staffNav.process' },
  { key: '/app/assignments', label: 'staffNav.assignments', icon: <CheckSquareOutlined />, roles: ALL, section: 'nav.assessment' },

  { key: '/app/admin/users', label: 'staffNav.users', icon: <UserOutlined />, roles: ['ADMIN'], section: 'staffNav.system' },
  { key: '/app/admin/messages', label: 'staffNav.messages', icon: <MailOutlined />, roles: ['ADMIN'], section: 'staffNav.system' },
  { key: '/app/groups', label: 'staffNav.groups', icon: <TeamOutlined />, roles: STAFF, section: 'staffNav.system' },
  { key: '/app/admin/settings', label: 'staffNav.settings', icon: <SettingOutlined />, roles: ['ADMIN'], section: 'staffNav.system' },
];
export const NAV: NavItem[] = NAV_DEFS.map(navItem);

/**
 * Talaba va mehmon uchun yuqori navbar. `open` — mehmon ham koʻra oladigan boʻlim;
 * qolganlari ham koʻrinadi, lekin mehmonga kirish taklifi chiqadi (qulf belgisi bilan).
 */
/** `label` va `desc` — i18n kalitlari (src/i18n/locales), koʻrsatishda t() orqali tarjima qilinadi */
export interface TopNavItem { to: string; label: string; icon: ReactNode; desc?: string; open?: boolean }
export interface TopNavGroup { label: string; items: TopNavItem[] }
export type TopNavEntry = TopNavItem | TopNavGroup;

export const isNavGroup = (e: TopNavEntry): e is TopNavGroup => 'items' in e;

/** Bir xil yoʻnalishdagi boʻlimlar pastga ochiladigan guruhlarga jamlangan */
export const TOP_NAV: TopNavEntry[] = [
  { to: '/app', label: 'nav.home', icon: <DashboardOutlined />, open: true },
  { to: '/app/sources', label: 'nav.sources', icon: <BookOutlined />, desc: 'nav.sourcesDesc', open: true },
  {
    label: 'nav.museumAndMap',
    items: [
      { to: '/app/museum', label: 'nav.museum', icon: <BankOutlined />, desc: 'nav.museumDesc', open: true },
      { to: '/app/explore', label: 'nav.explore', icon: <GlobalOutlined />, desc: 'nav.exploreDesc', open: true },
    ],
  },
  { to: '/app/lessons', label: 'nav.lessons', icon: <ReadOutlined />, desc: 'nav.lessonsDesc' },
  {
    label: 'nav.assessment',
    items: [
      { to: '/app/assignments', label: 'nav.assignments', icon: <CheckSquareOutlined />, desc: 'nav.assignmentsDesc' },
      { to: '/app?tab=yol', label: 'nav.results', icon: <RiseOutlined />, desc: 'nav.resultsDesc' },
    ],
  },
  { to: '/app/methodology', label: 'nav.methodology', icon: <BulbOutlined />, open: true },
  { to: '/about', label: 'nav.about', icon: <InfoCircleOutlined />, open: true },
  { to: '/author', label: 'nav.author', icon: <ContactsOutlined />, open: true },
];

/** Barcha bandlar tekis roʻyxatda (faol bandni aniqlash va mobil menyu uchun) */
export const TOP_NAV_ITEMS: TopNavItem[] = TOP_NAV.flatMap((e) => (isNavGroup(e) ? e.items : [e]));

export const navFor = (role: Role): NavItem[] =>
  NAV.filter((i) => !i.roles || i.roles.includes(role));

/** Breadcrumb uchun yoʻl segmentlari nomlari */
const SEGMENT_KEYS: Record<string, string> = {
  app: 'nav.home', sources: 'nav.sources', museum: 'nav.museum', explore: 'nav.explore', methodology: 'nav.methodology',
  lessons: 'footer.lessonBuilder', assignments: 'nav.assignments', portfolio: 'seg.portfolio', groups: 'staffNav.groups',
  admin: 'seg.admin', users: 'staffNav.users', objects: 'seg.objects', taxonomy: 'seg.taxonomy',
  settings: 'staffNav.settings', messages: 'seg.messages', new: 'seg.new', edit: 'seg.edit',
  search: 'nav.search', guide: 'staffNav.guide', profile: 'seg.profile',
  items: 'seg.items', students: 'seg.students', responses: 'seg.responses', progress: 'seg.progress',
};
export const SEGMENT_LABELS: Record<string, string> = (() => {
  const out: Record<string, string> = {};
  for (const [seg, key] of Object.entries(SEGMENT_KEYS)) Object.defineProperty(out, seg, { enumerable: true, get: () => i18n.t(key) });
  return out;
})();
export const segmentLabel = (seg: string) => (seg in SEGMENT_KEYS ? i18n.t(SEGMENT_KEYS[seg]) : i18n.t('staffNav.more'));

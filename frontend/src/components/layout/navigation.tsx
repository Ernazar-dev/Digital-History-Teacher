import {
  AimOutlined, AuditOutlined, BankOutlined, BookOutlined, CheckSquareOutlined, ClusterOutlined, CompassOutlined,
  DashboardOutlined, EditOutlined, ExperimentOutlined, FileSearchOutlined, FundOutlined, GlobalOutlined,
  HistoryOutlined, InfoCircleOutlined, QuestionCircleOutlined, ReadOutlined, SafetyOutlined, SettingOutlined, SolutionOutlined, TeamOutlined, UserOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';
import type { Role } from '@/types/api';

export interface NavItem { key: string; label: string; icon?: ReactNode; roles?: Role[]; children?: NavItem[]; section?: string }

const ALL: Role[] = ['ADMIN', 'TEACHER', 'STUDENT'];
const STAFF: Role[] = ['ADMIN', 'TEACHER'];

/** O'qituvchi/administrator sidebari — bo'limlar ma'no bo'yicha guruhlangan (section) */
export const NAV: NavItem[] = [
  { key: '/app', label: 'Bosh sahifa', icon: <DashboardOutlined />, roles: ALL },
  { key: '/app/guide', label: 'Qo‘llanma', icon: <QuestionCircleOutlined />, roles: STAFF },

  { key: '/app/sources', label: 'Manbalar kutubxonasi', icon: <BookOutlined />, roles: ALL, section: 'Kontent' },
  { key: '/app/museum', label: 'Virtual muzey', icon: <BankOutlined />, roles: ALL, section: 'Kontent' },
  { key: '/app/explore', label: 'Xarita va vaqt chizig‘i', icon: <GlobalOutlined />, roles: ALL, section: 'Kontent' },

  { key: '/app/analysis', label: 'Tahlil laboratoriyasi', icon: <FileSearchOutlined />, roles: ALL, section: 'O‘quv jarayoni' },
  { key: '/app/lessons', label: 'Dars konstruktori', icon: <ReadOutlined />, roles: ALL, section: 'O‘quv jarayoni' },
  { key: '/app/assignments', label: 'Topshiriqlar', icon: <CheckSquareOutlined />, roles: ALL, section: 'O‘quv jarayoni' },
  { key: '/app/diagnostics', label: 'Diagnostika', icon: <ExperimentOutlined />, roles: ALL, section: 'O‘quv jarayoni' },
  { key: '/app/competence', label: 'Kompetensiya', icon: <AimOutlined />, roles: ['STUDENT'], section: 'O‘quv jarayoni' },

  { key: '/app/review', label: 'Tekshiruv navbati', icon: <SolutionOutlined />, roles: STAFF, section: 'Talabalar' },
  { key: '/app/groups', label: 'Guruhlar', icon: <TeamOutlined />, roles: STAFF, section: 'Talabalar' },
  { key: '/app/rubrics', label: 'Rubrikalar', icon: <ClusterOutlined />, roles: STAFF, section: 'Talabalar' },
  { key: '/app/experiment', label: 'Natijalar', icon: <FundOutlined />, roles: STAFF, section: 'Talabalar' },
  // Administrator sahifalari yig'iladigan papkasiz — ma'nosi bo'yicha ikki ochiq bo'limda
  { key: '/app/admin/sources', label: 'Manbalarni tahrirlash', icon: <EditOutlined />, roles: ['ADMIN'], section: 'Kontentni boshqarish' },
  { key: '/app/admin/objects', label: 'Virtual obyektlar', icon: <CompassOutlined />, roles: ['ADMIN'], section: 'Kontentni boshqarish' },
  { key: '/app/admin/taxonomy', label: 'Davrlar va mavzular', icon: <HistoryOutlined />, roles: ['ADMIN'], section: 'Kontentni boshqarish' },
  { key: '/app/admin/assessment', label: 'Baholash mezonlari', icon: <AimOutlined />, roles: ['ADMIN'], section: 'Kontentni boshqarish' },

  { key: '/app/admin/users', label: 'Foydalanuvchilar', icon: <UserOutlined />, roles: ['ADMIN'], section: 'Tizim' },
  { key: '/app/admin/settings', label: 'Sozlamalar', icon: <SettingOutlined />, roles: ['ADMIN'], section: 'Tizim' },
  { key: '/app/admin/roles', label: 'Rollar va ruxsatlar', icon: <SafetyOutlined />, roles: ['ADMIN'], section: 'Tizim' },
  { key: '/app/admin/audit', label: 'Audit log', icon: <AuditOutlined />, roles: ['ADMIN'], section: 'Tizim' },
];

/**
 * Talaba va mehmon uchun yuqori navbar. `open` — mehmon ham ko'ra oladigan bo'lim;
 * qolganlari ham ko'rinadi, lekin mehmonga kirish taklifi chiqadi (qulf belgisi bilan).
 */
export interface TopNavItem { to: string; label: string; icon: ReactNode; desc?: string; open?: boolean }
export interface TopNavGroup { label: string; items: TopNavItem[] }
export type TopNavEntry = TopNavItem | TopNavGroup;

export const isNavGroup = (e: TopNavEntry): e is TopNavGroup => 'items' in e;

/** Bir xil yo'nalishdagi bo'limlar pastga ochiladigan guruhlarga jamlangan */
export const TOP_NAV: TopNavEntry[] = [
  { to: '/app', label: 'Bosh sahifa', icon: <DashboardOutlined />, open: true },
  {
    label: 'Manbalar',
    items: [
      { to: '/app/sources', label: 'Manbalar kutubxonasi', icon: <BookOutlined />, desc: 'Yozma, vizual, kartografik va arxeologik manbalar', open: true },
      { to: '/app/analysis', label: 'Tahlil laboratoriyasi', icon: <FileSearchOutlined />, desc: 'Manbani tanqidiy tahlil qilish va taqqoslash' },
    ],
  },
  {
    label: 'Muzey va xarita',
    items: [
      { to: '/app/museum', label: 'Virtual muzey', icon: <BankOutlined />, desc: '3D modellar va 360° panoramalar', open: true },
      { to: '/app/explore', label: 'Xarita va vaqt chizig‘i', icon: <GlobalOutlined />, desc: 'Davrlar, joylar va voqealar bir joyda', open: true },
    ],
  },
  {
    label: 'Darslar',
    items: [
      { to: '/app/lessons', label: 'Dars konstruktori', icon: <ReadOutlined />, desc: 'Manba asosida interaktiv dars loyihalash' },
      { to: '/app/assignments', label: 'Topshiriqlar', icon: <CheckSquareOutlined />, desc: 'Metodik topshiriqlar va raqamli simulyator' },
    ],
  },
  {
    label: 'Baholash',
    items: [
      { to: '/app/diagnostics', label: 'Diagnostika', icon: <ExperimentOutlined />, desc: 'Boshlang‘ich, oraliq va yakuniy testlar' },
      { to: '/app/competence', label: 'Kompetensiya', icon: <AimOutlined />, desc: 'Metodik kompetensiya profili va o‘sish' },
    ],
  },
  { to: '/about', label: 'Platforma haqida', icon: <InfoCircleOutlined />, open: true },
];

/** Barcha bandlar tekis ro'yxatda (faol bandni aniqlash va mobil menyu uchun) */
export const TOP_NAV_ITEMS: TopNavItem[] = TOP_NAV.flatMap((e) => (isNavGroup(e) ? e.items : [e]));

export const navFor = (role: Role): NavItem[] =>
  NAV.filter((i) => !i.roles || i.roles.includes(role));

/** Breadcrumb uchun yo'l segmentlari nomlari */
export const SEGMENT_LABELS: Record<string, string> = {
  app: 'Bosh sahifa', sources: 'Manbalar', analysis: 'Tahlil laboratoriyasi', museum: 'Virtual muzey', explore: 'Xarita va vaqt chizig‘i',
  lessons: 'Dars konstruktori', assignments: 'Topshiriqlar', diagnostics: 'Diagnostika', competence: 'Kompetensiya',
  portfolio: 'Portfolio', review: 'Tekshiruv navbati', groups: 'Guruhlar', experiment: 'Eksperiment', rubrics: 'Rubrikalar',
  admin: 'Administrator', users: 'Foydalanuvchilar', objects: 'Virtual obyektlar', taxonomy: 'Davrlar va mavzular',
  assessment: 'Baholash mezonlari', settings: 'Sozlamalar', audit: 'Audit log', roles: 'Rollar va ruxsatlar', new: 'Yangi', edit: 'Tahrirlash',
  search: 'Qidiruv', guide: 'Qo‘llanma', profile: 'Profil', print: 'Chop etish',
  comparisons: 'Taqqoslash', submissions: 'Javoblar', attempts: 'Urinish', take: 'Bajarish', items: 'Element', students: 'Talaba',
  responses: 'Talaba ishi', progress: 'O‘quv yo‘li',
};

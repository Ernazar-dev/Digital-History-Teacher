import {
  BankOutlined, BookOutlined, BulbOutlined, CheckSquareOutlined, DashboardOutlined,
  GlobalOutlined, InfoCircleOutlined, QuestionCircleOutlined, ReadOutlined, RiseOutlined,
  SettingOutlined, TeamOutlined, UserOutlined,
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
  { key: '/app/methodology', label: 'Metodika', icon: <BulbOutlined />, roles: ALL, section: 'Kontent' },

  { key: '/app/lessons', label: 'Dars konstruktori', icon: <ReadOutlined />, roles: ALL, section: 'O‘quv jarayoni' },
  { key: '/app/assignments', label: 'Topshiriqlar (testlar)', icon: <CheckSquareOutlined />, roles: ALL, section: 'Baholash' },

  { key: '/app/admin/users', label: 'Foydalanuvchilar', icon: <UserOutlined />, roles: ['ADMIN'], section: 'Tizim' },
  { key: '/app/groups', label: 'Guruhlar', icon: <TeamOutlined />, roles: STAFF, section: 'Tizim' },
  { key: '/app/admin/settings', label: 'Sozlamalar', icon: <SettingOutlined />, roles: ['ADMIN'], section: 'Tizim' },
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
  { to: '/app/sources', label: 'Manbalar', icon: <BookOutlined />, desc: 'Mavzular: ma’ruza, taqdimot va video', open: true },
  {
    label: 'Muzey va xarita',
    items: [
      { to: '/app/museum', label: 'Virtual muzey', icon: <BankOutlined />, desc: '3D modellar va 360° panoramalar', open: true },
      { to: '/app/explore', label: 'Xarita va vaqt chizig‘i', icon: <GlobalOutlined />, desc: 'Davrlar, joylar va voqealar bir joyda', open: true },
    ],
  },
  { to: '/app/lessons', label: 'Darslar', icon: <ReadOutlined />, desc: 'Manba asosida dars loyihalash' },
  {
    label: 'Baholash',
    items: [
      { to: '/app/assignments', label: 'Topshiriqlar', icon: <CheckSquareOutlined />, desc: 'Testlar: faylni o‘qing, javobni belgilang' },
      { to: '/app?tab=yol', label: 'Mening natijalarim', icon: <RiseOutlined />, desc: 'Mavzular bo‘yicha test natijalari' },
    ],
  },
  { to: '/app/methodology', label: 'Metodika', icon: <BulbOutlined />, open: true },
  { to: '/about', label: 'Platforma haqida', icon: <InfoCircleOutlined />, open: true },
];

/** Barcha bandlar tekis ro'yxatda (faol bandni aniqlash va mobil menyu uchun) */
export const TOP_NAV_ITEMS: TopNavItem[] = TOP_NAV.flatMap((e) => (isNavGroup(e) ? e.items : [e]));

export const navFor = (role: Role): NavItem[] =>
  NAV.filter((i) => !i.roles || i.roles.includes(role));

/** Breadcrumb uchun yo'l segmentlari nomlari */
export const SEGMENT_LABELS: Record<string, string> = {
  app: 'Bosh sahifa', sources: 'Manbalar', museum: 'Virtual muzey', explore: 'Xarita va vaqt chizig‘i', methodology: 'Metodika',
  lessons: 'Dars konstruktori', assignments: 'Topshiriqlar', portfolio: 'Portfolio', groups: 'Guruhlar',
  admin: 'Administrator', users: 'Foydalanuvchilar', objects: 'Virtual obyektlar', taxonomy: 'Davrlar va mavzular',
  settings: 'Sozlamalar', new: 'Yangi', edit: 'Tahrirlash',
  search: 'Qidiruv', guide: 'Qo‘llanma', profile: 'Profil',
  items: 'Element', students: 'Talaba', responses: 'Talaba ishi', progress: 'O‘quv yo‘li',
};

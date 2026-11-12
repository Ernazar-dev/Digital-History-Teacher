import type { Role } from '@/types/api';

/**
 * Ruxsatlar matritsasi — backend marshrutlaridagi requireRole va access tekshiruvlarining
 * hujjatlashtirilgan koʻrinishi (manba: backend/src/modules/*.routes.ts, shared/utils/access.ts).
 * true — toʻliq; 'own' — faqat oʻziniki; 'group' — faqat oʻz guruhidagi talabalarniki; false — yoʻq.
 */
export type Access = boolean | 'own' | 'group';

export const PERMISSIONS: { area: string; action: string; roles: Record<Role, Access> }[] = [
  { area: 'Foydalanuvchilar', action: 'Roʻyxat, tasdiqlash, rol va holatni oʻzgartirish', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
  { area: 'Foydalanuvchilar', action: 'Faol talabalarni qidirish (guruhga qoʻshish uchun)', roles: { ADMIN: true, TEACHER: true, STUDENT: false } },
  { area: 'Guruhlar', action: 'Yaratish, tahrirlash, talaba biriktirish', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Manbalar (mavzular)', action: 'Mavzularni koʻrish', roles: { ADMIN: true, TEACHER: true, STUDENT: true } },
  { area: 'Manbalar (mavzular)', action: 'Mavzu qoʻshish, maʼruza/taqdimot/video yuklash', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Virtual obyektlar', action: 'Qoʻshish, tahrirlash, yashirish', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
  { area: 'Topshiriqlar (testlar)', action: 'Test yuklash, kalitni belgilash, tahrirlash', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Topshiriqlar (testlar)', action: 'Testni topshirish (bir marta)', roles: { ADMIN: false, TEACHER: false, STUDENT: 'own' } },
  { area: 'Topshiriqlar (testlar)', action: 'Natijalarni koʻrish, qayta topshirishga ruxsat', roles: { ADMIN: true, TEACHER: 'group', STUDENT: 'own' } },
  { area: 'Dars ishlanmalari', action: 'Yaratish, versiyalash, topshirish', roles: { ADMIN: 'own', TEACHER: 'own', STUDENT: 'own' } },
  { area: 'Dars ishlanmalari', action: 'Ekspertiza (baholash)', roles: { ADMIN: true, TEACHER: 'group', STUDENT: false } },
  { area: 'Portfolio', action: 'Koʻrish', roles: { ADMIN: true, TEACHER: 'group', STUDENT: 'own' } },
  { area: 'Tizim', action: 'Sozlamalar, davr/mavzular, audit log', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
];

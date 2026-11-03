import type { Role } from '@/types/api';

/**
 * Ruxsatlar matritsasi — backend marshrutlaridagi requireRole va access tekshiruvlarining
 * hujjatlashtirilgan ko'rinishi (manba: backend/src/modules/*.routes.ts, shared/utils/access.ts).
 * true — to'liq; 'own' — faqat o'ziniki; 'group' — faqat o'z guruhidagi talabalarniki; false — yo'q.
 */
export type Access = boolean | 'own' | 'group';

export const PERMISSIONS: { area: string; action: string; roles: Record<Role, Access> }[] = [
  { area: 'Foydalanuvchilar', action: 'Ro‘yxat, tasdiqlash, rol va holatni o‘zgartirish', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
  { area: 'Foydalanuvchilar', action: 'Faol talabalarni qidirish (guruhga qo‘shish uchun)', roles: { ADMIN: true, TEACHER: true, STUDENT: false } },
  { area: 'Guruhlar', action: 'Yaratish, tahrirlash, talaba biriktirish', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Manbalar (mavzular)', action: 'Mavzularni ko‘rish', roles: { ADMIN: true, TEACHER: true, STUDENT: true } },
  { area: 'Manbalar (mavzular)', action: 'Mavzu qo‘shish, ma’ruza/taqdimot/video yuklash', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Virtual obyektlar', action: 'Qo‘shish, tahrirlash, yashirish', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
  { area: 'Topshiriqlar (testlar)', action: 'Test yuklash, kalitni belgilash, tahrirlash', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Topshiriqlar (testlar)', action: 'Testni topshirish (bir marta)', roles: { ADMIN: false, TEACHER: false, STUDENT: 'own' } },
  { area: 'Topshiriqlar (testlar)', action: 'Natijalarni ko‘rish, qayta topshirishga ruxsat', roles: { ADMIN: true, TEACHER: 'group', STUDENT: 'own' } },
  { area: 'Dars ishlanmalari', action: 'Yaratish, versiyalash, topshirish', roles: { ADMIN: 'own', TEACHER: 'own', STUDENT: 'own' } },
  { area: 'Dars ishlanmalari', action: 'Ekspertiza (baholash)', roles: { ADMIN: true, TEACHER: 'group', STUDENT: false } },
  { area: 'Portfolio', action: 'Ko‘rish', roles: { ADMIN: true, TEACHER: 'group', STUDENT: 'own' } },
  { area: 'Tizim', action: 'Sozlamalar, davr/mavzular, audit log', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
];

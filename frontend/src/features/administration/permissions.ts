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
  { area: 'Manbalar', action: 'Nashr etilgan manbalarni ko‘rish', roles: { ADMIN: true, TEACHER: true, STUDENT: true } },
  { area: 'Manbalar', action: 'Qoralama yaratish va tahrirlash', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Manbalar', action: 'Nashr etish', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
  { area: 'Virtual obyektlar', action: 'Qo‘shish, tahrirlash, yashirish', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
  { area: 'Tahlil / taqqoslash', action: 'Bajarish va topshirish', roles: { ADMIN: false, TEACHER: false, STUDENT: 'own' } },
  { area: 'Tahlil / taqqoslash', action: 'Ko‘rish va baholash', roles: { ADMIN: true, TEACHER: 'group', STUDENT: 'own' } },
  { area: 'Topshiriqlar', action: 'Yaratish va tahrirlash', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Topshiriqlar', action: 'Javob berish va qayta topshirish', roles: { ADMIN: false, TEACHER: false, STUDENT: 'own' } },
  { area: 'Topshiriqlar', action: 'Izoh, qaytarish, rubrika bo‘yicha baholash', roles: { ADMIN: true, TEACHER: 'group', STUDENT: false } },
  { area: 'Dars ishlanmalari', action: 'Yaratish, versiyalash, topshirish', roles: { ADMIN: 'own', TEACHER: 'own', STUDENT: 'own' } },
  { area: 'Dars ishlanmalari', action: 'Ekspertiza (baholash)', roles: { ADMIN: true, TEACHER: 'group', STUDENT: false } },
  { area: 'Diagnostika', action: 'Yaratish va tahrirlash', roles: { ADMIN: true, TEACHER: true, STUDENT: false } },
  { area: 'Diagnostika', action: 'Bajarish', roles: { ADMIN: false, TEACHER: false, STUDENT: 'own' } },
  { area: 'Diagnostika', action: 'Matnli javoblarni baholash', roles: { ADMIN: true, TEACHER: 'group', STUDENT: false } },
  { area: 'Kompetensiya', action: 'Profil va dinamikani ko‘rish', roles: { ADMIN: true, TEACHER: 'group', STUDENT: 'own' } },
  { area: 'Kompetensiya', action: 'Mezon, daraja va vaznlarni sozlash', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
  { area: 'Portfolio', action: 'Ko‘rish', roles: { ADMIN: true, TEACHER: 'group', STUDENT: 'own' } },
  { area: 'Hisobotlar', action: 'Guruh CSV eksporti, eksperiment hisoboti', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Tizim', action: 'Sozlamalar, davr/mavzular, audit log', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
];

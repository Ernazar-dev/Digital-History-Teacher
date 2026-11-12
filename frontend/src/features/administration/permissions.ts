import type { Role } from '@/types/api';

/**
 * Ruxsatlar matritsasi — backend marşrutlaridagi requireRole va access tekşiruvlarining
 * hujjatlaştirilgan körinişi (manba: backend/src/modules/*.routes.ts, shared/utils/access.ts).
 * true — töliq; 'own' — faqat öziniki; 'group' — faqat öz guruhidagi talabalarniki; false — yöq.
 */
export type Access = boolean | 'own' | 'group';

export const PERMISSIONS: { area: string; action: string; roles: Record<Role, Access> }[] = [
  { area: 'Foydalanuvçilar', action: 'Röyxat, tasdiqlaş, rol va holatni özgartiriş', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
  { area: 'Foydalanuvçilar', action: 'Faol talabalarni qidiriş (guruhga qöşiş uçun)', roles: { ADMIN: true, TEACHER: true, STUDENT: false } },
  { area: 'Guruhlar', action: 'Yaratiş, tahrirlaş, talaba biriktiriş', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Manbalar (mavzular)', action: 'Mavzularni köriş', roles: { ADMIN: true, TEACHER: true, STUDENT: true } },
  { area: 'Manbalar (mavzular)', action: 'Mavzu qöşiş, ma’ruza/taqdimot/video yuklaş', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Virtual obyektlar', action: 'Qöşiş, tahrirlaş, yaşiriş', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
  { area: 'Topşiriqlar (testlar)', action: 'Test yuklaş, kalitni belgilaş, tahrirlaş', roles: { ADMIN: true, TEACHER: 'own', STUDENT: false } },
  { area: 'Topşiriqlar (testlar)', action: 'Testni topşiriş (bir marta)', roles: { ADMIN: false, TEACHER: false, STUDENT: 'own' } },
  { area: 'Topşiriqlar (testlar)', action: 'Natijalarni köriş, qayta topşirişga ruxsat', roles: { ADMIN: true, TEACHER: 'group', STUDENT: 'own' } },
  { area: 'Dars işlanmalari', action: 'Yaratiş, versiyalaş, topşiriş', roles: { ADMIN: 'own', TEACHER: 'own', STUDENT: 'own' } },
  { area: 'Dars işlanmalari', action: 'Ekspertiza (baholaş)', roles: { ADMIN: true, TEACHER: 'group', STUDENT: false } },
  { area: 'Portfolio', action: 'Köriş', roles: { ADMIN: true, TEACHER: 'group', STUDENT: 'own' } },
  { area: 'Tizim', action: 'Sozlamalar, davr/mavzular, audit log', roles: { ADMIN: true, TEACHER: false, STUDENT: false } },
];

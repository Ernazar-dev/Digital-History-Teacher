import type { Role } from '@prisma/client';
import type { Locale } from '../shared/i18n/locale';

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      role: Role;
      username: string;
      fullName: string;
    }
    interface Request {
      user?: AuthUser;
      /** So'rov tili (X-Lang / ?lang=), standart — uz */
      lang: Locale;
      /** O'zbekcha bo'lmagan tildagi GET so'rovlari uchun {matn hash'i → tarjima} lug'ati */
      i18nDict?: Map<string, string>;
    }
  }
}

export {};

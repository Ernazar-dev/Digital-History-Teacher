import type { NextFunction, Request, Response } from 'express';

export const LOCALES = ['uz', 'ru', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'uz';

/** Asosiy yozuvlar o'zbekcha; tarjimalar faqat shu tillarda saqlanadi */
export const TRANSLATION_LOCALES = ['ru', 'en'] as const;
export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

export const parseLocale = (raw: unknown): Locale => {
  const v = (Array.isArray(raw) ? raw[0] : raw);
  const code = typeof v === 'string' ? v.trim().toLowerCase().slice(0, 2) : '';
  return (LOCALES as readonly string[]).includes(code) ? (code as Locale) : DEFAULT_LOCALE;
};

/** So'rov tili: `X-Lang` sarlavhasi yoki `?lang=`; berilmasa — o'zbekcha */
export const localeMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.lang = parseLocale(req.header('x-lang') ?? req.query.lang);
  next();
};

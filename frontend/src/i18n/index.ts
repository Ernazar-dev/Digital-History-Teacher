import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { ru } from './locales/ru';
import { uz } from './locales/uz';

export const LANGS = ['uz', 'ru', 'en'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'uz';
const STORAGE_KEY = 'dht.lang';

export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

/** Saqlangan til; boʻlmasa — oʻzbekcha (brauzer tiliga qaramaymiz: platforma asosan oʻzbek auditoriyasi uchun) */
const initialLang = (): Lang => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    /* private rejim — standart til */
  }
  return DEFAULT_LANG;
};

void i18n.use(initReactI18next).init({
  resources: { uz: { translation: uz }, ru: { translation: ru }, en: { translation: en } },
  lng: initialLang(),
  fallbackLng: DEFAULT_LANG,
  interpolation: { escapeValue: false },
  returnNull: false,
});

/** Soʻrovlar sarlavhasi va sahifa <html lang> uchun joriy til */
export const currentLang = (): Lang => (isLang(i18n.language) ? i18n.language : DEFAULT_LANG);

export const setLang = (lang: Lang) => {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* saqlab boʻlmasa ham til joriy sessiyada almashadi */
  }
  void i18n.changeLanguage(lang);
};

document.documentElement.lang = currentLang();
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;

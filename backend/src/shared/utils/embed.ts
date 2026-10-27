import { env } from '../../config/env';

/**
 * Embed URL xavfsizligi: faqat https va server tomonida ruxsat etilgan hostlar.
 * Subdomenlar (masalan www.sketchfab.com) ham ruxsat etiladi.
 */
export const isAllowedEmbedUrl = (value: string, allowedHosts = env.embedAllowedHosts): boolean => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  return allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
};

/** Sketchfab model sahifasi URL'idan rasmiy embed URL hosil qiladi (ID taxmin qilinmaydi) */
export const sketchfabEmbedFromUrl = (value: string): string | null => {
  try {
    const url = new URL(value);
    if (!url.hostname.endsWith('sketchfab.com')) return null;
    // /models/<uid>, /models/<uid>/embed yoki /3d-models/<slug>-<uid>
    const direct = url.pathname.match(/\/models\/([a-f0-9]{32})/i);
    if (direct) return `https://sketchfab.com/models/${direct[1]}/embed`;
    const slugged = url.pathname.match(/\/3d-models\/[^/]*-([a-f0-9]{32})\/?$/i);
    if (slugged) return `https://sketchfab.com/models/${slugged[1]}/embed`;
    return null;
  } catch {
    return null;
  }
};

/** Oddiy havola (tashqi manba) uchun: faqat http(s) */
export const isSafeHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

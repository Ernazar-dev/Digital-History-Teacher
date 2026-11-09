import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import type { Locale } from './locale';
import { textHash } from './textHash';

type Dictionary = Map<string, string>;

const TTL_MS = 60_000;
const cache = new Map<Locale, { at: number; dict: Dictionary }>();

/** Tilning {o'zbekcha matn hash'i → tarjima} lug'ati; 1 daqiqa keshlanadi */
export const getDictionary = async (lang: Locale): Promise<Dictionary> => {
  const hit = cache.get(lang);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.dict;
  const rows = await prisma.textTranslation.findMany({ where: { locale: lang }, select: { sourceHash: true, text: true } });
  const dict: Dictionary = new Map(rows.map((r) => [r.sourceHash, r.text]));
  cache.set(lang, { at: Date.now(), dict });
  return dict;
};

/** Admin tarjimani o'zgartirsa, kesh darhol yangilansin */
export const clearDictionaryCache = () => cache.clear();

const MAX_LEN = 4000;

const isPlain = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && Object.getPrototypeOf(v) === Object.prototype;

/**
 * JSON javobidagi har bir matn lug'atda bo'lsa — tarjimasi bilan almashtiriladi (aynan mos kelganda).
 * Sanalar, fayllar va uzun matnlar (ma'ruza) o'zgarmaydi.
 */
export const translateDeep = <T>(data: T, dict: Dictionary): T => {
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') {
      if (v.length === 0 || v.length > MAX_LEN) return v;
      return dict.get(textHash(v)) ?? v;
    }
    if (Array.isArray(v)) return v.map(walk);
    if (isPlain(v)) {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v)) out[k] = walk(val);
      return out;
    }
    return v;
  };
  return walk(data) as T;
};

/** O'zbekcha bo'lmagan tildagi GET so'rovlari uchun lug'atni oldindan yuklaydi (auth va media'dan tashqari) */
export const translationMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    if (req.method === 'GET' && req.lang !== 'uz' && !req.path.startsWith('/api/v1/auth') && !req.path.startsWith('/api/v1/media')) {
      req.i18nDict = await getDictionary(req.lang);
    }
  } catch {
    // Lug'at yuklanmasa ham javob o'zbekcha qaytadi
  }
  next();
};

import { createHash } from 'node:crypto';

/**
 * O'zbekcha matnning kaliti: apostrof ko'rinishlari (‘ ’ ʻ ʼ `) bir xil sanaladi, bo'shliqlar tozalanadi.
 * TextTranslation jadvali va API javobini tarjima qilish shu kalit bo'yicha ishlaydi.
 */
export const normalizeText = (s: string) => s.replace(/[‘’ʻʼ`´′]/g, "'").replace(/\s+/g, ' ').trim();

export const textHash = (s: string) => createHash('md5').update(normalizeText(s)).digest('hex');

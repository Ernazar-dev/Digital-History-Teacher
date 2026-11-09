// Diktor matnini tayyorlash: raqamlar o'zbekcha so'zlarga, sayt nomi esa inglizcha o'qiladigan bo'lakka ajratiladi.
// gen-audio.mjs ishlatadi. Subtitrda matn o'zgarmaydi (1483-yilda), faqat ovozga berilganda so'zga aylanadi.

const UNITS = ['', 'bir', 'ikki', 'uch', "to'rt", 'besh', 'olti', 'yetti', 'sakkiz', "to'qqiz"];
const TENS = ['', "o'n", 'yigirma', "o'ttiz", 'qirq', 'ellik', 'oltmish', 'yetmish', 'sakson', "to'qson"];

/** 1 – 9999 oralig'idagi son so'zlarda: 1483 -> «ming to'rt yuz sakson uch» */
export const cardinal = (n) => {
  const words = [];
  const th = Math.floor(n / 1000);
  const h = Math.floor((n % 1000) / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  if (th) words.push(th === 1 ? 'ming' : `${UNITS[th]} ming`);
  if (h) words.push(h === 1 ? 'yuz' : `${UNITS[h]} yuz`);
  if (t) words.push(TENS[t]);
  if (u) words.push(UNITS[u]);
  return words.join(' ');
};

const ORDINAL = {
  bir: 'birinchi', ikki: 'ikkinchi', uch: 'uchinchi', "to'rt": "to'rtinchi", besh: 'beshinchi', olti: 'oltinchi',
  yetti: 'yettinchi', sakkiz: 'sakkizinchi', "to'qqiz": "to'qqizinchi", "o'n": "o'ninchi", yigirma: 'yigirmanchi',
  "o'ttiz": "o'ttizinchi", qirq: 'qirqinchi', ellik: 'ellikinchi', oltmish: 'oltmishinchi', yetmish: 'yetmishinchi',
  sakson: 'saksoninchi', "to'qson": "to'qsoninchi", yuz: 'yuzinchi', ming: 'minginchi',
};

/** 1483 -> «ming to'rt yuz sakson uchinchi» */
export const ordinal = (n) => {
  const words = cardinal(n).split(' ');
  words[words.length - 1] = ORDINAL[words.at(-1)];
  return words.join(' ');
};

const MARK = '\u0001';

/**
 * Raqamlar: «1483-yilda» -> «ming to'rt yuz sakson uchinchi yilda»; sanab o'tishda
 * («1497, 1500 va 1511-yillarda») hammasi tartib son; qolgan sonlar — oddiy son.
 */
export const spellNumbers = (text) => {
  let s = text.replace(/(\d+)-(yil\p{L}*)/gu, (_, n, rest) => `${MARK}${ordinal(Number(n))} ${rest}`);
  // «1497, 1500 va ...» — oxiridagi yilga qadar bo'lgan sonlar ham tartib son
  const lead = /(\d+)(,| va) (?=(?:\d+(?:,| va) )*\u0001)/u;
  while (lead.test(s)) s = s.replace(lead, (_, n, sep) => `${ordinal(Number(n))}${sep} `);
  return s.replaceAll(MARK, '').replace(/\d+/g, (n) => cardinal(Number(n)));
};

export const SITE_NAME = 'Digital History Teacher';

/** Matnni [{ text, lang: 'uz' | 'en' }] bo'laklarga ajratadi: sayt nomi inglizcha o'qiladi */
export const toSegments = (text) => {
  const parts = text.split(SITE_NAME);
  const out = [];
  parts.forEach((part, i) => {
    // Sayt nomi atrofidagi qo'shtirnoqlar ovozga berilmaydi
    const clean = part.replace(i > 0 ? /^[»\s]+/u : /^$/, '').replace(i < parts.length - 1 ? /[«\s]+$/u : /^$/, '');
    if (/\p{L}/u.test(clean)) out.push({ text: spellNumbers(clean), lang: 'uz' });
    if (i < parts.length - 1) out.push({ text: SITE_NAME, lang: 'en' });
  });
  return out;
};

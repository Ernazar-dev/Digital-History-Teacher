/**
 * material/ papkasidagi kitob PDF'larini tartibli Word (.docx) fayllarga aylantiradi va qidiruv uchun sahifa matnlarini yozadi.
 * Dev-asbob (deployda ishlamaydi): tayyor `books/<slug>.docx` va `books/<slug>.pages.json` git'da turadi.
 *
 *   node prisma/seed-data/build-books.mjs [slug ...]      (backend/ papkasidan; `pdftotext` (poppler) kerak)
 *
 * PDF'dan matn olinadi, sahifa sarlavhalari/raqamlari/«ziyouz.com» belgisi va OCR axlati tozalanadi, defis bilan bo'lingan
 * so'zlar tiklanadi, qatorlar abzatslarga birlashtiriladi. Natija ma'ruzalar bilan bir xil standartda:
 * A4; chap 3 sm, o'ng 1,5 sm, tepa/past 2 sm; Times New Roman 14 pt; qator oralig'i 1,5; qizil satr 1,25 sm;
 * ikki tomonga tekislangan; sahifa raqami pastda o'rtada.
 * Diqqat: asl PDF'dagi skaner (OCR) xatolari matnda qoladi — ular avtomatik tuzatilmaydi.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as docx from '../../../frontend/node_modules/docx/dist/index.mjs';

const { AlignmentType, Document, Footer, HeadingLevel, PageNumber, Packer, Paragraph, TextRun } = docx;

const here = dirname(fileURLToPath(import.meta.url));
const material = join(here, '..', '..', '..', 'material');
const out = join(here, 'books');

/** slug -> material/ ichidagi fayl, sarlavha va muallif (seed-books.ts dagi bilan bir xil bo'lsin) */
const BOOKS = {
  'kitob-avesto': { file: '1_Авесто_Қадимги_ёзма_ёдгорликлар.pdf', title: 'AVESTO — QADIMGI YOZMA YODGORLIKLAR', author: 'Qadimgi yozma yodgorliklar' },
  'kitob-buxoro-tarixi': { file: '4. Abu Bakr Narshaxiy. Buxoro tarixi 4.pdf', title: 'BUXORO TARIXI', author: 'Abu Bakr Narshaxiy', pdfText: true },
  'kitob-zafarnoma': { file: '7. Sharafiddin Ali Yazdiy. Zafarnoma 7.pdf', title: 'ZAFARNOMA', author: 'Sharafiddin Ali Yazdiy' },
  'kitob-boburnoma': { file: '8. Zahiriddin Muhammad Bobur. Boburnoma 8).pdf', title: 'BOBURNOMA', author: 'Zahiriddin Muhammad Bobur' },
  'kitob-shajarai-turk': { file: "9. Abulg'oziy Bahodirxon. Shajarai turk 9.pdf", title: 'SHAJARAI TURK', author: 'Abulg‘oziy Bahodirxon' },
};

/** Qayta o'qish (OCR) o'rniga PDF'ning tayyor matn qatlami ishlatiladigan kitoblar */
const NO_OCR = new Set(Object.entries(BOOKS).filter(([, b]) => b.pdfText).map(([slug]) => slug));

const FONT = 'Times New Roman';
const SIZE = 28; // 14 pt
const LINE = 360; // 1,5 interval
const CM = 567;
const FIRST_LINE = Math.round(1.25 * CM);

// ───────────── Matnni tozalash ─────────────

const WATERMARK = /ziyouz|kutubxonasi|www\.|\.com\b|\.uz\b/i;
const letters = (s) => (s.match(/\p{L}/gu) ?? []).length;
const digitsOnly = (s) => /^[\s\d.,:;\-–—_*•IVXLCivxlc]+$/.test(s);
/** Belgilar/raqamlar aralash axlat: «4* 4& 4Й», «<%Ай&й&й», bezak chiziqlari */
const isNoise = (s) => {
  const flat = s.replace(/\s+/g, '');
  if (!flat) return true;
  if (digitsOnly(s) || WATERMARK.test(s)) return true;
  if ((flat.match(/[&*<>%/\\#@^~|=_]/g) ?? []).length >= 3) return true;
  if (letters(flat) / flat.length < 0.7 && flat.length > 3) return true;
  if (/^\S{1,4}( \S{1,4})+$/.test(s) && /[\d&*]/.test(s)) return true;
  if (/(\p{L})\1{3,}/u.test(s)) return true; // «ШШШШШШ» — bezak
  const tokens = s.split(' ');
  if (tokens.length >= 4 && tokens.every((t) => t.length <= 2)) return true; // «Ш Ш Т Т Т» kabi bezak qoldig'i
  return false;
};
/** Qator ichidagi OCR axlati: «4Ў», «ч*», «Ч#;» kabi belgi/raqam aralash qisqa bo'laklar */
const scrub = (s) =>
  s
    .split(' ')
    .filter((t) => !(t.length <= 5 && (/[*#^&<>{}|~=_@[\]]/.test(t) || (/\d/.test(t) && /\p{L}/u.test(t)))))
    .join(' ')
    .replace(/^[-«»]\s+(?=\p{L})/u, '')
    .replace(/>/g, '»')
    .replace(/</g, '«')
    .replace(/\s+/g, ' ')
    .trim();
/** Takrorlanuvchi sahifa sarlavhalarini OCR xatolariga qaramay topish uchun: dastlabki 5 harf */
const norm = (s) => s.replace(/[^\p{L}]+/gu, '').toLowerCase().slice(0, 5);

/**
 * Tesseract so'zlari (o'rni bilan) -> o'qish tartibidagi qatorlar. Tesseract yaqin ustunlarni bitta qatorga qo'shib yuboradi:
 * katta bo'shliq (tarnov) bor qatorlar ikkiga bo'linadi, chap ustun to'liq, keyin o'ng ustun o'qiladi;
 * butun kenglikdagi sarlavhalar esa ustunlarni ajratib turadi. Ishonchsiz bezak/chekka «so'zlar» tashlanadi.
 */
const composePage = ({ w, lines }) => {
  const PUNCT = /^[.,;:!?»«"“”()\d-]+$/;
  // Tinish belgisi alohida «so'z» bo'lib kelishi mumkin; chekka bezaklaridagi tasodifiy belgilar esa tashlanadi
  const keep = ([t, x0, x1, conf]) => (/^[—–]$/.test(t) ? true : /\p{L}{3,}/u.test(t) ? conf >= 25 : /\p{L}{2}/u.test(t) ? conf >= 50 : /\p{L}/u.test(t) ? conf >= 70 : PUNCT.test(t) && conf >= 20 && x0 > 0.1 * w && x1 < 0.97 * w);
  const rows = lines
    .map((l) => ({ y: (l.y0 + l.y1) / 2, words: l.words.filter(keep).sort((a, b) => a[1] - b[1]) }))
    .filter((r) => r.words.length)
    .sort((a, b) => a.y - b.y);
  const gapOf = (words) => {
    let best = null;
    for (let i = 1; i < words.length; i++) {
      const gap = words[i][1] - words[i - 1][2];
      if (gap > 0.03 * w && (!best || gap > best.gap)) best = { gap, at: i, mid: (words[i][1] + words[i - 1][2]) / 2 };
    }
    return best && best.mid > 0.38 * w && best.mid < 0.62 * w ? best : null;
  };
  const splits = rows.map((r) => gapOf(r.words));
  const mids = splits.filter(Boolean).map((s) => s.mid).sort((a, b) => a - b);
  const gutter = mids.length >= 3 ? mids[Math.floor(mids.length / 2)] : null;
  /** Tinish belgilari oldingi so'zga yopishtiriladi: «Кайфур , ўн» -> «Кайфур, ўн» */
  const text = (words) =>
    words
      .map((x) => x[0])
      .join(' ')
      .replace(/ ([.,;:!?)»”])/g, '$1')
      .replace(/([(«“]) /g, '$1');

  const out = [];
  let left = [];
  let right = [];
  const flush = () => {
    out.push(...left, ...right);
    left = [];
    right = [];
  };
  rows.forEach((r, i) => {
    const s = splits[i];
    if (gutter && s) {
      left.push(text(r.words.slice(0, s.at)));
      right.push(text(r.words.slice(s.at)));
      return;
    }
    const x0 = r.words[0][1];
    const x1 = r.words[r.words.length - 1][2];
    if (gutter && x1 <= gutter + 0.01 * w) left.push(text(r.words));
    else if (gutter && x0 >= gutter - 0.01 * w) right.push(text(r.words));
    else {
      flush();
      out.push(text(r.words));
    }
  });
  flush();
  return out;
};

/** Qayta o'qilgan (ocr-books.mjs) sahifalar to'liq bo'lsa — ular, aks holda PDF ichidagi matn qatlami */
const ocrPages = (slug, count) => {
  const dir = join(material, 'ocr', slug);
  if (!existsSync(dir) || readdirSync(dir).length < count) return null;
  return Array.from({ length: count }, (_, i) => composePage(JSON.parse(readFileSync(join(dir, `${String(i + 1).padStart(4, '0')}.json`), 'utf8'))));
};

const pdfPages = (file, slug) => {
  const text = execFileSync('pdftotext', ['-enc', 'UTF-8', file, '-'], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
  const pages = text.split('\f');
  if (pages.at(-1)?.trim() === '') pages.pop();
  // Buxoro tarixi: Tesseract tinish belgilarini tushirib qoldiradi, PDF'ning o'z matn qatlami esa yaxshi — o'sha ishlatiladi
  const ocr = NO_OCR.has(slug) ? null : ocrPages(slug, pages.length);
  if (ocr) {
    console.log(`${slug}: qayta o'qilgan (Tesseract) matn ishlatilmoqda`);
    return ocr.map((lines) => lines.map((l) => scrub(l.replace(/\s+/g, ' ').trim())));
  }
  return pages.map((p) => p.split('\n').map((l) => scrub(l.replace(/\s+/g, ' ').trim())));
};

/** Sahifa boshi/oxiridagi takrorlanuvchi qatorlar (kitob nomi, bob nomi, raqam) olib tashlanadi */
const cleanPages = (pages) => {
  const edge = new Map();
  for (const lines of pages) {
    const real = lines.filter(Boolean);
    for (const l of [...real.slice(0, 2), ...real.slice(-2)]) if (l.length < 45) edge.set(norm(l), (edge.get(norm(l)) ?? 0) + 1);
  }
  const limit = Math.max(6, Math.round(pages.length * 0.08));
  const running = new Set([...edge].filter(([k, n]) => n >= limit && k).map(([k]) => k));
  // Sahifa boshida bo'lmasa ham har sahifada takrorlanadigan qisqa BOSH HARFLI sarlavha («БОБУРНОМА», OCR xatolari bilan)
  const caps = new Map();
  for (const l of pages.flat()) if (l.length < 30 && isCaps(l)) caps.set(norm(l), (caps.get(norm(l)) ?? 0) + 1);
  const runningCaps = new Set([...caps].filter(([k, n]) => n >= limit && k).map(([k]) => k));
  return pages.map((lines) => {
    const real = lines.filter(Boolean);
    const edges = new Set([...real.slice(0, 2), ...real.slice(-2)]);
    return real.filter((l) => !isNoise(l) && !(edges.has(l) && l.length < 45 && running.has(norm(l))) && !(l.length < 30 && isCaps(l) && runningCaps.has(norm(l))));
  });
};

// ───────────── Abzatslarga yig'ish ─────────────

const END = /[.!?»”“")\]…]$/;
const isCaps = (s) => {
  const l = s.replace(/[^\p{L}]/gu, '');
  return l.length >= 3 && s.length <= 90 && !/[.,;:]$/.test(s) && l === l.toUpperCase() && l !== l.toLowerCase();
};

const toBlocks = (cleaned) => {
  const blocks = []; // { kind: 'h' | 'p', text }
  let cur = null;
  const flush = () => {
    // Bir-ikki harfli bo'laklardan iborat abzats («За фа аҳ В урез…») — o'qib bo'lmaydigan skaner axlati, tashlanadi
    const tokens = cur?.trim().split(/\s+/) ?? [];
    const junk = tokens.length >= 8 && tokens.filter((t) => letters(t) <= 2).length / tokens.length > 0.55;
    if (cur && !junk) blocks.push({ kind: 'p', text: cur.trim() });
    cur = null;
  };
  for (const lines of cleaned) {
    const maxLen = Math.max(1, ...lines.map((l) => l.length));
    for (const line of lines) {
      if (isCaps(line)) {
        flush();
        // Bir-ikki harfli bosh harfli qoldiqlar («ЧК ЧК», «У ДУ У») — sarlavha emas, OCR axlati
        if (/\p{L}{4,}/u.test(line) && letters(line) >= 6 && (letters(line) >= 15 || !/\d/.test(line))) blocks.push({ kind: 'h', text: line });
        continue;
      }
      if (cur === null) {
        cur = line;
      } else if (/[\p{L}]-$/u.test(cur) && /^\p{Ll}/u.test(line)) {
        cur = cur.slice(0, -1) + line; // defis bilan bo'lingan so'z tiklanadi
      } else {
        const full = cur.length >= maxLen * 0.8 && lines.length > 1;
        const tooLong = cur.length > 1400 && END.test(cur);
        const startsNew = tooLong || /^[—–-]\s/.test(line) || (END.test(cur) && !full && /^[\p{Lu}«“"—–]/u.test(line));
        if (startsNew) {
          flush();
          cur = line;
        } else cur = `${cur} ${line}`;
      }
    }
  }
  flush();
  return blocks;
};

// ───────────── Word fayl ─────────────

const run = (text, o = {}) => new TextRun({ text, font: FONT, color: '000000', size: o.size ?? SIZE, bold: o.bold });
const bodyP = (text) => new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { line: LINE, after: 0 }, indent: { firstLine: FIRST_LINE }, children: [run(text)] });
const headP = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { line: LINE, before: 240, after: 120 }, children: [run(text, { bold: true })] });
const centered = (text, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { line: LINE, after: o.after ?? 0, before: o.before ?? 0 }, children: [run(text, o)] });

const buildDoc = ({ title, author }, blocks) =>
  new Document({
    creator: 'Digital History Teacher',
    title: `${author} — ${title}`,
    description: 'Tarixiy asar matni',
    styles: {
      default: { document: { run: { font: FONT, size: SIZE, color: '000000' }, paragraph: { spacing: { line: LINE, after: 0 } } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: SIZE, bold: true, color: '000000' }, paragraph: { keepNext: true, outlineLevel: 0 } },
      ],
    },
    sections: [
      {
        properties: {
          page: { size: { width: 11906, height: 16838 }, margin: { top: Math.round(2 * CM), bottom: Math.round(2 * CM), left: Math.round(3 * CM), right: Math.round(1.5 * CM) } },
        },
        footers: {
          default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 24, color: '000000' })] })] }),
        },
        children: [
          centered(author, { bold: true }),
          centered(title, { bold: true, after: 240 }),
          ...blocks.map((b) => (b.kind === 'h' ? headP(b.text) : bodyP(b.text))),
        ],
      },
    ],
  });

// ───────────── Ishga tushirish ─────────────

mkdirSync(out, { recursive: true });
const only = process.argv.slice(2);
for (const [slug, book] of Object.entries(BOOKS)) {
  if (only.length && !only.includes(slug)) continue;
  const cleaned = cleanPages(pdfPages(join(material, book.file), slug));
  const blocks = toBlocks(cleaned);
  writeFileSync(join(out, `${slug}.pages.json`), JSON.stringify(cleaned.map((lines) => lines.join(' '))));
  writeFileSync(join(out, `${slug}.docx`), await Packer.toBuffer(buildDoc(book, blocks)));
  const words = blocks.reduce((n, b) => n + b.text.split(/\s+/).length, 0);
  console.log(`${slug}: ${cleaned.length} PDF bet → ${blocks.filter((b) => b.kind === 'p').length} abzats, ${blocks.filter((b) => b.kind === 'h').length} sarlavha, ${words} so‘z`);
}

/**
 * Mijoz bergan ma'ruza Word fayllarini (uz / ru / en) `material/` dagi zipdan olib, `lectures/` ga joylaydi (dev-asbob).
 *
 *   node backend/prisma/seed-data/import-lectures-docx.mjs "material/Манбалар (2).zip"
 *
 * Natija (har mavzu uchun): `<slug>.docx` (uz), `<slug>.ru.docx`, `<slug>.en.docx` va ularning Markdown nusxalari
 * `<slug>.md`, `<slug>.ru.md`, `<slug>.en.md` (qidiruv va matn ko'rinishi uchun).
 *
 * Mijozning o'zbekcha fayllari eski «diakritik» lotin yozuvida: ö = o‘, ğ = g‘, ş = sh, ç = ch. Word fayl ichida
 * ham, Markdown'da ham shu belgilar hozirgi imloga o'tkaziladi. ru/en Word fayllar o'zgartirilmaydi.
 * `jszip` frontend/node_modules ichida (frontend paketlarini o'rnatish yetarli).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import JSZip from '../../../frontend/node_modules/jszip/lib/index.js';

const OUT = join(dirname(fileURLToPath(import.meta.url)), 'lectures');

/** Mijoz fayl nomi (tilsiz) -> mavzu slug'i */
const SLUGS = {
  'Buyuk ipak yoli muloqot va hamkorlik yoli': 'buyuk-ipak-yoli',
  'Etnogenez va etnik tarix masalalari': 'etnogenez-va-etnik-tarix',
  'IX XII asrlarda Movarounnahr va Xuroson davlatlari': 'ix-xii-asrlar-tarixi',
  'IX XII asrlarda Uyg onish davri. Ajdodlarimizning jahon sivilizatsiyasiga qoshgan hissasi': 'sharq-uygonish-davri',
  'Orta Osiyoga mogullar bosqini va unga qarshi kurash': 'mogullar-bosqini',
  'Amir Temur hukmronligi davrida ozbek davlatchiligi': 'amir-temur-davlati',
  'Qoqon xonligi. Siyosiy ijtimoiy-iqtisodiy va madaniy hayot': 'qoqon-xonligi',
  'Shayboniylar sulolasi hukmronligi davrida ozbek davlatchiligi': 'shayboniylar-davlati',
  'Songgi orta asrlarda qoraqalpoqlar': 'qoraqalpoqlar-tarixi',
  'Temuriylar hukmronligi davri. Ijtimoiy-siyosiy iqtisodiy va madaniy hayot': 'temuriylar-davri',
  'XVI XIX asr birinchi yarmida Xiva xonligi': 'xiva-xonligi',
  'XVII XVIII asrlar birinchi yarmida Ashtarxoniylar davlati': 'ashtarxoniylar-davlati',
  'XVIII asr ikkinchi yarmi XIX asr birinchi yarmida Buxoro amirligi': 'buxoro-amirligi',
};

const fixUz = (s) =>
  s.replace(/ö/g, 'o‘').replace(/Ö/g, 'O‘').replace(/ş/g, 'sh').replace(/Ş/g, 'Sh').replace(/ç/g, 'ch').replace(/Ç/g, 'Ch').replace(/ğ/g, 'g‘').replace(/Ğ/g, 'G‘');

const unxml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

/** <w:b/> -> true, <w:b w:val="0"/> -> false, belgilanmagan -> undefined */
const flag = (rpr, tag) => {
  const m = rpr.match(new RegExp(`<w:${tag}(?: w:val="([^"]*)")?/>`));
  if (!m) return undefined;
  return !['0', 'false', 'off'].includes(m[1] ?? '1');
};

const runsOf = (p) =>
  [...p.matchAll(/<w:r[ >][\s\S]*?<\/w:r>/g)]
    .map((m) => {
      const rpr = (m[0].match(/<w:rPr>([\s\S]*?)<\/w:rPr>/) || [])[1] || '';
      const t = [...m[0].matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>|<w:tab\/>/g)].map((x) => (x[1] === undefined ? ' ' : unxml(x[1]))).join('');
      return { t, b: flag(rpr, 'b'), i: flag(rpr, 'i') };
    })
    .filter((r) => r.t);

const para = (p) => {
  const runs = runsOf(p);
  if (!runs.length) return null;
  const text = runs.map((r) => r.t).join('').replace(/\s+/g, ' ').trim();
  if (!text) return null;
  const style = (p.match(/<w:pStyle w:val="([^"]+)"/) || [])[1] || '';
  const jc = (p.match(/<w:jc w:val="(\w+)"/) || [])[1] || '';
  return { runs, text, style, jc, allBold: runs.every((r) => r.b === true), noBold: runs.every((r) => r.b === false), allItalic: runs.every((r) => r.i === true) };
};

/** Qatorlararo belgilar: **qalin** (bo'shliqlar belgidan tashqarida) */
const inline = (runs) => {
  const parts = [];
  for (const r of runs) {
    const last = parts[parts.length - 1];
    if (last && last.b === (r.b === true)) last.t += r.t;
    else parts.push({ b: r.b === true, t: r.t });
  }
  return parts
    .map((x) => (x.b && x.t.trim() ? `${x.t.match(/^\s*/)[0]}**${x.t.trim()}**${x.t.match(/\s*$/)[0]}` : x.t))
    .join('')
    .replace(/\s+/g, ' ')
    .trim();
};

const dashes = (s) => s.replace(/ - /g, ' — ');

/** Hujjat tanasini [{type:'p', ...} | {type:'table', rows}] ketma-ketligiga ajratadi */
const blocks = (xml) => {
  const body = xml.split('<w:body>')[1].split('</w:body>')[0];
  const out = [];
  for (const [i, chunk] of body.split(/(<w:tbl>[\s\S]*?<\/w:tbl>)/).entries()) {
    if (i % 2 === 1) {
      const rows = [...chunk.matchAll(/<w:tr[ >][\s\S]*?<\/w:tr>/g)].map((tr) =>
        [...tr[0].matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g)].map((tc) =>
          tc[0].split('</w:p>').map((p) => para(p)?.text).filter(Boolean).join(' '),
        ),
      );
      out.push({ type: 'table', rows });
    } else {
      for (const p of chunk.split('</w:p>')) {
        const q = para(p);
        if (q) out.push({ type: 'p', ...q });
      }
    }
  }
  return out;
};

const PLAN = /^(Reja|Plan|План)\s*:?$/i;
const strip = (s) => s.replace(/^\s*(?:\d+\s*[.)]\s*)/, '');

/** Oxirgi bo'limlar (uz / ru / en): Xulosa, Tayanch tushunchalar, Nazorat savollari, Adabiyotlar — tartib raqami = turi */
const TAIL = [
  /^(xulosa|заключение|выводы?|conclusions?)$/i,
  /^(tayanch tushunchalar|ключевые понятия|key concepts)$/i,
  /^(nazorat savollari va topshiriqlar|контрольные вопросы и задания|test questions and assignments)$/i,
  /^(foydalanilgan adabiyotlar|использованная литература|references)$/i,
];
const tailKind = (s) => TAIL.findIndex((r) => r.test(s.replace(/[.:\s]+$/, '').trim()));

const toMarkdown = (xml, lang) => {
  const bl = blocks(xml);
  if (bl[0]?.type === 'p' && /^(MATN|LECTURE|ЛЕКЦИЯ|ТЕКСТ|TEXT)$/i.test(bl[0].text)) bl.shift();
  // O'zbekcha faylda ba'zi sarlavhalar qalin/uslubsiz berilgan: reja bandlari («6. …») va qisqa, nuqtasiz, ortidan uzun
  // abzats keladigan qatorlar sarlavha deb olinadi
  const forced = new Set();
  {
    const at = bl.findIndex((b) => b.type === 'p' && PLAN.test(b.text));
    const plan = [];
    for (let i = at + 1; i < bl.length && bl[i].type === 'p' && /^\d+\s*[.)]\s*\S/.test(bl[i].text); i++) plan.push(strip(bl[i].text));
    let done = at + 1 + plan.length;
    for (let i = done; i < bl.length; i++) {
      const b = bl[i];
      const m = b.type === 'p' && b.text.match(/^(\d+)\s*[.)]\s*(.+)$/);
      if (m && plan[m[1] - 1] === m[2].trim()) forced.add(i);
      else if (b.type === 'p' && tailKind(b.text) < 0 && b.text.length <= 80 && !/[.:;!?,]$/.test(b.text) && !/^[-–•\d]/.test(b.text) && bl[i + 1] && (bl[i + 1].type === 'table' || bl[i + 1].text.length > 40)) forced.add(i);
    }
  }
  const isHeading = (b) =>
    b.type === 'p' &&
    (tailKind(b.text) >= 0 ||
      (b.jc !== 'center' && !PLAN.test(b.text) && b.text.length <= 170 && !/^[-–•]/.test(b.text) &&
        (((b.style === '1' || b.style === '2') && !b.noBold) || b.allBold || forced.has(bl.indexOf(b)))));
  const headIdx = bl.map((b, i) => (isHeading(b) && i > 0 ? i : -1)).filter((i) => i >= 0);
  const tail = headIdx.filter((i) => tailKind(bl[i].text) >= 0);
  if (tail.length < 2) throw new Error(`Oxirgi bo‘limlar topilmadi (${tail.length} ta)`);
  const lines = [];
  const push = (s) => lines.push(s, '');
  let section = ''; // 'plan' | 'glossary' | 'numbered' | ''
  let n = 0;
  for (const [i, b] of bl.entries()) {
    if (b.type === 'table') {
      const w = Math.max(...b.rows.map((r) => r.length));
      const row = (r) => `| ${Array.from({ length: w }, (_, k) => dashes(r[k] ?? '')).join(' | ')} |`;
      push([row(b.rows[0]), `|${'---|'.repeat(w)}`, ...b.rows.slice(1).map(row)].join('\n'));
      continue;
    }
    if (i === 0) {
      push(`# ${dashes(b.text)}`);
      continue;
    }
    if (headIdx.includes(i)) {
      const tailNo = tailKind(b.text);
      const h2 = tailNo >= 0 || /^\d+\s*[.)]\s*\S/.test(b.text);
      push(`${h2 ? '##' : '###'} ${dashes(b.text)}`);
      section = tailNo === 1 ? 'glossary' : tailNo >= 2 ? 'numbered' : '';
      n = 0;
      continue;
    }
    if (PLAN.test(b.text)) {
      push(`**${b.text.replace(/\s*:?$/, ':')}**`);
      section = 'plan';
      n = 0;
      continue;
    }
    if (section === 'plan' || section === 'numbered') {
      lines.push(`${++n}. ${dashes(strip(inline(b.runs)))}`, '');
      continue;
    }
    if (section === 'glossary') {
      const t = b.text.replace(/^[-–•]\s*/, '');
      const m = t.match(/^(.{1,90}?) [-–—] (.+)$/);
      push(m ? `- **${m[1]}** — ${m[2]}` : `- ${t}`);
      continue;
    }
    if (/^[-–•]\s*\S/.test(b.text)) {
      push(`- ${dashes(inline(b.runs).replace(/^[-–•]\s*/, ''))}`);
      continue;
    }
    if (b.allItalic) {
      push(`> ${dashes(inline(b.runs.map((r) => ({ ...r, i: false }))))}`);
      continue;
    }
    push(dashes(inline(b.runs)));
  }
  // Ro'yxat elementlari orasidagi bo'sh qatorlarni olib tashlash
  let md = lines.join('\n');
  for (let prev = ''; prev !== md; ) {
    prev = md;
    md = md.replace(/^(\d+\. [^\n]*)\n\n(?=\d+\. )/gm, '$1\n').replace(/^(- [^\n]*)\n\n(?=- )/gm, '$1\n');
  }
  return md.replace(/\n{3,}/g, '\n\n').trim() + '\n';
};

const zipPath = process.argv[2];
if (!zipPath) throw new Error('Zip yo‘li ko‘rsatilmagan');
const zip = await JSZip.loadAsync(readFileSync(zipPath));
mkdirSync(OUT, { recursive: true });
let done = 0;
for (const [name, entry] of Object.entries(zip.files)) {
  const m = basename(name).match(/^(.+?) +(uz|ru|en) *\.docx$/);
  if (entry.dir || !m || !SLUGS[m[1]]) continue;
  const lang = m[2];
  const slug = SLUGS[m[1]];
  const suffix = lang === 'uz' ? '' : `.${lang}`;
  const doc = await JSZip.loadAsync(await entry.async('nodebuffer'));
  let xml = await doc.file('word/document.xml').async('string');
  if (lang === 'uz') {
    xml = fixUz(xml);
    doc.file('word/document.xml', xml);
    const core = doc.file('docProps/core.xml');
    if (core) doc.file('docProps/core.xml', fixUz(await core.async('string')));
  }
  writeFileSync(join(OUT, `${slug}${suffix}.docx`), await doc.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
  writeFileSync(join(OUT, `${slug}${suffix}.md`), toMarkdown(xml, lang));
  done += 1;
  console.log(`${slug}${suffix}`);
}
console.log(`${done} ta fayl yozildi`);

/**
 * Ma'ruza Word fayllarini `lectures/<slug>.md` dan yaratadi (dev-asbob: deployda ishlamaydi, tayyor .docx lar git'da turadi).
 *
 * Ishga tushirish: node backend/prisma/seed-data/build-lectures-docx.mjs [slug ...]
 * `docx` kutubxonasi frontend/node_modules ichida (frontend paketlarini o'rnatish yetarli).
 *
 * Standart (ilmiy-uslubiy matn): A4; hoshiyalar chap 3 sm, o'ng 1,5 sm, tepa/past 2 sm; Times New Roman 14 pt, qora;
 * qator oralig'i 1,5; qizil satr 1,25 sm; matn ikki tomonga tekislangan; sarlavhalar qalin; sahifa raqami pastda o'rtada.
 * Jadval matni — 12 pt, bitta interval.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as docx from '../../../frontend/node_modules/docx/dist/index.mjs';

const {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, Packer, PageNumber, Paragraph, Table, TableCell, TableRow,
  TabStopType, TextRun, WidthType,
} = docx;

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'lectures');
const FONT = 'Times New Roman';
const SIZE = 28; // 14 pt (yarim punktlarda)
const TABLE_SIZE = 24; // 12 pt
const LINE = 360; // 1,5 interval
const CM = 567; // 1 sm = 567 twip
const FIRST_LINE = Math.round(1.25 * CM);
const TEXT_WIDTH = 11906 - Math.round(3 * CM) - Math.round(1.5 * CM); // A4 eni − chap − o'ng hoshiya

const run = (text, o = {}) => new TextRun({ text, font: FONT, color: '000000', size: o.size ?? SIZE, bold: o.bold, italics: o.italics });

/** **qalin** va *kursiv* belgilarini TextRun larga ajratadi */
const inline = (text, base = {}) => {
  const out = [];
  for (const part of text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/)) {
    if (!part) continue;
    if (part.startsWith('**')) out.push(run(part.slice(2, -2), { ...base, bold: true }));
    else if (part.startsWith('*') && part.length > 2) out.push(run(part.slice(1, -1), { ...base, italics: true }));
    else out.push(run(part, base));
  }
  return out;
};

const body = (text) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: LINE, after: 0 },
    indent: { firstLine: FIRST_LINE },
    children: inline(text),
  });

/** Ro'yxat bandi: belgi + tab + matn, osma (hanging) chekinish bilan */
const item = (mark, text) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: LINE, after: 0 },
    indent: { left: Math.round(2 * CM), hanging: Math.round(0.75 * CM) },
    tabStops: [{ type: TabStopType.LEFT, position: Math.round(2 * CM) }],
    children: [run(`${mark}\t`), ...inline(text)],
  });

const heading = (text, level) =>
  new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
    keepNext: true,
    spacing: { before: level === 1 ? 360 : 240, after: 120, line: LINE },
    indent: level === 1 ? undefined : { firstLine: FIRST_LINE },
    children: inline(text.replace(/\*\*/g, ''), { bold: true }),
  });

const cellsOf = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

const EDGE = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const table = (rows) => {
  const [head, , ...rest] = rows; // ikkinchi qator — |---|---| ajratgich
  const cols = cellsOf(head).length;
  const width = Math.floor(TEXT_WIDTH / cols);
  const cell = (text, bold) =>
    new TableCell({
      width: { size: width, type: WidthType.DXA },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      borders: { top: EDGE, bottom: EDGE, left: EDGE, right: EDGE },
      children: [
        new Paragraph({
          alignment: bold ? AlignmentType.CENTER : AlignmentType.LEFT,
          spacing: { line: 240, after: 0 },
          children: inline(text, { size: TABLE_SIZE, bold }),
        }),
      ],
    });
  const mk = (line, bold) => new TableRow({ cantSplit: true, tableHeader: bold, children: cellsOf(line).map((c) => cell(c, bold)) });
  return new Table({
    width: { size: TEXT_WIDTH, type: WidthType.DXA },
    columnWidths: Array(cols).fill(width),
    rows: [mk(head, true), ...rest.map((l) => mk(l, false))],
  });
};

/** Jadvaldan oldin va keyin kichik oraliq */
const gap = () => new Paragraph({ spacing: { after: 0, line: 240 }, children: [run('', { size: 16 })] });

const build = (md, slug) => {
  const lines = md.replace(/\r/g, '').split('\n');
  const children = [];
  let title = slug;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trimEnd();
    if (!line.trim() || /^---+$/.test(line.trim())) continue;
    let m;
    if ((m = /^# (.+)/.exec(line))) {
      title = m[1].replace(/\*/g, '');
      children.push(
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120, line: LINE }, children: [run('MA’RUZA MATNI', { bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 240, line: LINE }, children: inline(title, { bold: true }) }),
      );
    } else if ((m = /^## (.+)/.exec(line))) children.push(heading(m[1], 1));
    else if ((m = /^### (.+)/.exec(line))) children.push(heading(m[1], 2));
    else if (line.startsWith('|')) {
      const rows = [line];
      while (lines[i + 1]?.trim().startsWith('|')) rows.push(lines[++i].trimEnd());
      children.push(gap(), table(rows), gap());
    } else if ((m = /^>\s?(.*)/.exec(line))) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { line: LINE, after: 0 },
          indent: { firstLine: FIRST_LINE },
          children: inline(m[1], { italics: true }),
        }),
      );
    } else if ((m = /^\s*[-*] (.+)/.exec(line))) children.push(item('–', m[1]));
    else if ((m = /^\s*(\d+)\. (.+)/.exec(line))) children.push(item(`${m[1]}.`, m[2]));
    else children.push(body(line.trim()));
  }

  return new Document({
    creator: 'Digital History Teacher',
    title,
    description: 'Ma’ruza matni',
    styles: {
      default: {
        document: {
          run: { font: FONT, size: SIZE, color: '000000' },
          paragraph: { spacing: { line: LINE, after: 0 } },
        },
      },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: SIZE, bold: true, color: '000000' }, paragraph: { keepNext: true, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: SIZE, bold: true, color: '000000' }, paragraph: { keepNext: true, outlineLevel: 1 } },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: Math.round(2 * CM), bottom: Math.round(2 * CM), left: Math.round(3 * CM), right: Math.round(1.5 * CM) },
          },
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 24, color: '000000' })] })],
          }),
        },
        children,
      },
    ],
  });
};

const only = process.argv.slice(2);
const slugs = readdirSync(DIR).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)).filter((s) => !only.length || only.includes(s));
for (const slug of slugs) {
  const file = join(DIR, `${slug}.md`);
  if (!existsSync(file)) continue;
  const md = readFileSync(file, 'utf8');
  writeFileSync(join(DIR, `${slug}.docx`), await Packer.toBuffer(build(md, slug)));
  const words = md.split(/\s+/).filter(Boolean).length;
  console.log(`${slug}.docx — ${words} so‘z, taxminan ${(words / 280).toFixed(1)} bet`);
}

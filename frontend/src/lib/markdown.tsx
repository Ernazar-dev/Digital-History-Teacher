import { Fragment, type ReactNode } from 'react';

/**
 * Ma'ruza matni uchun kichik Markdown oʻquvchi — faqat React elementlari (innerHTML yoʻq, XSS xavfi yoʻq).
 * Qoʻllab-quvvatlanadi: # / ## / ### sarlavhalar, paragraflar, «- » va «1. » roʻyxatlar, «> » iqtibos,
 * **qalin**, *kursiv*, «---» ajratgich.
 */
export type MdBlock =
  | { kind: 'h'; level: 1 | 2 | 3; text: string; id: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'quote'; text: string }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'hr' };

/** «| a | b |» qatorini kataklarga ajratadi */
const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[‘’ʻʼ'`]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').slice(0, 80) || 'bolim';

export const parseMarkdown = (src: string): MdBlock[] => {
  const blocks: MdBlock[] = [];
  const used = new Map<string, number>();
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) { i += 1; continue; }
    const h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      const base = slugify(h[2]);
      const n = used.get(base) ?? 0;
      used.set(base, n + 1);
      blocks.push({ kind: 'h', level: h[1].length as 1 | 2 | 3, text: h[2].trim(), id: n ? `${base}-${n}` : base });
      i += 1;
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line)) { blocks.push({ kind: 'hr' }); i += 1; continue; }
    if (/^[-*]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      const ordered = /^\d+[.)]\s+/.test(line);
      const re = ordered ? /^\d+[.)]\s+/ : /^[-*]\s+/;
      const items: string[] = [];
      while (i < lines.length && re.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(re, ''));
        i += 1;
      }
      blocks.push({ kind: ordered ? 'ol' : 'ul', items });
      continue;
    }
    if (line.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = cells(lines[i]);
        // «|---|---|» ajratuvchi qatori oʻtkazib yuboriladi
        if (!row.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(row);
        i += 1;
      }
      blocks.push({ kind: 'table', head: rows[0] ?? [], rows: rows.slice(1) });
      continue;
    }
    if (line.startsWith('>')) {
      const parts: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        parts.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push({ kind: 'quote', text: parts.join(' ') });
      continue;
    }
    const parts: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|[-*]\s|\d+[.)]\s|>|\||-{3,}$)/.test(lines[i].trim())) {
      parts.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ kind: 'p', text: parts.join(' ') });
  }
  return blocks;
};

/** **qalin** va *kursiv* belgilarini elementlarga aylantiradi */
export const inline = (text: string): ReactNode[] =>
  text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((part, k) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={k}>{part.slice(1, -1)}</em>;
    return <Fragment key={k}>{part}</Fragment>;
  });

export const Markdown = ({ blocks }: { blocks: MdBlock[] }) => (
  <>
    {blocks.map((b, k) => {
      switch (b.kind) {
        case 'h': {
          const Tag = (`h${b.level + 1}`) as 'h2' | 'h3' | 'h4';
          return <Tag key={k} id={b.id}>{inline(b.text)}</Tag>;
        }
        case 'ul': return <ul key={k}>{b.items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>;
        case 'ol': return <ol key={k}>{b.items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>;
        case 'quote': return <blockquote key={k}>{inline(b.text)}</blockquote>;
        case 'table':
          return (
            <div key={k} className="lecture-table">
              <table>
                <thead><tr>{b.head.map((c, j) => <th key={j}>{inline(c)}</th>)}</tr></thead>
                <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, n) => <td key={n}>{inline(c)}</td>)}</tr>)}</tbody>
              </table>
            </div>
          );
        case 'hr': return <hr key={k} />;
        default: return <p key={k}>{inline(b.text)}</p>;
      }
    })}
  </>
);

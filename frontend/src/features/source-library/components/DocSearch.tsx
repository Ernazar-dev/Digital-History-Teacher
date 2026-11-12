import { CloseOutlined, DownOutlined, SearchOutlined, UpOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import { type RefObject, useCallback, useEffect, useState } from 'react';
import i18n from '@/i18n';

const MAX_MATCHES = 1000;
const MIN_LENGTH = 2;

/** Apostrof körinişlari bir xil sanaladi (' ‘ ’ ʻ ’ ` ´ ′) — birma-bir almashadi, matn örinlari saqlanadi */
const fold = (text: string) => text.replace(/[‘’ʻ’`´′]/g, "'");

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

type Highlights = { set: (name: string, h: unknown) => void; delete: (name: string) => void };
const registry = (): Highlights | null => (typeof CSS !== 'undefined' && 'highlights' in CSS ? (CSS as unknown as { highlights: Highlights }).highlights : null);
const makeHighlight = (ranges: Range[]) => new (window as unknown as { Highlight: new (...r: Range[]) => unknown }).Highlight(...ranges);

/** Ildiz içidagi barcha matn tugunlari birlaştirib qidiriladi — qalin/kursiv bilan bölingan sözlar ham topiladi */
const findRanges = (root: HTMLElement, query: string): Range[] => {
  const nodes: { node: Text; start: number }[] = [];
  let text = '';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement?.closest('script,style,noscript') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    nodes.push({ node: n, start: text.length });
    text += fold(n.data);
  }
  if (!nodes.length) return [];
  const re = new RegExp(fold(query).trim().split(/\s+/).map(escapeRe).join('\\s+'), 'giu');

  /** pos qaysi tugunga tög'ri keladi; çegarada boşlaniş keyingi tugundan, tugaş oldingi tugundan olinadi */
  const locate = (pos: number, atEnd: boolean) => {
    const found = nodes.find((n) => (atEnd ? pos > n.start && pos <= n.start + n.node.length : pos >= n.start && pos < n.start + n.node.length));
    const n = found ?? nodes[nodes.length - 1];
    return { node: n.node, offset: Math.min(pos - n.start, n.node.length) };
  };

  const ranges: Range[] = [];
  for (let m = re.exec(text); m && ranges.length < MAX_MATCHES; m = re.exec(text)) {
    if (!m[0]) {
      re.lastIndex += 1;
      continue;
    }
    const a = locate(m.index, false);
    const b = locate(m.index + m[0].length, true);
    const range = document.createRange();
    range.setStart(a.node, a.offset);
    range.setEnd(b.node, b.offset);
    ranges.push(range);
  }
  return ranges;
};

/**
 * Sahifadagi matn içidan qidiriş: topilgan joylar ajratib körsatiladi, «keyingi/oldingi» tugmalari va Enter bilan
 * ötiladi. DOM özgartirilmaydi (CSS Custom Highlight API) — React va Word köruvçisi buzilmaydi.
 */
export const DocSearch = ({ rootRef, ready, initial = '' }: { rootRef: RefObject<HTMLElement | null>; ready: boolean; initial?: string }) => {
  const [value, setValue] = useState(initial);
  const [query, setQuery] = useState(initial.trim());
  const [ranges, setRanges] = useState<Range[]>([]);
  const [index, setIndex] = useState(0);

  // Sörov yozib bölingaç (keçikiş bilan) qidiriladi
  useEffect(() => {
    const t = window.setTimeout(() => setQuery(value.trim()), 250);
    return () => window.clearTimeout(t);
  }, [value]);

  useEffect(() => {
    const root = rootRef.current;
    setIndex(0);
    setRanges(ready && root && query.length >= MIN_LENGTH ? findRanges(root, query) : []);
  }, [query, ready, rootRef]);

  // Barcha topilganlar + joriysi ajratiladi va ekranga olib kelinadi
  useEffect(() => {
    const hl = registry();
    if (hl) {
      if (ranges.length) {
        hl.set('doc-search', makeHighlight(ranges));
        hl.set('doc-search-active', makeHighlight([ranges[index] ?? ranges[0]]));
      } else {
        hl.delete('doc-search');
        hl.delete('doc-search-active');
      }
    }
    const current = ranges[index];
    if (!current) return;
    current.startContainer.parentElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (!hl) {
      // Eski brauzerlar: topilgan joy oddiy tanlov sifatida körsatiladi
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(current);
    }
  }, [ranges, index]);

  useEffect(
    () => () => {
      registry()?.delete('doc-search');
      registry()?.delete('doc-search-active');
    },
    [],
  );

  const step = useCallback((d: 1 | -1) => setIndex((i) => (ranges.length ? (i + d + ranges.length) % ranges.length : 0)), [ranges.length]);
  const tooShort = value.trim().length > 0 && value.trim().length < MIN_LENGTH;

  return (
    <div className="flex items-center gap-1" role="search">
      <Input
        size="small"
        allowClear={{ clearIcon: <CloseOutlined aria-label={i18n.t('reader.clear')} /> }}
        prefix={<SearchOutlined className="text-muted" />}
        placeholder={i18n.t('reader.searchInText')}
        aria-label="Matn içidan qidiriş"
        className="!w-44 sm:!w-60"
        value={value}
        status={ready && query.length >= MIN_LENGTH && ranges.length === 0 ? 'warning' : undefined}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            step(e.shiftKey ? -1 : 1);
          } else if (e.key === 'Escape') setValue('');
        }}
      />
      {query.length >= MIN_LENGTH && (
        <span className="min-w-[3.5rem] text-center text-xs tabular-nums text-muted" aria-live="polite">
          {ranges.length ? `${index + 1} / ${ranges.length}${ranges.length >= MAX_MATCHES ? '+' : ''}` : ready ? i18n.t('reader.notFound') : '...'}
        </span>
      )}
      {tooShort && <span className="text-xs text-muted">kamida {MIN_LENGTH} harf</span>}
      <Button size="small" type="text" icon={<UpOutlined />} disabled={ranges.length < 2} onClick={() => step(-1)} aria-label={i18n.t('reader.prevMatch')} />
      <Button size="small" type="text" icon={<DownOutlined />} disabled={ranges.length < 2} onClick={() => step(1)} aria-label={i18n.t('reader.nextMatch')} />
    </div>
  );
};

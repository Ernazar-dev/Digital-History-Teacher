import { ArrowUpOutlined, DownloadOutlined, OrderedListOutlined } from '@ant-design/icons';
import { App, Button, Tooltip } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { downloadLectureDocx } from '@/lib/lectureDocx';
import { Markdown, parseMarkdown } from '@/lib/markdown';

/** Taxminiy hajm: kitob sahifasida ~300 so'z, o'qish tezligi ~180 so'z/daqiqa */
const sizeOf = (text: string) => {
  const words = text.split(/\s+/).filter(Boolean).length;
  return { pages: Math.max(1, Math.round(words / 300)), minutes: Math.max(1, Math.round(words / 180)) };
};

/** Shrift o'lchamlari (rem) — tanlov brauzerda eslab qolinadi */
const SIZES = [0.9375, 1.0625, 1.1875, 1.3125];
const SIZE_KEY = 'dht.lecture.size';
const readSize = () => {
  try {
    const v = Number(localStorage.getItem(SIZE_KEY));
    return SIZES.includes(v) ? v : SIZES[1];
  } catch {
    return SIZES[1];
  }
};

/**
 * Ma'ruza matni: chapda reja (joriy bo'lim belgilanadi), o'ngda kitobdek o'qiladigan matn.
 * Tepada o'qish progressi, shrift o'lchamini o'zgartirish va ma'ruzani Word (.docx) qilib yuklab olish tugmalari.
 */
export const LectureReader = ({ content, title }: { content: string; title?: string }) => {
  const blocks = useMemo(() => parseMarkdown(content), [content]);
  const { message } = App.useApp();
  const [saving, setSaving] = useState(false);
  const download = async () => {
    setSaving(true);
    try {
      const h1 = blocks.find((b) => b.kind === 'h' && b.level === 1);
      await downloadLectureDocx(blocks, title || (h1?.kind === 'h' ? h1.text : 'Ma’ruza'));
    } catch {
      message.error('Faylni tayyorlab bo‘lmadi. Qayta urinib ko‘ring.');
    } finally {
      setSaving(false);
    }
  };
  const plan = useMemo(
    () => blocks.filter((b): b is Extract<typeof b, { kind: 'h' }> => b.kind === 'h' && b.level === 2),
    [blocks],
  );
  const { pages, minutes } = useMemo(() => sizeOf(content), [content]);
  const articleRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState(readSize);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(plan[0]?.id ?? null);

  const changeSize = (d: -1 | 1) => {
    const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, SIZES.indexOf(size) + d))];
    setSize(next);
    try {
      localStorage.setItem(SIZE_KEY, String(next));
    } catch {
      /* brauzer xotirasi yopiq bo'lsa — faqat shu sahifada amal qiladi */
    }
  };

  // O'qish progressi va joriy bo'lim: maqola ichida qancha o'qilgani
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return undefined;
    const heads = plan.map((h) => document.getElementById(h.id)).filter((x): x is HTMLElement => Boolean(x));
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setProgress(Math.min(100, Math.max(0, ((-r.top + window.innerHeight * 0.2) / Math.max(total, 1)) * 100)));
      const current = [...heads].reverse().find((h) => h.getBoundingClientRect().top < 140);
      setActiveId(current?.id ?? heads[0]?.id ?? null);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [plan]);

  const toc = plan.length > 1 && (
    <nav aria-label="Ma’ruza rejasi">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        <OrderedListOutlined /> Reja
      </div>
      <ol className="m-0 list-none space-y-0.5 border-0 border-l-2 border-solid border-line p-0">
        {plan.map((h) => {
          const on = h.id === activeId;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={on ? 'location' : undefined}
                className={`-ml-0.5 block border-0 border-l-2 border-solid py-1.5 pl-3 pr-2 text-sm leading-snug no-underline transition-colors ${
                  on ? 'border-accent font-semibold text-primary' : 'border-transparent text-ink/75 hover:text-primary'
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <div>
      {/* Ingichka o'qish progressi — ekran tepasida */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent" aria-hidden>
        <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <div className="sticky top-[4.5rem] z-10 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-solid border-line bg-white/95 px-4 py-2 shadow-sm backdrop-blur">
        <span className="text-sm text-muted">≈ {pages} bet · {minutes} daqiqa · <b className="text-ink">{Math.round(progress)}%</b> o‘qildi</span>
        <span className="flex flex-wrap items-center gap-2">
          <span className="flex items-center rounded-lg border border-solid border-line" role="group" aria-label="Shrift o‘lchami">
            <Tooltip title="Kichikroq shrift">
              <Button type="text" size="small" disabled={size === SIZES[0]} onClick={() => changeSize(-1)} aria-label="Shriftni kichraytirish">A−</Button>
            </Tooltip>
            <Tooltip title="Kattaroq shrift">
              <Button type="text" size="small" disabled={size === SIZES[SIZES.length - 1]} onClick={() => changeSize(1)} aria-label="Shriftni kattalashtirish" className="!text-base">A+</Button>
            </Tooltip>
          </span>
          <Button size="small" type="primary" icon={<DownloadOutlined />} loading={saving} onClick={download}>
            Yuklab olish (Word)
          </Button>
        </span>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-auto">{toc}</div>
        </aside>
        <div className="min-w-0">
          {toc && (
            <details className="mb-6 rounded-xl border border-solid border-line bg-canvas p-3 lg:hidden">
              <summary className="cursor-pointer font-medium">Ma’ruza rejasi</summary>
              <div className="mt-3">{toc}</div>
            </details>
          )}
          <article ref={articleRef} className="lecture mx-auto" style={{ fontSize: `${size}rem` }}>
            <Markdown blocks={blocks} />
          </article>
        </div>
      </div>

      {progress > 8 && (
        <Button
          shape="circle"
          size="large"
          type="primary"
          icon={<ArrowUpOutlined />}
          aria-label="Yuqoriga"
          className="!fixed bottom-6 right-6 z-40 shadow-lift"
          onClick={() => articleRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
      )}
    </div>
  );
};

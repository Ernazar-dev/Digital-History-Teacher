import { ArrowUpOutlined, DownloadOutlined, OrderedListOutlined } from '@ant-design/icons';
import { Button, Spin, Tooltip } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import i18n from '@/i18n';
import { sanitizeDom } from '@/lib/sanitizeDom';
import type { MediaFileRef } from '@/types/api';
import { fileKind, mediaFileUrl } from '../files';
import { DocSearch } from './DocSearch';
import { FileBadge } from './MaterialViewer';

/** Şrift ölçamlari (rem) — tanlov brauzerda eslab qolinadi */
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

interface Heading { id: string; text: string }

const loadBuffer = async (id: string) => {
  const res = await fetch(mediaFileUrl(id), { credentials: 'include' });
  if (!res.ok) throw new Error(String(res.status));
  return res.arrayBuffer();
};

/**
 * Word hujjatini qoğoz sahifalari körinişida emas, ekranga moslashadigan oqma matn qilib çizadi:
 * sayt şrifti, qulay qator uzunligi, sahifa hoşiyalarisiz. Sarlavhalardan «Reja» tuziladi.
 */
const DocxReader = ({ file, size, onHeadings }: { file: MediaFileRef; size: number; onHeadings: (h: Heading[]) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    const el = ref.current;
    (async () => {
      const [{ renderAsync }, buf] = await Promise.all([import('docx-preview'), loadBuffer(file.id)]);
      if (!alive || !el) return;
      await renderAsync(buf, el, undefined, {
        className: 'docx',
        inWrapper: false,
        breakPages: false,
        ignoreWidth: true,
        ignoreHeight: true,
        ignoreFonts: true,
        ignoreLastRenderedPageBreak: true,
        renderHeaders: false,
        renderFooters: false,
        renderFootnotes: true,
      });
      sanitizeDom(el);
      // Matn boşidagi ortiqça böş joy (böş abzatslar, sahifa uzilişi, tepadan katta masofa) olib taşlanadi — hamma fayllar uçun
      for (const p of Array.from(el.querySelectorAll('p'))) {
        if (p.textContent?.trim() || p.querySelector('img,svg,table')) {
          p.style.marginTop = '0';
          p.style.paddingTop = '0';
          break;
        }
        p.remove();
      }
      el.querySelectorAll('br[style*="page-break"]').forEach((br) => br.remove());
      // Word sahifasining tepa/past hoşiyasi (≈2 sm) ekranda böş joy bölib qolmasin
      el.querySelectorAll<HTMLElement>('section.docx').forEach((sec) => {
        sec.style.paddingTop = '0';
        sec.style.paddingBottom = '0';
        sec.style.minHeight = '0';
      });
      // «Reja»: 1-darajali sarlavhalar (Word'dagi «Sarlavha 1» uslubi)
      const heads = [...el.querySelectorAll<HTMLElement>('[class*="heading1" i]')]
        .map((h, i) => ({ el: h, text: h.textContent?.trim() ?? '', id: `bolim-${i + 1}` }))
        .filter((h) => h.text);
      heads.forEach((h) => { h.el.id = h.id; });
      if (alive) {
        onHeadings(heads.map(({ id, text }) => ({ id, text })));
        setState('ready');
      }
    })().catch(() => alive && setState('error'));
    return () => {
      alive = false;
      if (el) el.innerHTML = '';
    };
  }, [file.id, onHeadings]);

  return (
    <>
      {state === 'loading' && <div className="flex min-h-[40vh] items-center justify-center"><Spin size="large" tip={i18n.t('reader.opening')} /></div>}
      {state === 'error' && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted">
          <p className="m-0 max-w-sm">{i18n.t('reader.cantShow')}</p>
          <a href={mediaFileUrl(file.id)} download={file.originalName}><Button icon={<DownloadOutlined />}>{i18n.t('reader.download')}</Button></a>
        </div>
      )}
      <div ref={ref} className={`lecture-doc ${state === 'ready' ? '' : 'hidden'}`} style={{ fontSize: `${size}rem` }} />
    </>
  );
};

/** PDF brauzerning öz köruvçisida — ekran balandligiga moslab */
const PdfReader = ({ file }: { file: MediaFileRef }) => {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let url: string | null = null;
    let alive = true;
    loadBuffer(file.id)
      .then((buf) => {
        url = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' }));
        if (alive) setSrc(url);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file.id]);
  if (failed) return <p className="py-16 text-center text-muted">{i18n.t('reader.pdfFail')}</p>;
  if (!src) return <div className="flex min-h-[40vh] items-center justify-center"><Spin size="large" /></div>;
  return <iframe title={file.originalName} src={src} className="block h-[calc(100vh-11rem)] min-h-[520px] w-full rounded-xl border border-solid border-line bg-white" />;
};

/** Ma'ruza fayli: tepada qisqa panel (fayl, şrift, yuklab oliş), çapda reja, öngda öqiladigan matn */
/** `initialQuery` — röyxatdagi qidiruvdan kelgan söz: Word hujjat oçilgaç şu söz darhol topiladi */
export const LectureFileView = ({ file, initialQuery = '' }: { file: MediaFileRef; initialQuery?: string }) => {
  const isDocx = fileKind(file) === 'docx';
  const [size, setSize] = useState(readSize);
  const [heads, setHeads] = useState<Heading[]>([]);
  const [docReady, setDocReady] = useState(false);
  const docRef = useRef<HTMLDivElement>(null);
  const onLoaded = useCallback((h: Heading[]) => {
    setHeads(h);
    setDocReady(true);
  }, []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  const changeSize = (d: -1 | 1) => {
    const next = SIZES[Math.min(SIZES.length - 1, Math.max(0, SIZES.indexOf(size) + d))];
    setSize(next);
    try {
      localStorage.setItem(SIZE_KEY, String(next));
    } catch {
      /* brauzer xotirasi yopiq — faqat şu sahifada amal qiladi */
    }
  };

  // Öqiş progressi va joriy bölim
  useEffect(() => {
    if (!isDocx) return undefined;
    const onScroll = () => {
      const el = bodyRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setProgress(Math.min(100, Math.max(0, ((-r.top + window.innerHeight * 0.2) / Math.max(total, 1)) * 100)));
      const current = [...heads].reverse().find((h) => (document.getElementById(h.id)?.getBoundingClientRect().top ?? 1e9) < 140);
      setActiveId(current?.id ?? heads[0]?.id ?? null);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [heads, isDocx]);

  const toc = heads.length > 1 && (
    <nav aria-label={i18n.t('reader.toc')}>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted"><OrderedListOutlined /> {i18n.t('reader.plan')}</div>
      <ol className="m-0 list-none space-y-0.5 border-0 border-l-2 border-solid border-line p-0">
        {heads.map((h) => {
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
      {isDocx && (
        <div className="fixed inset-x-0 top-0 z-50 h-1" aria-hidden>
          <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="sticky top-[4.5rem] z-10 mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-solid border-line bg-white/95 px-3 py-2 shadow-sm backdrop-blur md:px-4">
        <FileBadge file={file} />
        <span className="flex flex-wrap items-center gap-2">
          {isDocx && <DocSearch rootRef={docRef} ready={docReady} initial={initialQuery} />}
          {isDocx && (
            <span className="flex items-center rounded-lg border border-solid border-line" role="group" aria-label={i18n.t('reader.fontSize')}>
              <Tooltip title={i18n.t('reader.smaller')}>
                <Button type="text" size="small" disabled={size === SIZES[0]} onClick={() => changeSize(-1)} aria-label={i18n.t('reader.smallerAria')}>A−</Button>
              </Tooltip>
              <Tooltip title={i18n.t('reader.larger')}>
                <Button type="text" size="small" disabled={size === SIZES[SIZES.length - 1]} onClick={() => changeSize(1)} aria-label={i18n.t('reader.largerAria')} className="!text-base">A+</Button>
              </Tooltip>
            </span>
          )}
          <a href={mediaFileUrl(file.id)} download={file.originalName}>
            <Button type="primary" size="small" icon={<DownloadOutlined />}>{i18n.t('reader.download')}</Button>
          </a>
        </span>
      </div>

      {isDocx ? (
        <div className={toc ? 'grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]' : ''}>
          {toc && (
            <aside className="hidden lg:block">
              <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-auto">{toc}</div>
            </aside>
          )}
          <div ref={bodyRef} className="min-w-0">
            {toc && (
              <details className="mb-5 rounded-xl border border-solid border-line bg-canvas p-3 lg:hidden">
                <summary className="cursor-pointer font-medium">{i18n.t('reader.toc')}</summary>
                <div className="mt-3">{toc}</div>
              </details>
            )}
            <div ref={docRef}>
              <DocxReader file={file} size={size} onHeadings={onLoaded} />
            </div>
          </div>
        </div>
      ) : (
        <PdfReader file={file} />
      )}

      {isDocx && progress > 8 && (
        <Button
          shape="circle"
          size="large"
          type="primary"
          icon={<ArrowUpOutlined />}
          aria-label={i18n.t('reader.toTop')}
          className="!fixed bottom-6 right-6 z-40 shadow-lift"
          onClick={() => bodyRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
      )}
    </div>
  );
};

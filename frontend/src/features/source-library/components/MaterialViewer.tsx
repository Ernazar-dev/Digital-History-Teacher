import {
  DownloadOutlined, ExpandOutlined, FileImageOutlined, FileOutlined, FilePdfOutlined, FilePptOutlined,
  FileWordOutlined, PlayCircleOutlined, SoundOutlined,
} from '@ant-design/icons';
import { Button, Image, Spin } from 'antd';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { sanitizeDom } from '@/lib/sanitizeDom';
import type { MediaFileRef } from '@/types/api';
import { fileKind, formatSize, KIND_LABEL, mediaFileUrl, type FileKind } from '../files';

export const KIND_ICON: Record<FileKind, ReactNode> = {
  pdf: <FilePdfOutlined />, docx: <FileWordOutlined />, pptx: <FilePptOutlined />, image: <FileImageOutlined />,
  audio: <SoundOutlined />, video: <PlayCircleOutlined />, other: <FileOutlined />,
};
export const KIND_TONE: Record<FileKind, string> = {
  pdf: 'bg-red-50 text-red-600', docx: 'bg-blue-50 text-blue-600', pptx: 'bg-orange-50 text-orange-600',
  image: 'bg-emerald-50 text-emerald-600', audio: 'bg-violet-50 text-violet-600', video: 'bg-violet-50 text-violet-600',
  other: 'bg-canvas text-muted',
};

const loadBuffer = async (id: string) => {
  const res = await fetch(mediaFileUrl(id), { credentials: 'include' });
  if (!res.ok) throw new Error(String(res.status));
  return res.arrayBuffer();
};

type Render = (buf: ArrayBuffer, el: HTMLDivElement) => Promise<unknown>;

const Failed = ({ file }: { file: MediaFileRef }) => (
  <div className="flex flex-col items-center gap-3 py-16 text-center text-muted">
    <span className="text-4xl">{KIND_ICON[fileKind(file)]}</span>
    <p className="m-0 max-w-sm">Faylni sahifada ko‘rsatib bo‘lmadi. Uni yuklab olib oching.</p>
    <a href={mediaFileUrl(file.id)} download={file.originalName}><Button icon={<DownloadOutlined />}>Yuklab olish</Button></a>
  </div>
);

/** Hujjatni yuklab, berilgan render funksiyasi bilan sahifaga chizadi (Word, PowerPoint) */
const Rendered = ({ file, render, className }: { file: MediaFileRef; render: Render; className: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    let alive = true;
    const el = ref.current;
    loadBuffer(file.id)
      .then((buf) => (alive && el ? render(buf, el) : null))
      .then(() => alive && setState('ready'))
      .catch(() => alive && setState('error'));
    return () => {
      alive = false;
      if (el) el.innerHTML = '';
    };
  }, [file.id, render]);
  return (
    <div className="relative min-h-[320px]">
      {state === 'loading' && <div className="absolute inset-0 flex items-center justify-center"><Spin size="large" /></div>}
      {state === 'error' && <Failed file={file} />}
      <div ref={ref} className={state === 'error' ? 'hidden' : className} />
    </div>
  );
};

const renderDocx: Render = async (buf, el) => {
  const { renderAsync } = await import('docx-preview');
  await renderAsync(buf, el, undefined, { className: 'docx', inWrapper: true, breakPages: true, ignoreLastRenderedPageBreak: true });
  sanitizeDom(el);
};

const renderPptx: Render = async (buf, el) => {
  const { init } = await import('pptx-preview');
  const width = Math.min(el.clientWidth || 960, 1100);
  await init(el, { width, height: Math.round((width * 9) / 16), mode: 'list' }).preview(buf);
  sanitizeDom(el);
};

/** PDF brauzerning o'z ko'ruvchisida — blob URL orqali (API javobidagi frame-ancestors cheklovi ta'sir qilmaydi) */
const PdfView = ({ file }: { file: MediaFileRef }) => {
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
  if (failed) return <Failed file={file} />;
  if (!src) return <div className="flex h-[60vh] items-center justify-center"><Spin size="large" /></div>;
  return <iframe title={file.originalName} src={src} className="block h-[78vh] min-h-[480px] w-full rounded-xl border-0 bg-white" />;
};

const Viewer = ({ file }: { file: MediaFileRef }) => {
  const url = mediaFileUrl(file.id);
  switch (fileKind(file)) {
    case 'pdf': return <PdfView file={file} />;
    case 'docx': return <Rendered file={file} render={renderDocx} className="doc-host max-h-[78vh] overflow-auto rounded-xl" />;
    case 'pptx': return <Rendered file={file} render={renderPptx} className="doc-host mx-auto max-h-[78vh] overflow-auto rounded-xl" />;
    case 'image': return <div className="flex justify-center [&_img]:max-h-[72vh] [&_img]:object-contain"><Image src={url} alt={file.originalName} className="rounded-xl" /></div>;
    case 'audio': return <div className="px-2 py-10"><audio src={url} controls className="w-full" /></div>;
    case 'video': return <video src={url} controls className="max-h-[72vh] w-full rounded-xl bg-black" />;
    default: return <Failed file={file} />;
  }
};

export const FileBadge = ({ file }: { file: MediaFileRef }) => {
  const k = fileKind(file);
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg ${KIND_TONE[k]}`}>{KIND_ICON[k]}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-ink">{file.originalName}</span>
        <span className="block text-xs text-muted">{KIND_LABEL[k]} · {formatSize(file.size)}</span>
      </span>
    </span>
  );
};

/** O'quv materiallari: yuqorida fayllar ro'yxati, pastda tanlangan fayl sahifaning o'zida ochiladi */
export const MaterialViewer = ({ files }: { files: MediaFileRef[] }) => {
  const [activeId, setActiveId] = useState(files[0]?.id);
  const stageRef = useRef<HTMLDivElement>(null);
  const active = files.find((f) => f.id === activeId) ?? files[0];
  if (!active) return null;

  return (
    <div className="space-y-4">
      {files.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="O‘quv materiallari">
          {files.map((f) => {
            const on = f.id === active.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActiveId(f.id)}
                className={`w-[240px] shrink-0 cursor-pointer rounded-xl border border-solid p-3 text-left transition-colors ${
                  on ? 'border-primary bg-primary-soft' : 'border-line bg-white hover:border-primary/40'
                }`}
              >
                <FileBadge file={f} />
              </button>
            );
          })}
        </div>
      )}

      <div ref={stageRef} className="overflow-hidden rounded-2xl border border-solid border-line bg-canvas">
        <div className="flex flex-wrap items-center justify-between gap-3 border-0 border-b border-solid border-line bg-white px-4 py-3">
          <FileBadge file={active} />
          <div className="flex gap-2">
            <Button icon={<ExpandOutlined />} onClick={() => stageRef.current?.requestFullscreen?.()} aria-label="To‘liq ekranda ochish">
              <span className="hidden sm:inline">To‘liq ekran</span>
            </Button>
            <a href={mediaFileUrl(active.id)} download={active.originalName}>
              <Button type="primary" icon={<DownloadOutlined />} aria-label="Yuklab olish"><span className="hidden sm:inline">Yuklab olish</span></Button>
            </a>
          </div>
        </div>
        <div className="p-3 md:p-5">
          <Viewer key={active.id} file={active} />
        </div>
      </div>
    </div>
  );
};

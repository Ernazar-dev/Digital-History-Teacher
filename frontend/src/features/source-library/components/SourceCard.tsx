import { ArrowRightOutlined, BookOutlined, FileWordOutlined, FilePptOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { SourceListItem } from '@/types/api';
import { coverOf } from '../files';

const Has = ({ on, icon, label }: { on: boolean; icon: ReactNode; label: string }) => (
  <Tooltip title={on ? label : `${label} hali qo‘shilmagan`}>
    <span
      aria-label={on ? label : `${label} hali yo‘q`}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm backdrop-blur ${on ? 'bg-white/90 text-primary' : 'bg-black/30 text-white/50'}`}
    >
      {icon}
    </span>
  </Tooltip>
);

/** Bosh sahifadagi «Meros» kartochkalari uslubida: katta afisha, oltin davr yozuvi, serif sarlavha, strelka */
export const SourceCard = ({ s, base, q }: { s: SourceListItem; base: string; q?: string }) => {
  // Qidiruvdan kelingan bo'lsa — so'z mavzu/kitob ichida ham darhol topiladi
  const href = q ? `${base}/${s.slug}?izlash=${encodeURIComponent(q)}` : `${base}/${s.slug}`;
  const cover = coverOf(s);

  return (
    <Link to={href} className="group flex h-full flex-col no-underline">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-primary-soft">
        {cover ? (
          <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover object-[50%_30%] transition-transform duration-[1200ms] ease-premium group-hover:scale-105" />
        ) : (
          <div className="pattern-girih flex h-full w-full items-center justify-center text-6xl text-primary/30"><BookOutlined /></div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" aria-hidden />
        <span className="absolute bottom-4 left-4 flex gap-1.5">
          {s.author ? <Has on icon={<FileWordOutlined />} label="Kitob" /> : <Has on={Boolean(s.hasLecture)} icon={<BookOutlined />} label="Ma’ruza" />}
          <Has on={Boolean(s.presentationFileId)} icon={<FilePptOutlined />} label="Taqdimot" />
          <Has on={Boolean(s.videoUrl || s.videoFileId)} icon={<PlayCircleOutlined />} label="Video" />
        </span>
      </div>
      <div className="mt-4 flex flex-1 items-start justify-between gap-4">
        <div className="min-w-0">
          {s.author && <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-accent">{s.author}</div>}
          <h3 className="font-serif-title m-0 mt-1 text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-primary">{s.title}</h3>
          <p className="mb-0 mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{s.summary}</p>
        </div>
        <ArrowRightOutlined className="mt-6 shrink-0 text-primary transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
};

import {
  ArrowRightOutlined, AudioOutlined, BankOutlined, CheckOutlined, DiffOutlined, EnvironmentOutlined, FileTextOutlined,
  PictureOutlined, VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { SOURCE_TYPE } from '@/lib/labels';
import type { SourceListItem, SourceType } from '@/types/api';
import { useCompareStore } from '../compare.store';
import { mediaFileUrl } from '../files';

const isImage = (url: string | null) => Boolean(url && /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(url));

const TYPE_ICON: Record<SourceType, ReactNode> = {
  WRITTEN: <FileTextOutlined />, VISUAL: <PictureOutlined />, MAP: <EnvironmentOutlined />, AUDIO: <AudioOutlined />,
  VIDEO: <VideoCameraOutlined />, ARCHAEOLOGICAL: <BankOutlined />,
};

/** Bosh sahifadagi «Meros» kartochkalari uslubida: katta rasm, oltin turkum yozuvi, serif sarlavha */
export const SourceCard = ({ s, base, canCompare }: { s: SourceListItem; base: string; canCompare?: boolean }) => {
  const { ids, toggle } = useCompareStore();
  const selected = ids.includes(s.id);
  const href = `${base}/${s.slug}`;
  const coverUrl = s.mediaFile?.mimeType.startsWith('image/') ? mediaFileUrl(s.mediaFile.id) : isImage(s.mediaUrl) ? s.mediaUrl : null;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-solid border-line bg-white transition-shadow duration-300 hover:shadow-lift">
      <Link to={href} className="relative block aspect-[16/10] overflow-hidden bg-primary-soft" tabIndex={-1} aria-hidden>
        {coverUrl ? (
          <img src={coverUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-premium group-hover:scale-105" />
        ) : (
          <div className="pattern-girih flex h-full w-full items-center justify-center text-5xl text-primary/40">{TYPE_ICON[s.type]}</div>
        )}
        {s.period && (
          <span className="absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">
            {s.period.name}
          </span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col p-5">
        <div className="text-xs font-medium uppercase tracking-wider text-accent">{SOURCE_TYPE[s.type]}</div>
        <Link to={href} className="mt-1 no-underline">
          <h3 className="font-serif-title m-0 text-lg font-semibold leading-snug text-ink transition-colors group-hover:text-primary">{s.title}</h3>
        </Link>
        <p className="mb-4 mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{s.summary}</p>
        <div className="flex items-center justify-between gap-2">
          <Link to={href} className="inline-flex items-center gap-2 text-sm font-medium no-underline">
            Ochish <ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          {canCompare && (
            <Tooltip title="Taqqoslash ishi uchun tanlash (2–4 ta)">
              <Button size="small" type={selected ? 'primary' : 'default'} icon={selected ? <CheckOutlined /> : <DiffOutlined />} onClick={() => toggle(s.id)}>
                {selected ? 'Tanlandi' : 'Taqqoslash'}
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </article>
  );
};

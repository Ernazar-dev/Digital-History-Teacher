import { BankOutlined, BookOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Empty, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/motion/motion';
import { OBJECT_TYPE, SOURCE_TYPE } from '@/lib/labels';
import type { TimelinePeriod } from '@/services/explore.service';
import { yearLabel } from '@/utils/format';

const years = (p: TimelinePeriod) =>
  [yearLabel(p.startYear), yearLabel(p.endYear)].filter(Boolean).join(' – ') || 'Yillar ko‘rsatilmagan';

const PeriodCard = ({ p, onShowOnMap }: { p: TimelinePeriod; onShowOnMap?: () => void }) => (
  <article className="overflow-hidden rounded-2xl border border-solid border-line bg-white shadow-sm transition-shadow duration-300 hover:shadow-lift">
    <div className="relative aspect-[16/7] overflow-hidden bg-primary">
      {p.coverUrl && <img src={p.coverUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-premium hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/10 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary backdrop-blur">{years(p)}</span>
      <h3 className="font-serif-title absolute inset-x-4 bottom-3 m-0 text-xl font-semibold leading-snug text-white">{p.name}</h3>
    </div>
    <div className="space-y-4 p-5">
      {p.description && <p className="m-0 text-sm leading-relaxed text-muted">{p.description}</p>}
      {p.topics.length > 0 && <div>{p.topics.map((t) => <Tag key={t.id} className="mb-1 whitespace-normal">{t.name}</Tag>)}</div>}

      {p.sources.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><BookOutlined /> Manbalar · {p.sources.length}</div>
          <ul className="m-0 list-none space-y-1.5 p-0 text-sm">
            {p.sources.map((s) => (
              <li key={s.id} className="leading-snug">
                <Link to={`/app/sources/${s.slug}`}>{s.title}</Link>
                <span className="text-muted"> — {SOURCE_TYPE[s.type]}{s.dateLabel ? `, ${s.dateLabel}` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {p.virtualObjects.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted"><BankOutlined /> 3D/360° obyektlar · {p.virtualObjects.length}</div>
          <div className="flex flex-wrap gap-2">
            {p.virtualObjects.map((o) => (
              <Link key={o.id} to={`/app/museum/${o.slug}`} className="flex items-center gap-2 rounded-full border border-solid border-line bg-canvas py-1 pl-1 pr-3 text-sm no-underline transition-colors hover:border-primary/40">
                {o.thumbnailUrl ? (
                  <img src={o.thumbnailUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-xs text-accent"><BankOutlined /></span>
                )}
                <span className="text-ink">{o.title}</span>
                <span className="text-xs text-muted">{OBJECT_TYPE[o.type]}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {p.sources.length + p.virtualObjects.length === 0 && <span className="text-sm text-muted">Bog‘langan manba yo‘q</span>}

      {onShowOnMap && (
        <button type="button" onClick={onShowOnMap} className="flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-medium text-primary">
          <EnvironmentOutlined /> Xaritada ko‘rsatish
        </button>
      )}
    </div>
  </article>
);

/**
 * Davrlar bo'yicha vaqt chizig'i: katta ekranda zig-zag (chap–o'ng), mobil'da bitta ustun.
 * activeId — tanlangan davr ajratib ko'rsatiladi, qolganlari xiralashadi.
 */
export const HistoryTimeline = ({ periods, activeId, onSelect }: { periods: TimelinePeriod[]; activeId?: string; onSelect?: (id: string) => void }) => {
  if (periods.length === 0) return <Empty description="Tarixiy davrlar kiritilmagan" />;
  return (
    <ol className="relative m-0 list-none p-0">
      <span aria-hidden className="absolute bottom-0 left-3 top-0 w-0.5 bg-gradient-to-b from-primary/60 via-line to-line md:left-1/2 md:-translate-x-1/2" />
      {periods.map((p, i) => {
        const on = activeId === p.id;
        const dim = Boolean(activeId) && !on;
        return (
          // Katta ekranda kartalar navbatma-navbat chap/o'ngda — bo'sh joy qolmasligi uchun keyingisi yuqoriga suriladi
          <li key={p.id} className={`relative mb-8 pl-10 last:mb-0 md:grid md:grid-cols-2 md:gap-14 md:pl-0 ${i > 0 ? 'md:-mt-48' : ''}`}>
            <span
              aria-hidden
              className={`absolute left-3 top-6 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 border-solid border-white ring-4 transition-all duration-500 md:left-1/2 ${
                on ? 'scale-125 bg-accent ring-accent/30' : 'bg-primary ring-primary-soft'
              }`}
            />
            <Reveal delay={60} className={i % 2 === 0 ? 'md:col-start-1' : 'md:col-start-2'}>
              <div
                className={`rounded-2xl transition-opacity duration-500 ${on ? 'ring-2 ring-primary ring-offset-4 ring-offset-canvas' : ''} ${
                  dim ? 'opacity-40 hover:opacity-100' : ''
                }`}
              >
                <PeriodCard
                  p={p}
                  onShowOnMap={
                    onSelect
                      ? () => {
                          onSelect(p.id);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      : undefined
                  }
                />
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
};

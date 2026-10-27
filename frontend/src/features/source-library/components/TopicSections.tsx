import { useQuery } from '@tanstack/react-query';
import { Skeleton } from 'antd';
import { catalogService } from '@/services/catalog.service';
import type { Topic } from '@/types/api';

const useTopics = () => useQuery({ queryKey: ['topics'], queryFn: () => catalogService.topics() });

/** Mavzu bo'limlari: talaba bo'limni tanlaydi va shu mavzudagi barcha turdagi manbalarni ko'radi */
export const TopicSections = ({ onSelect }: { onSelect: (t: Topic) => void }) => {
  const topics = useTopics();
  if (topics.isLoading) return <Skeleton active paragraph={{ rows: 2 }} className="mb-6" />;
  const list = (topics.data ?? []).filter((t) => (t._count?.sources ?? 0) > 0);
  if (list.length === 0) return null;
  return (
    <section className="mb-8" aria-label="Mavzu bo‘limlari">
      <h2 className="mb-3 font-serif text-lg font-semibold text-ink">Mavzu bo‘limlari</h2>
      <div className="stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {list.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t)}
            title={t.period?.name ?? undefined}
            className="lift group flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-solid border-line bg-white px-4 py-3 text-left shadow-card transition-colors hover:border-accent"
          >
            <span className="min-w-0">
              <span className="block truncate font-serif text-[15px] font-semibold leading-snug text-ink group-hover:text-primary">{t.name}</span>
              <span className="block truncate text-xs text-muted">{t.period?.name ?? 'Davrlararo mavzu'}</span>
            </span>
            <span className="shrink-0 rounded-full bg-canvas px-2.5 py-0.5 text-sm font-medium text-accent">{t._count?.sources}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

/** Tanlangan mavzu sarlavhasi */
export const TopicBanner = ({ topicId, onClear }: { topicId: string; onClear: () => void }) => {
  const topics = useTopics();
  const t = topics.data?.find((x) => x.id === topicId);
  if (!t) return null;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-solid border-line bg-white px-5 py-4 shadow-card">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted">{t.period?.name ?? 'Mavzu bo‘limi'}</div>
        <div className="font-serif text-xl font-semibold text-ink">{t.name}</div>
        {t.description && <p className="mb-0 mt-1 max-w-prose text-sm text-muted">{t.description}</p>}
      </div>
      <button type="button" onClick={onClear} className="link-underline cursor-pointer border-0 bg-transparent p-0 text-sm text-primary">
        ← Barcha mavzular
      </button>
    </div>
  );
};

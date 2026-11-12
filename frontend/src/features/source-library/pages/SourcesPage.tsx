import { PlusOutlined } from '@ant-design/icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { useAuth } from '@/features/auth/useAuth';
import { useAreaPath } from '@/hooks/useAreaPath';
import { useUrlState } from '@/hooks/useUrlState';
import { sourcesService } from '@/services/catalog.service';
import type { SourceListItem } from '@/types/api';
import { SourceCard } from '../components/SourceCard';

/** Mavzular darslik boʻyicha guruhlanadi: «Oʻzbekiston tarixi, I kitob · 12-mavzu» → «Oʻzbekiston tarixi, I kitob» */
const groupByBook = (items: SourceListItem[]) => {
  const groups = new Map<string, SourceListItem[]>();
  for (const s of items) {
    const book = s.bookLabel?.split(' · ')[0]?.trim() ?? '';
    groups.set(book, [...(groups.get(book) ?? []), s]);
  }
  return [...groups.entries()];
};

export default function SourcesPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useUrlState<{ q?: string }>([]);
  const { sources: base, inApp } = useAreaPath();
  const { isStaff } = useAuth();
  const siteView = useSiteViewStore((s) => s.siteView);
  const query = useQuery({
    queryKey: ['sources', 'library', filters.q ?? ''],
    queryFn: () => sourcesService.list({ q: filters.q, sort: 'order', pageSize: 100 }),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader
        title={t('sources.title')}
        description={t('sources.description')}
        extra={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center md:w-auto">
            <Input.Search
              size="large"
              allowClear
              className="w-full sm:flex-1 md:w-[24rem] md:flex-none"
              placeholder={t('sources.searchPlaceholder')}
              aria-label={t('sources.searchAria')}
              defaultValue={filters.q}
              onSearch={(v) => setFilters({ q: v || undefined })}
            />
            {inApp && isStaff && !siteView && <Link to="/app/admin/sources/new" className="shrink-0"><Button size="large" type="primary" icon={<PlusOutlined />} className="w-full sm:w-auto">{t('sources.add')}</Button></Link>}
          </div>
        }
      />
      <QueryState query={query} isEmpty={(d) => d.data.length === 0} empty={t('sources.empty')}>
        {(d) => (
          <div className="space-y-10">
            {groupByBook(d.data).map(([book, items]) => (
              <section key={book || 'other'} aria-label={book || undefined}>
                {/* Darslik/guruh nomi boʻlmagan mavzular sarlavhasiz chiqadi */}
                {book && <h2 className="font-serif-title mb-4 text-xl font-semibold text-ink">{book}</h2>}
                <div className="stagger grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((s) => <SourceCard key={s.id} s={s} base={base} q={filters.q} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}

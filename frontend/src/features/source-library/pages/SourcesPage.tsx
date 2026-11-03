import { PlusOutlined } from '@ant-design/icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Button, Input } from 'antd';
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

/** Mavzular darslik bo'yicha guruhlanadi: «O‘zbekiston tarixi, I kitob · 12-mavzu» → «O‘zbekiston tarixi, I kitob» */
const groupByBook = (items: SourceListItem[]) => {
  const groups = new Map<string, SourceListItem[]>();
  for (const s of items) {
    const book = s.bookLabel?.split(' · ')[0]?.trim() || 'Boshqa mavzular';
    groups.set(book, [...(groups.get(book) ?? []), s]);
  }
  return [...groups.entries()];
};

export default function SourcesPage() {
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
        title="Raqamli tarixiy manbalar kutubxonasi"
        description="O‘zbekiston tarixi bo‘yicha o‘quv mavzulari. Har bir mavzuda — ma’ruza matni, taqdimot va video rolik."
        extra={
          <>
            <Input.Search
              size="large"
              allowClear
              className="w-full md:w-[26rem]"
              placeholder="Mavzu yoki ma’ruza matnidan qidirish"
              aria-label="Mavzu qidirish"
              defaultValue={filters.q}
              onSearch={(v) => setFilters({ q: v || undefined })}
            />
            {inApp && isStaff && !siteView && <Link to="/app/admin/sources/new"><Button size="large" type="primary" icon={<PlusOutlined />}>Mavzu qo‘shish</Button></Link>}
          </>
        }
      />
      <QueryState query={query} isEmpty={(d) => d.data.length === 0} empty="Mos mavzu topilmadi.">
        {(d) => (
          <div className="space-y-10">
            {groupByBook(d.data).map(([book, items]) => (
              <section key={book} aria-label={book}>
                <h2 className="font-serif-title mb-4 text-xl font-semibold text-ink">{book}</h2>
                <div className="stagger grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((s) => <SourceCard key={s.id} s={s} base={base} />)}
                </div>
              </section>
            ))}
          </div>
        )}
      </QueryState>
    </>
  );
}

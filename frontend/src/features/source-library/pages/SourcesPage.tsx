import { PlusOutlined } from '@ant-design/icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Button, Pagination } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useAreaPath } from '@/hooks/useAreaPath';
import { useUrlState } from '@/hooks/useUrlState';
import { sourcesService, type SourceFilters as F } from '@/services/catalog.service';
import { CompareTray } from '../components/CompareTray';
import { SourceCard } from '../components/SourceCard';
import { SourceFilters } from '../components/SourceFilters';
import { TopicBanner, TopicSections } from '../components/TopicSections';

export default function SourcesPage() {
  const [filters, setFilters] = useUrlState<F & Record<string, string | number | undefined>>(['page']);
  const { sources: base, inApp } = useAreaPath();
  const { isStaff, isStudent } = useAuth();
  const canCompare = inApp && isStudent;
  const page = filters.page ?? 1;
  const browsing = !filters.q && !filters.type && !filters.periodId && !filters.topicId && page === 1;
  const query = useQuery({
    queryKey: ['sources', filters],
    queryFn: () => sourcesService.list({ ...filters, page, pageSize: 12 }),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader
        title="Raqamli tarixiy manbalar kutubxonasi"
        description="Yozma, vizual, kartografik, audio-video va arxeologik manbalar — materialni oching va darsda foydalaning."
        extra={
          <>
            {inApp && isStaff && <Link to="/app/admin/sources/new"><Button type="primary" icon={<PlusOutlined />}>Manba qo‘shish</Button></Link>}
          </>
        }
      />
      <SourceFilters value={filters} onChange={setFilters} />
      {browsing && <TopicSections onSelect={(t) => setFilters({ topicId: t.id, periodId: t.periodId ?? undefined, page: 1 })} />}
      {filters.topicId && <TopicBanner topicId={filters.topicId} onClear={() => setFilters({ topicId: undefined, periodId: undefined, page: 1 })} />}
      <QueryState query={query} isEmpty={(d) => d.data.length === 0} empty="Mezonlarga mos manba topilmadi. Filtrlarni o‘zgartirib ko‘ring.">
        {(d) => (
          <>
            <div className="stagger grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {d.data.map((s) => <SourceCard key={s.id} s={s} base={base} canCompare={canCompare} />)}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination current={page} pageSize={12} total={d.meta.total} showSizeChanger={false} onChange={(p) => setFilters({ page: p })} />
            </div>
          </>
        )}
      </QueryState>
      {canCompare && <CompareTray />}
    </>
  );
}

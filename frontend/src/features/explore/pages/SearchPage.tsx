import { useQuery } from '@tanstack/react-query';
import { Card, Checkbox, Empty, Input, List, Select, Tag } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { ASSIGNMENT_TYPE, OBJECT_TYPE, SOURCE_TYPE, WORK_STATUS } from '@/lib/labels';
import { catalogService } from '@/services/catalog.service';
import { exploreService } from '@/services/explore.service';
import { fmtDate } from '@/utils/format';

const TYPES = [
  { value: 'sources', label: 'Tarixiy manbalar' },
  { value: 'objects', label: '3D/360° obyektlar' },
  { value: 'assignments', label: 'Metodik topshiriqlar' },
  { value: 'lessons', label: 'Dars ishlanmalari' },
  { value: 'periods', label: 'Tarixiy davrlar' },
  { value: 'topics', label: 'Mavzular' },
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const types = (params.get('types') ?? '').split(',').filter(Boolean);
  const periodId = params.get('periodId') ?? undefined;
  const periods = useQuery({ queryKey: ['periods'], queryFn: catalogService.periods });
  const result = useQuery({ queryKey: ['search', q, types, periodId], queryFn: () => exploreService.search(q, types, periodId), enabled: q.length >= 2 });
  const set = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHeader title="Umumiy qidiruv" description="Manbalar, virtual obyektlar, topshiriqlar, dars ishlanmalari, davrlar va mavzular bo‘yicha." />
      <Card className="mb-6">
        <Input.Search size="large" defaultValue={q} placeholder="Kamida 2 belgi kiriting" allowClear enterButton="Qidirish" onSearch={(v) => set({ q: v.trim() || undefined })} />
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Checkbox.Group options={TYPES} value={types} onChange={(v) => set({ types: (v as string[]).join(',') || undefined })} />
          <Select allowClear placeholder="Tarixiy davr" className="w-64" value={periodId} onChange={(v) => set({ periodId: v })} options={periods.data?.map((p) => ({ value: p.id, label: p.name }))} />
        </div>
      </Card>
      {q.length < 2 ? (
        <Empty description="Qidiruv so‘zini kiriting" />
      ) : (
        <QueryState
          query={result}
          isEmpty={(r) => Object.values(r).every((arr) => arr.length === 0)}
          empty={`«${q}» bo‘yicha hech narsa topilmadi`}
        >
          {(r) => (
            <div className="grid gap-6 lg:grid-cols-2">
              {r.sources.length > 0 && (
                <Card title={`Tarixiy manbalar (${r.sources.length})`}>
                  <List dataSource={r.sources} renderItem={(s) => (
                    <List.Item><List.Item.Meta title={<Link to={`/app/sources/${s.slug}`}>{s.title}</Link>} description={[SOURCE_TYPE[s.type], s.period?.name, s.dateLabel].filter(Boolean).join(' · ')} /></List.Item>
                  )} />
                </Card>
              )}
              {r.objects.length > 0 && (
                <Card title={`3D/360° obyektlar (${r.objects.length})`}>
                  <List dataSource={r.objects} renderItem={(o) => (
                    <List.Item><List.Item.Meta title={<Link to={`/app/museum/${o.slug}`}>{o.title}</Link>} description={[OBJECT_TYPE[o.type], o.location].filter(Boolean).join(' · ')} /></List.Item>
                  )} />
                </Card>
              )}
              {r.assignments.length > 0 && (
                <Card title={`Topshiriqlar (${r.assignments.length})`}>
                  <List dataSource={r.assignments} renderItem={(a) => (
                    <List.Item><List.Item.Meta title={<Link to={`/app/assignments/${a.id}`}>{a.title}</Link>} description={`${ASSIGNMENT_TYPE[a.type]} · muddat: ${fmtDate(a.dueDate)}`} /></List.Item>
                  )} />
                </Card>
              )}
              {r.lessons.length > 0 && (
                <Card title={`Dars ishlanmalari (${r.lessons.length})`}>
                  <List dataSource={r.lessons} renderItem={(l) => (
                    <List.Item><List.Item.Meta title={<Link to={`/app/lessons/${l.id}`}>{l.title}</Link>} description={`${l.gradeLevel}-sinf · ${l.author.fullName} · ${WORK_STATUS[l.status].label}`} /></List.Item>
                  )} />
                </Card>
              )}
              {(r.periods.length > 0 || r.topics.length > 0) && (
                <Card title="Davrlar va mavzular">
                  {r.periods.map((p) => <Tag key={p.id} color="blue" className="mb-2 cursor-pointer" onClick={() => set({ periodId: p.id })}>{p.name}</Tag>)}
                  {r.topics.map((t) => <Tag key={t.id} className="mb-2">{t.name}{t.period ? ` (${t.period.name})` : ''}</Tag>)}
                </Card>
              )}
            </div>
          )}
        </QueryState>
      )}
    </>
  );
}

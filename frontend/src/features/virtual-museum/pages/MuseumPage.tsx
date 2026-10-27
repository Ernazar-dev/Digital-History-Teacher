import { BankOutlined, PlusOutlined } from '@ant-design/icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Button, Card, Input, Pagination, Select, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useAuth } from '@/features/auth/useAuth';
import { useAreaPath } from '@/hooks/useAreaPath';
import { useUrlState } from '@/hooks/useUrlState';
import { OBJECT_TYPE, PROVIDER, toOptions } from '@/lib/labels';
import { catalogService } from '@/services/catalog.service';
import { museumService, type ObjectFilters } from '@/services/museum.service';

export default function MuseumPage() {
  const [f, setF] = useUrlState<ObjectFilters & Record<string, string | number | undefined>>(['page']);
  const { museum, inApp } = useAreaPath();
  const { isAdmin } = useAuth();
  const periods = useQuery({ queryKey: ['periods'], queryFn: catalogService.periods });
  const q = useQuery({ queryKey: ['objects', f], queryFn: () => museumService.list({ ...f, pageSize: 12 }), placeholderData: keepPreviousData });

  return (
    <>
      <PageHeader
        title="Virtual tarixiy sayohat va muzey"
        description="Tarixiy obidalar va artefaktlarning 3D modellari hamda 360° virtual sayohatlari. Har bir obyekt kuzatuv savollari va metodik topshiriqlar bilan bog‘langan."
        extra={
          inApp && isAdmin && <Link to="/app/admin/objects/new"><Button type="primary" icon={<PlusOutlined />}>Obyekt qo‘shish</Button></Link>
        }
      />
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <Input.Search placeholder="Obyekt yoki joy nomi" allowClear defaultValue={f.q} onSearch={(v) => setF({ q: v, page: 1 })} className="md:col-span-1" />
        <Select allowClear placeholder="Turi" value={f.type} options={toOptions(OBJECT_TYPE)} onChange={(v) => setF({ type: v, page: 1 })} />
        <Select allowClear placeholder="Manba platformasi" value={f.provider} options={toOptions(PROVIDER)} onChange={(v) => setF({ provider: v, page: 1 })} />
        <Select allowClear placeholder="Tarixiy davr" value={f.periodId} options={periods.data?.map((p) => ({ value: p.id, label: p.name }))} onChange={(v) => setF({ periodId: v, page: 1 })} />
      </div>
      <QueryState query={q} isEmpty={(d) => d.data.length === 0} empty="Obyekt topilmadi">
        {(d) => (
          <>
            <div className="stagger grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {d.data.map((o) => (
                <Link key={o.id} to={`${museum}/${o.slug}`} className="no-underline">
                  <Card
                    hoverable
                    className="h-full"
                    cover={
                      o.thumbnailUrl ? (
                        <img src={o.thumbnailUrl} alt={o.title} loading="lazy" className="h-48 w-full object-cover" />
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-primary-soft text-5xl text-primary"><BankOutlined /></div>
                      )
                    }
                  >
                    <div className="mb-2 flex flex-wrap gap-1">
                      <Tag color={o.type === 'TOUR_360' ? 'purple' : 'blue'}>{OBJECT_TYPE[o.type]}</Tag>
                      <Tag>{PROVIDER[o.provider]}</Tag>
                      {!o.isActive && <Tag color="red">Yashirilgan</Tag>}
                    </div>
                    <h3 className="m-0 text-base font-semibold text-ink">{o.title}</h3>
                    <div className="mt-1 text-sm text-muted">{[o.location, o.periodLabel].filter(Boolean).join(' · ')}</div>
                    <div className="mt-2 text-xs text-muted">{o._count?.tasks ?? 0} ta pedagogik topshiriq</div>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex justify-center">
              <Pagination current={f.page ?? 1} pageSize={12} total={d.meta.total} showSizeChanger={false} onChange={(page) => setF({ page })} />
            </div>
          </>
        )}
      </QueryState>
    </>
  );
}

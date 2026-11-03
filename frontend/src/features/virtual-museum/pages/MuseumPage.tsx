import { BankOutlined, PlusOutlined } from '@ant-design/icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Button, Card, Input, Pagination, Select, Tag } from 'antd';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { useAuth } from '@/features/auth/useAuth';
import { useAreaPath } from '@/hooks/useAreaPath';
import { useUrlState } from '@/hooks/useUrlState';
import { OBJECT_TYPE, toOptions } from '@/lib/labels';
import { museumService, type ObjectFilters } from '@/services/museum.service';

export default function MuseumPage() {
  const [f, setF] = useUrlState<ObjectFilters & Record<string, string | number | undefined>>(['page']);
  const { museum, inApp } = useAreaPath();
  const { isAdmin } = useAuth();
  const siteView = useSiteViewStore((s) => s.siteView);
  const q = useQuery({ queryKey: ['objects', f], queryFn: () => museumService.list({ ...f, pageSize: 12 }), placeholderData: keepPreviousData });

  return (
    <>
      <PageHeader
        title="Virtual tarixiy sayohat va muzey"
        description="Tarixiy obidalar va artefaktlarning 3D modellari hamda 360° virtual sayohatlari."
        extra={
          inApp && isAdmin && !siteView && <Link to="/app/admin/objects/new"><Button type="primary" icon={<PlusOutlined />}>Obyekt qo‘shish</Button></Link>
        }
      />
      <div className="mb-6 grid gap-3 md:grid-cols-[2fr_1fr]">
        <Input.Search placeholder="Obyekt nomi" allowClear defaultValue={f.q} onSearch={(v) => setF({ q: v, page: 1 })} />
        <Select allowClear placeholder="Turi" value={f.type} options={toOptions(OBJECT_TYPE)} onChange={(v) => setF({ type: v, page: 1 })} />
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
                        // antd muqovadagi elementga display:block beradi — markazlash ichki qatlamda
                        <div className="h-48 w-full bg-gradient-to-br from-primary to-midnight">
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/85">
                            <BankOutlined className="text-4xl text-accent-light" />
                            <span className="text-xs font-medium uppercase tracking-[0.2em]">{OBJECT_TYPE[o.type]}</span>
                          </div>
                        </div>
                      )
                    }
                  >
                    <div className="mb-2 flex flex-wrap gap-1">
                      <Tag color={o.type === 'TOUR_360' ? 'purple' : 'blue'}>{OBJECT_TYPE[o.type]}</Tag>
                      {!o.isActive && <Tag color="red">Yashirilgan</Tag>}
                    </div>
                    <h3 className="m-0 text-base font-semibold text-ink">{o.title}</h3>
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

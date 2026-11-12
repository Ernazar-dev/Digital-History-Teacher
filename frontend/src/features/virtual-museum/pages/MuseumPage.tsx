import { BankOutlined, PlusOutlined } from '@ant-design/icons';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Button, Card, Input, Pagination, Select, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { useAuth } from '@/features/auth/useAuth';
import { useAreaPath } from '@/hooks/useAreaPath';
import { useUrlState } from '@/hooks/useUrlState';
import { OBJECT_TYPE, PROVIDER, toOptions } from '@/lib/labels';
import { museumService, type ObjectFilters } from '@/services/museum.service';

export default function MuseumPage() {
  const { t } = useTranslation();
  const [f, setF] = useUrlState<ObjectFilters & Record<string, string | number | undefined>>(['page']);
  const { museum, inApp } = useAreaPath();
  const { isAdmin } = useAuth();
  const siteView = useSiteViewStore((s) => s.siteView);
  const q = useQuery({ queryKey: ['objects', f], queryFn: () => museumService.list({ ...f, pageSize: 12 }), placeholderData: keepPreviousData });

  return (
    <>
      <PageHeader
        title={t('museum.title')}
        description={t('museum.description')}
        extra={
          inApp && isAdmin && !siteView && <Link to="/app/admin/objects/new"><Button type="primary" icon={<PlusOutlined />}>{t('museum.add')}</Button></Link>
        }
      />
      <div className="mb-6 grid gap-3 md:grid-cols-[2fr_1fr]">
        <Input.Search placeholder={t('museum.searchPlaceholder')} allowClear defaultValue={f.q} onSearch={(v) => setF({ q: v, page: 1 })} />
        <Select allowClear placeholder={t('museum.typePlaceholder')} value={f.type} options={toOptions(OBJECT_TYPE)} onChange={(v) => setF({ type: v, page: 1 })} />
      </div>
      <QueryState query={q} isEmpty={(d) => d.data.length === 0} empty={t('museum.empty')}>
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
                        // antd muqovadagi elementga display:block beradi — markazlaş içki qatlamda
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
                      {!o.isActive && <Tag color="red">{t('museum.hidden')}</Tag>}
                    </div>
                    <h3 className="m-0 text-base font-semibold text-ink">{o.title}</h3>
                    {o.provider !== 'OTHER' && <div className="mt-1 text-xs text-muted">{t('museum.source', { p: PROVIDER[o.provider] })}</div>}
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

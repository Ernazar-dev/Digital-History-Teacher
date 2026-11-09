import { DiffOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Segmented, Table, Tag } from 'antd';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
import { PORTFOLIO_TYPE } from '@/lib/labels';
import { portfolioService } from '@/services/portfolio.service';
import type { Portfolio, PortfolioItem } from '@/types/api';
import { fmtDateTime } from '@/utils/format';
import { CompareItemsModal } from '../components/CompareItemsModal';
import { PortfolioFiles } from '../components/PortfolioFiles';
import { ReflectionsCard } from '../components/ReflectionsCard';
import { OutcomeCell, TeacherCommentsCard } from '../components/ProgressCards';

export default function PortfolioPage() {
  const { studentId } = useParams();
  const q = useQuery({
    queryKey: ['portfolio', studentId ?? 'me'],
    queryFn: () => (studentId ? portfolioService.student(studentId) : portfolioService.mine()),
  });
  return <QueryState query={q}>{(p) => <PortfolioView p={p} own={!studentId} />}</QueryState>;
}

const PortfolioView = ({ p, own }: { p: Portfolio; own: boolean }) => {
  const qc = useQueryClient();
  const notify = useNotify();
  const [type, setType] = useState<string>('ALL');
  const [selected, setSelected] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [summary, setSummary] = useState(p.summary ?? '');
  const refresh = () => qc.invalidateQueries({ queryKey: ['portfolio'] });
  const feature = useMutation({ mutationFn: (i: PortfolioItem) => portfolioService.updateItem(i.id, { isFeatured: !i.isFeatured }), onSuccess: refresh, onError: (e) => notify.error(e) });
  const saveSummary = useMutation({ mutationFn: () => portfolioService.updateSummary(summary), onSuccess: () => notify.success(i18n.t('portfolio.saved')), onError: (e) => notify.error(e) });
  const items = p.items.filter((i) => type === 'ALL' || i.type === type);
  const counts = p.items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.type]: (acc[i.type] ?? 0) + 1 }), {});

  return (
    <>
      <PageHeader
        title={own ? i18n.t('portfolio.mine') : i18n.t('portfolio.ofStudent', { name: p.student.fullName })}
        description={[p.student.institution, i18n.t('portfolio.itemsCount', { n: p.items.length })].filter(Boolean).join(' · ')}
        extra={
          <>
            <Button icon={<DiffOutlined />} disabled={selected.length !== 2} onClick={() => setCompareOpen(true)}>{i18n.t('portfolio.compare', { n: selected.length })}</Button>
            {!own && <Link to={`/app/progress/students/${p.student.id}`}><Button>{i18n.t('portfolio.testResults')}</Button></Link>}
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Card title={i18n.t('portfolio.summaryTitle')}>
            {own ? (
              <>
                <Input.TextArea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={i18n.t('portfolio.summaryPlaceholder')} />
                <Button className="mt-2" size="small" loading={saveSummary.isPending} onClick={() => saveSummary.mutate()}>{i18n.t('common.save')}</Button>
              </>
            ) : (
              <p className="prose-text m-0">{p.summary || '—'}</p>
            )}
          </Card>
          <Card title={i18n.t('portfolio.works')} extra={<span className="hidden text-sm text-muted md:inline">{i18n.t('portfolio.worksHint')}</span>}>
            <div className="mb-4 max-w-full overflow-x-auto pb-1">
              <Segmented
                value={type}
                onChange={(v) => setType(String(v))}
                options={[{ value: 'ALL', label: i18n.t('portfolio.all', { n: p.items.length }) }, ...Object.entries(counts).map(([k, n]) => ({ value: k, label: `${PORTFOLIO_TYPE[k as keyof typeof PORTFOLIO_TYPE]} (${n})` }))]}
              />
            </div>
            <Table
              rowKey="id"
              dataSource={items}
              scroll={{ x: 700 }}
              locale={{ emptyText: i18n.t('portfolio.empty') }}
              rowSelection={{ selectedRowKeys: selected, onChange: (k) => setSelected((k as string[]).slice(-2)), columnTitle: ' ' }}
              columns={[
                {
                  title: i18n.t('portfolio.colWork'),
                  render: (_, i) => (
                    <div>
                      <Link to={`/app/portfolio/items/${i.id}`}>{i.title}</Link>
                      {i.sources.length > 0 && <div className="mt-1 text-xs text-muted">{i18n.t('portfolio.sources', { list: i.sources.map((s) => s.title).join('; ') })}</div>}
                    </div>
                  ),
                },
                { title: i18n.t('portfolio.colType'), width: 190, render: (_, i) => <Tag>{PORTFOLIO_TYPE[i.type]}</Tag> },
                { title: i18n.t('portfolio.colResult'), width: 170, render: (_, i) => <OutcomeCell outcome={i.outcome} /> },
                { title: i18n.t('portfolio.colVersion'), width: 80, dataIndex: 'version' },
                { title: i18n.t('portfolio.colDate'), width: 150, render: (_, i) => fmtDateTime(i.updatedAt) },
                ...(own
                  ? [{
                      title: '',
                      width: 50,
                      render: (_: unknown, i: PortfolioItem) => (
                        <Button type="text" aria-label={i18n.t('portfolio.featuredAria')} icon={i.isFeatured ? <StarFilled className="text-accent" /> : <StarOutlined />} onClick={() => feature.mutate(i)} />
                      ),
                    }]
                  : []),
              ]}
            />
          </Card>
          <ReflectionsCard items={p.reflections} editable={own} />
        </div>
        <div className="min-w-0 space-y-6">
          {!own && (
            <Card title={i18n.t('portfolio.studentFiles')}>
              <PortfolioFiles studentId={p.student.id} />
            </Card>
          )}
          <TeacherCommentsCard p={p} />
          <Card title={i18n.t('portfolio.featured')}>
            {p.items.filter((i) => i.isFeatured).length === 0 ? (
              <span className="text-muted">{i18n.t('portfolio.featuredHint')}</span>
            ) : (
              <ul className="m-0 pl-5">{p.items.filter((i) => i.isFeatured).map((i) => <li key={i.id}><Link to={`/app/portfolio/items/${i.id}`}>{i.title}</Link></li>)}</ul>
            )}
          </Card>
        </div>
      </div>
      <CompareItemsModal items={p.items.filter((i) => selected.includes(i.id))} open={compareOpen} onClose={() => setCompareOpen(false)} />
    </>
  );
};

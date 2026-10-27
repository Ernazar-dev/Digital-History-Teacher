import { DiffOutlined, PrinterOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, Segmented, Table, Tag } from 'antd';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { CompetenceRadar } from '@/features/diagnostics/components/CompetenceChart';
import { useNotify } from '@/hooks/useNotify';
import { PORTFOLIO_TYPE } from '@/lib/labels';
import { portfolioService } from '@/services/portfolio.service';
import type { Portfolio, PortfolioItem } from '@/types/api';
import { fmtDateTime, fmtPercent } from '@/utils/format';
import { CompareItemsModal } from '../components/CompareItemsModal';
import { PortfolioFiles } from '../components/PortfolioFiles';
import { ReflectionsCard } from '../components/ReflectionsCard';
import { DiagnosticsCard, DynamicsCard, OutcomeCell, TeacherCommentsCard } from '../components/ProgressCards';

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
  const saveSummary = useMutation({ mutationFn: () => portfolioService.updateSummary(summary), onSuccess: () => notify.success('Saqlandi'), onError: (e) => notify.error(e) });
  const items = p.items.filter((i) => type === 'ALL' || i.type === type);
  const counts = p.items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.type]: (acc[i.type] ?? 0) + 1 }), {});

  return (
    <>
      <PageHeader
        title={own ? 'Mening elektron portfoliom' : `Portfolio: ${p.student.fullName}`}
        description={[p.student.institution, `${p.items.length} ta element`].filter(Boolean).join(' · ')}
        extra={
          <>
            <Button icon={<DiffOutlined />} disabled={selected.length !== 2} onClick={() => setCompareOpen(true)}>Tanlanganlarni taqqoslash ({selected.length}/2)</Button>
            <Button icon={<PrinterOutlined />} onClick={() => window.print()}>Chop etish / PDF</Button>
            {!own && <Link to={`/app/competence/students/${p.student.id}`}><Button>Kompetensiya profili</Button></Link>}
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Card title="Portfolio tavsifi">
            {own ? (
              <>
                <Input.TextArea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="O‘zingiz, kasbiy maqsadlaringiz va portfolio haqida qisqacha" />
                <Button className="no-print mt-2" size="small" loading={saveSummary.isPending} onClick={() => saveSummary.mutate()}>Saqlash</Button>
              </>
            ) : (
              <p className="prose-text m-0">{p.summary || '—'}</p>
            )}
          </Card>
          <Card title="Ishlar" extra={<span className="no-print hidden text-sm text-muted md:inline">Avvalgi va keyingi ishni taqqoslash uchun ikkitasini belgilang</span>}>
            <div className="no-print mb-4 max-w-full overflow-x-auto pb-1">
              <Segmented
                value={type}
                onChange={(v) => setType(String(v))}
                options={[{ value: 'ALL', label: `Barchasi (${p.items.length})` }, ...Object.entries(counts).map(([k, n]) => ({ value: k, label: `${PORTFOLIO_TYPE[k as keyof typeof PORTFOLIO_TYPE]} (${n})` }))]}
              />
            </div>
            <Table
              rowKey="id"
              dataSource={items}
              scroll={{ x: 700 }}
              locale={{ emptyText: 'Portfolio hali bo‘sh. Topshirilgan tahlillar, dars ishlanmalari va topshiriqlar avtomatik qo‘shiladi.' }}
              rowSelection={{ selectedRowKeys: selected, onChange: (k) => setSelected((k as string[]).slice(-2)), columnTitle: ' ' }}
              columns={[
                {
                  title: 'Ish',
                  render: (_, i) => (
                    <div>
                      <Link to={`/app/portfolio/items/${i.id}`}>{i.title}</Link>
                      {i.sources.length > 0 && <div className="mt-1 text-xs text-muted">Manbalar: {i.sources.map((s) => s.title).join('; ')}</div>}
                    </div>
                  ),
                },
                { title: 'Turi', width: 190, render: (_, i) => <Tag>{PORTFOLIO_TYPE[i.type]}</Tag> },
                { title: 'Natija', width: 170, render: (_, i) => <OutcomeCell outcome={i.outcome} /> },
                { title: 'Versiya', width: 80, dataIndex: 'version' },
                { title: 'Sana', width: 150, render: (_, i) => fmtDateTime(i.updatedAt) },
                ...(own
                  ? [{
                      title: '',
                      width: 50,
                      render: (_: unknown, i: PortfolioItem) => (
                        <Button type="text" aria-label="Tanlangan ish" icon={i.isFeatured ? <StarFilled className="text-accent" /> : <StarOutlined />} onClick={() => feature.mutate(i)} />
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
            <Card title="Talaba yuklagan fayllar">
              <PortfolioFiles studentId={p.student.id} />
            </Card>
          )}
          <Card title="Joriy kompetensiya profili" extra={own && <Link to="/app/competence">Batafsil</Link>}>
            <CompetenceRadar items={p.profile.components} height={260} />
            <div className="text-center text-sm">Umumiy: <b>{fmtPercent(p.profile.overall)}</b> {p.profile.overallLevel && <Tag color="blue">{p.profile.overallLevel.name}</Tag>}</div>
          </Card>
          <DynamicsCard p={p} />
          <DiagnosticsCard p={p} />
          <TeacherCommentsCard p={p} />
          <Card title="Tanlangan ishlar">
            {p.items.filter((i) => i.isFeatured).length === 0 ? (
              <span className="text-muted">Yulduzcha bilan belgilangan ishlar shu yerda ko‘rinadi.</span>
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

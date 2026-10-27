import { useQuery } from '@tanstack/react-query';
import { Alert, Collapse, Skeleton, Table, Tag } from 'antd';
import { EVIDENCE_KIND } from '@/lib/labels';
import { assessmentsService } from '@/services/assessment.service';
import type { AssessmentIndicator } from '@/types/api';

const LEVEL_COLOR: Record<string, string> = { LOW: 'red', MEDIUM: 'gold', HIGH: 'green' };

/**
 * Hujjat, 5-modul: baholash markazi modeli — har bir komponentning baholanadigan ko'nikmalari, baholash usullari,
 * mezon va indikatorlari hamda har bir indikator uchun Past/O'rta/Yuqori darajaning aniq tavsifi va bali.
 */
export const AssessmentModel = () => {
  const config = useQuery({ queryKey: ['assessment-config'], queryFn: assessmentsService.config });
  if (config.isLoading) return <Skeleton active />;
  if (!config.data) return null;
  const { components, levels, note } = config.data;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {levels.map((l) => (
          <div key={l.id} className="rounded-lg border border-solid border-line p-4">
            <div className="mb-1 flex items-center justify-between gap-2">
              <Tag color={LEVEL_COLOR[l.code] ?? 'blue'} className="m-0">{l.name} daraja</Tag>
              <span className="text-sm text-muted">{l.minPercent}–{l.maxPercent}%</span>
            </div>
            <p className="m-0 text-sm">{l.description}</p>
          </div>
        ))}
      </div>
      <Collapse
        items={components.map((c) => ({
          key: c.id,
          label: <span className="font-medium">{c.name}</span>,
          extra: c.methods ? <span className="hidden text-sm text-muted md:inline">{c.methods}</span> : null,
          children: (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase text-muted">Baholanadigan ko‘nikmalar</div>
                  <p className="m-0 mt-1">{c.definition}</p>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase text-muted">Baholash usullari va dalil vaznlari</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.evidenceWeights.map((w) => <Tag key={w.evidenceKind}>{EVIDENCE_KIND[w.evidenceKind]} · {Math.round(w.weight * 100)}%</Tag>)}
                  </div>
                </div>
              </div>
              {c.criteria.map((cr) => (
                <div key={cr.id}>
                  <div className="mb-2 font-medium">{cr.title}</div>
                  <Table<AssessmentIndicator>
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={cr.indicators}
                    scroll={{ x: 760 }}
                    columns={[
                      { title: 'Indikator', dataIndex: 'title', width: 220 },
                      { title: <Tag color="red" className="m-0">Past · 1 ball</Tag>, render: (_, i) => i.lowDescriptor || '—' },
                      { title: <Tag color="gold" className="m-0">O‘rta · 2 ball</Tag>, render: (_, i) => i.mediumDescriptor || '—' },
                      { title: <Tag color="green" className="m-0">Yuqori · 3 ball</Tag>, render: (_, i) => i.highDescriptor || '—' },
                    ]}
                  />
                </div>
              ))}
            </div>
          ),
        }))}
      />
      <Alert type="info" showIcon message={note} />
    </div>
  );
};

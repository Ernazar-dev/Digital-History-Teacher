import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Input, InputNumber, Table } from 'antd';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import { assessmentsService, type LevelInput } from '@/services/assessment.service';
import { ComponentEditor } from '../components/ComponentEditor';

export default function AssessmentConfigPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const q = useQuery({ queryKey: ['assessment-config'], queryFn: assessmentsService.config });
  const [levels, setLevels] = useState<LevelInput[]>([]);
  useEffect(() => {
    if (q.data) setLevels(q.data.levels.map(({ code, name, description, minPercent, maxPercent }) => ({ code, name, description, minPercent, maxPercent })));
  }, [q.data]);
  const saveLevels = useMutation({
    mutationFn: () => assessmentsService.replaceLevels(levels),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assessment-config'] }); notify.success('Darajalar saqlandi'); },
    onError: (e) => notify.error(e),
  });
  const setLevel = (i: number, patch: Partial<LevelInput>) => setLevels((l) => l.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <>
      <PageHeader title="Baholash mezonlari va darajalar" description="Kompetensiya komponentlari, mezonlar, indikatorlar, dalil vaznlari va daraja chegaralari." />
      <QueryState query={q}>
        {(cfg) => (
          <>
            <Alert className="mb-6" type="warning" showIcon message="Ilmiy izoh" description={cfg.note} />
            <Card title="Daraja chegaralari (Past / O‘rta / Yuqori)" className="mb-6">
              <Table
                rowKey="code"
                pagination={false}
                dataSource={levels}
                scroll={{ x: 800 }}
                columns={[
                  { title: 'Kod', dataIndex: 'code', width: 90 },
                  { title: 'Nomi', width: 140, render: (_, l, i) => <Input value={l.name} onChange={(e) => setLevel(i, { name: e.target.value })} /> },
                  { title: 'Quyi chegara (%)', width: 140, render: (_, l, i) => <InputNumber min={0} max={100} value={l.minPercent} onChange={(v) => setLevel(i, { minPercent: v ?? 0 })} /> },
                  { title: 'Yuqori chegara (%)', width: 140, render: (_, l, i) => <InputNumber min={0} max={100} value={l.maxPercent} onChange={(v) => setLevel(i, { maxPercent: v ?? 0 })} /> },
                  { title: 'Ta’rif (hujjatdan)', render: (_, l, i) => <Input.TextArea autoSize value={l.description} onChange={(e) => setLevel(i, { description: e.target.value })} /> },
                ]}
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-sm text-muted">Natija o‘zi yetgan eng yuqori quyi chegaraga mos darajaga kiritiladi. Eng past daraja 0 dan boshlanishi, eng yuqorisi 100 da tugashi kerak.</span>
                <Button type="primary" loading={saveLevels.isPending} onClick={() => saveLevels.mutate()}>Darajalarni saqlash</Button>
              </div>
            </Card>
            {cfg.components.map((c) => <ComponentEditor key={c.id} c={c} />)}
          </>
        )}
      </QueryState>
    </>
  );
}

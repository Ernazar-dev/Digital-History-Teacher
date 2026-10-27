import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, InputNumber, Select } from 'antd';
import { useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { EVIDENCE_KIND, STAGE, toOptions } from '@/lib/labels';
import { assessmentsService } from '@/services/assessment.service';
import type { AssessmentStage, ComponentResult, EvidenceKind } from '@/types/api';

/** O'qituvchi/ekspert bahosini qo'lda kiritish (masalan, kuzatuv yoki portfolio tahlili natijasi) */
export const ExpertRecordForm = ({ studentId, components }: { studentId: string; components: ComponentResult[] }) => {
  const qc = useQueryClient();
  const notify = useNotify();
  const [componentId, setComponentId] = useState<string>();
  const [stage, setStage] = useState<AssessmentStage>('ONGOING');
  const [kind, setKind] = useState<EvidenceKind>('EXPERT');
  const [score, setScore] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const save = useMutation({
    mutationFn: () => assessmentsService.expertRecord({ studentId, componentId: componentId!, stage, evidenceKind: kind, score: score!, note: note || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competence'] });
      notify.success('Baho qo‘shildi');
      setScore(null);
      setNote('');
    },
    onError: (e) => notify.error(e),
  });
  return (
    <Card title="O‘qituvchi / ekspert bahosini qo‘shish">
      <div className="grid gap-3 md:grid-cols-2">
        <Select placeholder="Komponent" value={componentId} onChange={setComponentId} options={components.map((c) => ({ value: c.componentId, label: c.name }))} />
        <Select value={stage} onChange={setStage} options={toOptions(STAGE)} />
        <Select value={kind} onChange={setKind} options={toOptions(EVIDENCE_KIND).filter((o) => ['EXPERT', 'PORTFOLIO', 'PRACTICAL_TASK', 'REFLECTION'].includes(o.value))} />
        <InputNumber min={0} max={100} placeholder="Ball (0–100)" value={score} onChange={setScore} className="w-full" />
      </div>
      <Input.TextArea className="mt-3" rows={2} placeholder="Asos / izoh" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button className="mt-3" type="primary" disabled={!componentId || score === null} loading={save.isPending} onClick={() => save.mutate()}>Qo‘shish</Button>
    </Card>
  );
};

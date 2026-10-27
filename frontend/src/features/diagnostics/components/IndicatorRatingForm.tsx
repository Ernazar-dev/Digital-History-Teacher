import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Button, Card, Input, Radio, Select, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { errorDetails } from '@/lib/http';
import { STAGE, toOptions } from '@/lib/labels';
import { assessmentsService } from '@/services/assessment.service';
import type { AssessmentStage, IndicatorLevel } from '@/types/api';

const POINTS: Record<IndicatorLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
const LABEL: Record<IndicatorLevel, string> = { LOW: 'Past', MEDIUM: 'O‘rta', HIGH: 'Yuqori' };

/**
 * O'qituvchi/ekspert komponentni uning har bir indikatori bo'yicha baholaydi (Past=1, O'rta=2, Yuqori=3 ball).
 * Natija foizi va darajasi ballardan hisoblanadi — daraja «aniq indikatorlar va ball mezonlari» asosida belgilanadi.
 */
export const IndicatorRatingForm = ({ studentId }: { studentId: string }) => {
  const qc = useQueryClient();
  const notify = useNotify();
  const config = useQuery({ queryKey: ['assessment-config'], queryFn: assessmentsService.config });
  const [componentId, setComponentId] = useState<string>();
  const [stage, setStage] = useState<AssessmentStage>('ONGOING');
  const [ratings, setRatings] = useState<Record<string, IndicatorLevel>>({});
  const [note, setNote] = useState('');
  const [missing, setMissing] = useState<string[]>([]);

  const component = config.data?.components.find((c) => c.id === componentId);
  const indicators = useMemo(
    () => component?.criteria.flatMap((cr) => cr.indicators.map((i) => ({ ...i, criterion: cr.title }))) ?? [],
    [component],
  );
  const rated = indicators.filter((i) => ratings[i.id]);
  const percent = indicators.length ? (rated.reduce((s, i) => s + POINTS[ratings[i.id]], 0) / (indicators.length * 3)) * 100 : 0;
  const complete = indicators.length > 0 && rated.length === indicators.length;
  const level = complete
    ? [...(config.data?.levels ?? [])].sort((a, b) => b.minPercent - a.minPercent).find((l) => percent >= l.minPercent)
    : undefined;

  const save = useMutation({
    mutationFn: () =>
      assessmentsService.rateIndicators({
        studentId, componentId: componentId!, stage, note: note.trim() || undefined,
        ratings: indicators.map((i) => ({ indicatorId: i.id, level: ratings[i.id] })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['competence'] });
      notify.success('Indikatorlar bo‘yicha baho saqlandi');
      setRatings({});
      setNote('');
      setMissing([]);
    },
    onError: (e) => { setMissing(errorDetails(e)); notify.error(e); },
  });

  return (
    <Card title="Indikatorlar bo‘yicha baholash">
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          aria-label="Komponent"
          placeholder="Komponentni tanlang"
          loading={config.isLoading}
          value={componentId}
          onChange={(v) => { setComponentId(v); setRatings({}); setMissing([]); }}
          options={config.data?.components.map((c) => ({ value: c.id, label: c.name }))}
        />
        <Select aria-label="Bosqich" value={stage} onChange={setStage} options={toOptions(STAGE)} />
      </div>
      {component && indicators.length === 0 && <Alert className="mt-3" type="warning" showIcon message="Bu komponentda indikatorlar belgilanmagan" />}
      {indicators.length > 0 && (
        <ol className="m-0 mt-4 list-none space-y-3 p-0">
          {indicators.map((i, idx) => {
            const value = ratings[i.id];
            const descriptor = value === 'LOW' ? i.lowDescriptor : value === 'MEDIUM' ? i.mediumDescriptor : value === 'HIGH' ? i.highDescriptor : '';
            return (
              <li key={i.id} className="rounded-lg border border-solid border-line p-3">
                <div className="text-xs text-muted">{i.criterion}</div>
                <div className="mb-2 font-medium">{idx + 1}. {i.title}</div>
                <Radio.Group
                  aria-label={`${i.title} darajasi`}
                  optionType="button"
                  buttonStyle="solid"
                  value={value}
                  onChange={(e) => setRatings((r) => ({ ...r, [i.id]: e.target.value }))}
                  options={(['LOW', 'MEDIUM', 'HIGH'] as const).map((l) => ({ value: l, label: `${LABEL[l]} · ${POINTS[l]}` }))}
                />
                {descriptor && <p className="m-0 mt-2 text-sm text-muted">{descriptor}</p>}
              </li>
            );
          })}
        </ol>
      )}
      {indicators.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span>Baholandi: {rated.length}/{indicators.length}</span>
          <span>·</span>
          <span>Natija: <b>{Math.round(percent * 10) / 10}%</b></span>
          {level && <Tag color="blue" className="m-0">{level.name} daraja</Tag>}
        </div>
      )}
      {missing.length > 0 && <Alert className="mt-3" type="error" showIcon message="Baholanmagan indikatorlar" description={missing.join('; ')} />}
      <Input.TextArea className="mt-3" rows={2} aria-label="Asos yoki izoh" placeholder="Asos / izoh (masalan, qaysi ish asosida baholandi)" value={note} onChange={(e) => setNote(e.target.value)} />
      <Button className="mt-3" type="primary" disabled={!complete} loading={save.isPending} onClick={() => save.mutate()}>Saqlash</Button>
    </Card>
  );
};

import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Input, InputNumber, Radio, Select, Table } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { assignmentsService, type LessonReviewInput } from '@/services/learning.service';
import type { LessonPlan } from '@/types/api';

type Mode = 'rubric' | 'score';

/**
 * Dars ishlanmasi ekspertizasi. Hujjat, 3-modul: «tayyor ishlanma o'qituvchi tomonidan belgilangan mezonlar asosida baholanadi» —
 * shuning uchun asosiy rejim rubrika; umumiy ball faqat rubrika bo'lmaganda zaxira variant.
 */
export const LessonReviewPanel = ({ l, loading, onSubmit }: { l: LessonPlan; loading: boolean; onSubmit: (v: LessonReviewInput) => void }) => {
  const rubrics = useQuery({ queryKey: ['rubrics'], queryFn: assignmentsService.rubrics });
  const [decision, setDecision] = useState<'ACCEPT' | 'RETURN'>('ACCEPT');
  const [mode, setMode] = useState<Mode>('rubric');
  const [rubricId, setRubricId] = useState<string | undefined>(l.assignment?.rubricId ?? undefined);
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [reflective, setReflective] = useState<number | null>(null);
  const [comment, setComment] = useState('');

  const usable = (rubrics.data ?? []).filter((r) => r.criteria.length > 0);
  const rubric = usable.find((r) => r.id === rubricId);
  const criteria = rubric?.criteria ?? [];
  const sum = criteria.reduce((s, c) => s + (scores[c.id] ?? 0), 0);
  const max = criteria.reduce((s, c) => s + c.maxScore, 0);
  const allScored = criteria.length > 0 && criteria.every((c) => scores[c.id] !== null && scores[c.id] !== undefined);
  const effectiveMode: Mode = usable.length === 0 ? 'score' : mode;

  const invalid =
    comment.trim().length < 2 ||
    (decision === 'ACCEPT' && (effectiveMode === 'rubric' ? !allScored : score === null));

  const send = () => {
    if (decision === 'RETURN') return onSubmit({ decision, comment });
    const base = { decision, comment, reflectiveScore: reflective ?? undefined };
    if (effectiveMode === 'rubric' && rubric) {
      return onSubmit({
        ...base,
        rubricId: rubric.id,
        criterionScores: criteria.map((c) => ({ criterionId: c.id, score: scores[c.id] ?? 0, comment: notes[c.id]?.trim() || undefined })),
      });
    }
    return onSubmit({ ...base, score: score ?? undefined });
  };

  return (
    <Card title="Dars ishlanmasi ekspertizasi" className="no-print border-accent">
      <Radio.Group value={decision} onChange={(e) => setDecision(e.target.value)} className="mb-4" optionType="button" buttonStyle="solid">
        <Radio.Button value="ACCEPT">Qabul qilish va baholash</Radio.Button>
        <Radio.Button value="RETURN">Qayta ishlashga qaytarish</Radio.Button>
      </Radio.Group>

      {decision === 'ACCEPT' && (
        <div className="mb-4 space-y-4">
          {usable.length > 0 ? (
            <Radio.Group value={effectiveMode} onChange={(e) => setMode(e.target.value)}>
              <Radio value="rubric">Mezonlar (rubrika) bo‘yicha</Radio>
              <Radio value="score">Umumiy ball</Radio>
            </Radio.Group>
          ) : (
            !rubrics.isLoading && (
              <Alert
                type="warning"
                showIcon
                message="Hali mezonlar (rubrika) yaratilmagan"
                description={<>Mezonlar asosida baholash uchun <Link to="/app/rubrics">rubrika yarating</Link>. Hozircha umumiy ball qo‘yiladi.</>}
              />
            )
          )}

          {effectiveMode === 'rubric' && (
            <>
              <Select
                className="w-full sm:max-w-md"
                aria-label="Rubrika"
                placeholder="Baholash mezonlari to‘plamini tanlang"
                loading={rubrics.isLoading}
                value={rubricId}
                onChange={(v) => { setRubricId(v); setScores({}); setNotes({}); }}
                options={usable.map((r) => ({ value: r.id, label: `${r.title} (${r.criteria.length} mezon)` }))}
              />
              {rubric && (
                <Table
                  size="small"
                  rowKey="id"
                  pagination={false}
                  dataSource={criteria}
                  scroll={{ x: 560 }}
                  columns={[
                    {
                      title: 'Mezon',
                      render: (_, c) => (
                        <div>
                          <div className="font-medium">{c.title}</div>
                          {c.description && <div className="text-xs text-muted">{c.description}</div>}
                        </div>
                      ),
                    },
                    {
                      title: 'Ball',
                      width: 140,
                      render: (_, c) => (
                        <InputNumber
                          aria-label={`${c.title} bo‘yicha ball`}
                          min={0}
                          max={c.maxScore}
                          value={scores[c.id]}
                          onChange={(v) => setScores((s) => ({ ...s, [c.id]: v }))}
                          suffix={`/${c.maxScore}`}
                          className="w-full"
                        />
                      ),
                    },
                    {
                      title: 'Izoh',
                      width: 220,
                      render: (_, c) => (
                        <Input
                          aria-label={`${c.title} bo‘yicha izoh`}
                          placeholder="ixtiyoriy"
                          value={notes[c.id]}
                          onChange={(e) => setNotes((n) => ({ ...n, [c.id]: e.target.value }))}
                        />
                      ),
                    },
                  ]}
                  summary={() => (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}><b>Jami</b></Table.Summary.Cell>
                      <Table.Summary.Cell index={1} colSpan={2}>
                        <b>{sum} / {max}</b>
                        <span className="ml-2 text-muted">= {max ? Math.round((sum / max) * 1000) / 10 : 0}%</span>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                />
              )}
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {effectiveMode === 'score' && (
              <div>
                <div className="mb-1 text-sm">Umumiy ball (0–100)</div>
                <InputNumber aria-label="Umumiy ball" min={0} max={100} value={score} onChange={setScore} className="w-full" />
              </div>
            )}
            <div>
              <div className="mb-1 text-sm">Metodik qarorlar asosnomasi (refleksiv, ixtiyoriy, 0–100)</div>
              <InputNumber aria-label="Refleksiv ball" min={0} max={100} value={reflective} onChange={setReflective} className="w-full" />
            </div>
          </div>
        </div>
      )}

      <Input.TextArea rows={4} aria-label="Izoh va tavsiyalar" placeholder="Izoh va tavsiyalar (majburiy)" value={comment} onChange={(e) => setComment(e.target.value)} className="mb-4" />
      <Alert
        className="mb-4"
        type="info"
        showIcon
        message="Ball «Faoliyatli-metodik» komponentga «Dars ishlanmasi ekspertizasi» sifatida, refleksiv ball esa «Refleksiv-baholash» komponentga yoziladi."
      />
      <Button type="primary" disabled={invalid} loading={loading} onClick={send}>Yuborish</Button>
    </Card>
  );
};

/** Talaba va o'qituvchiga ko'rinadigan mezonlar bo'yicha natija */
export const LessonRubricResult = ({ l }: { l: LessonPlan }) => {
  if (!l.criterionScores?.length) return null;
  const sum = l.criterionScores.reduce((s, c) => s + c.score, 0);
  const max = l.criterionScores.reduce((s, c) => s + c.maxScore, 0);
  return (
    <Card size="small" title={`Mezonlar bo‘yicha baho${l.rubric ? `: ${l.rubric.title}` : ''}`} className="no-print">
      <Table
        size="small"
        rowKey="criterionId"
        pagination={false}
        dataSource={l.criterionScores}
        scroll={{ x: 480 }}
        columns={[
          { title: 'Mezon', dataIndex: 'title' },
          { title: 'Ball', width: 100, render: (_, c) => `${c.score} / ${c.maxScore}` },
          { title: 'Izoh', render: (_, c) => c.comment ?? '—' },
        ]}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0}><b>Jami</b></Table.Summary.Cell>
            <Table.Summary.Cell index={1} colSpan={2}><b>{sum} / {max}</b> <span className="text-muted">({l.score}%)</span></Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Card>
  );
};

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Input, InputNumber, Select, Tag } from 'antd';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { QUESTION_TYPE, toOptions } from '@/lib/labels';
import { LIKERT_DEFAULT, type DiagnosticFormValues, type QuestionValues } from '../diagnosticForm';

const LETTERS = 'abcdefghij';

/** Bitta savol muharriri: turi, komponent, matn, variantlar va to'g'ri javob(lar) */
export const QuestionEditor = ({
  form, index, components, onRemove,
}: { form: UseFormReturn<DiagnosticFormValues>; index: number; components: { id: string; name: string }[]; onRemove: () => void }) => {
  const base = `questions.${index}` as const;
  const err = form.formState.errors.questions?.[index];
  return (
    <Controller
      control={form.control}
      name={base}
      render={({ field }) => {
        const q = field.value as QuestionValues;
        const set = (patch: Partial<QuestionValues>) => field.onChange({ ...q, ...patch });
        const changeType = (type: QuestionValues['type']) =>
          set({ type, correct: [], options: type === 'LIKERT' ? LIKERT_DEFAULT : type === 'TEXT' ? [] : q.options.length >= 2 ? q.options : [{ id: 'a', text: '' }, { id: 'b', text: '' }] });
        const toggleCorrect = (id: string) =>
          set({ correct: q.type === 'SINGLE_CHOICE' ? [id] : q.correct.includes(id) ? q.correct.filter((x) => x !== id) : [...q.correct, id] });
        return (
          <Card size="small" className="mb-4" title={`${index + 1}-savol`} extra={<Button danger size="small" icon={<DeleteOutlined />} onClick={onRemove} aria-label="Savolni o‘chirish" />}>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_120px]">
              <Select value={q.type} options={toOptions(QUESTION_TYPE)} onChange={changeType} />
              <Select placeholder="Kompetensiya komponenti" value={q.componentId || undefined} status={err?.componentId ? 'error' : undefined} options={components.map((c) => ({ value: c.id, label: c.name }))} onChange={(componentId) => set({ componentId })} />
              <InputNumber min={0.5} step={0.5} value={q.points} onChange={(points) => set({ points: points ?? 1 })} suffix="ball" />
            </div>
            <Input.TextArea className="mt-3" autoSize={{ minRows: 2 }} placeholder="Savol matni" status={err?.prompt ? 'error' : undefined} value={q.prompt} onChange={(e) => set({ prompt: e.target.value })} />
            {q.type !== 'TEXT' && (
              <div className="mt-3 space-y-2">
                {q.type === 'LIKERT' && <Tag color="blue">Variantlar tartibi shkalani bildiradi: birinchisi — eng past, oxirgisi — eng yuqori</Tag>}
                {q.options.map((o, oi) => (
                  <div key={o.id} className="flex items-center gap-2">
                    {q.type !== 'LIKERT' && <Checkbox checked={q.correct.includes(o.id)} onChange={() => toggleCorrect(o.id)} aria-label="To‘g‘ri javob" />}
                    <Input value={o.text} placeholder={`${oi + 1}-variant`} onChange={(e) => set({ options: q.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) })} />
                    <Button size="small" icon={<DeleteOutlined />} disabled={q.options.length <= 2} onClick={() => set({ options: q.options.filter((x) => x.id !== o.id), correct: q.correct.filter((c) => c !== o.id) })} aria-label="Variantni o‘chirish" />
                  </div>
                ))}
                {q.options.length < 10 && (
                  <Button size="small" icon={<PlusOutlined />} onClick={() => set({ options: [...q.options, { id: LETTERS.split('').find((l) => !q.options.some((o) => o.id === l)) ?? String(Date.now()), text: '' }] })}>
                    Variant
                  </Button>
                )}
              </div>
            )}
            {(err?.options || err?.correct || err?.root) && <div className="mt-2 text-sm text-red-700">{err.options?.message ?? err.correct?.message ?? err.root?.message}</div>}
          </Card>
        );
      }}
    />
  );
};

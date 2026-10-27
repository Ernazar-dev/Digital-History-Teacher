import { ClusterOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Tooltip } from 'antd';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { QueryState } from '@/components/feedback/QueryState';
import { useNotify } from '@/hooks/useNotify';
import { assessmentsService } from '@/services/assessment.service';
import { assignmentsService, type RubricInput } from '@/services/learning.service';
import type { Rubric } from '@/types/api';

type Draft = RubricInput & { id?: string };
const newCriterion = () => ({ title: '', maxScore: 10, componentId: null });
const EMPTY: Draft = { title: '', description: '', criteria: [newCriterion()] };

const total = (criteria: { maxScore: number }[]) => criteria.reduce((s, c) => s + (c.maxScore || 0), 0);

/** Kompetensiya komponentlari ranglari — rubrikada qaysi mezon qaysi komponentga dalil berishini ajratadi */
const COMPONENT_COLOR: Record<string, { chip: string; bar: string }> = {
  MOTIVATIONAL: { chip: 'bg-amber-50 text-amber-800 ring-amber-200', bar: 'bg-amber-500' },
  COGNITIVE: { chip: 'bg-sky-50 text-sky-800 ring-sky-200', bar: 'bg-sky-600' },
  ACTIVITY: { chip: 'bg-emerald-50 text-emerald-800 ring-emerald-200', bar: 'bg-emerald-600' },
  REFLECTIVE: { chip: 'bg-violet-50 text-violet-800 ring-violet-200', bar: 'bg-violet-600' },
};
const NEUTRAL = { chip: 'bg-canvas text-muted ring-line', bar: 'bg-primary/70' };
const ROW = 'grid gap-x-4 gap-y-1.5 md:grid-cols-[28px_minmax(0,1fr)_170px_minmax(140px,220px)_64px] md:items-center';

/** Bitta rubrika: sarlavha, jami ball va amallar tepada; mezonlar tekis ustunli jadvalda */
const RubricCard = ({ r, onEdit, onDelete }: { r: Rubric; onEdit: () => void; onDelete: () => void }) => {
  const sum = total(r.criteria);
  const used = r._count?.assignments ?? 0;
  return (
    <article className="rounded-2xl border border-solid border-line bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 p-5 md:p-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-medium text-primary">{r.criteria.length} mezon</span>
            <span className={`rounded-full px-2.5 py-0.5 font-medium ${used > 0 ? 'bg-accent-soft text-[#8f6a24]' : 'bg-canvas text-muted'}`}>
              {used > 0 ? `${used} ta topshiriqda ishlatilgan` : 'Hali ishlatilmagan'}
            </span>
          </div>
          <h2 className="font-serif-title m-0 mt-3 text-[22px] font-semibold leading-snug text-ink">{r.title}</h2>
          {r.description && <p className="m-0 mt-1.5 max-w-prose text-sm leading-relaxed text-muted">{r.description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <div className="text-right">
            <div className="font-serif-title text-4xl font-bold leading-none text-primary tabular-nums">{sum}</div>
            <div className="mt-1 text-xs text-muted">ball jami</div>
          </div>
          <div className="flex gap-1 border-0 border-l border-solid border-line pl-4">
            <Tooltip title="Tahrirlash"><Button icon={<EditOutlined />} onClick={onEdit} aria-label="Tahrirlash" /></Tooltip>
            <Popconfirm title="Rubrikani o‘chirasizmi?" description={used > 0 ? 'Bu rubrika topshiriqlarda ishlatilgan.' : undefined} okText="Ha" cancelText="Yo‘q" onConfirm={onDelete}>
              <Tooltip title="O‘chirish"><Button danger icon={<DeleteOutlined />} aria-label="O‘chirish" /></Tooltip>
            </Popconfirm>
          </div>
        </div>
      </header>

      <div className="border-0 border-t border-solid border-line px-5 pb-3 md:px-6">
        <div className={`${ROW} hidden py-3 text-[11px] font-semibold uppercase tracking-wider text-muted md:grid`}>
          <span>№</span><span>Mezon</span><span>Komponent</span><span>Ulushi</span><span className="text-right">Ball</span>
        </div>
        <ol className="m-0 list-none p-0">
          {r.criteria.map((c, i) => {
            const share = sum ? Math.round((c.maxScore / sum) * 100) : 0;
            const color = (c.component && COMPONENT_COLOR[c.component.code]) || NEUTRAL;
            return (
              <li key={c.id} className={`${ROW} border-0 border-t border-solid border-line/70 py-3 first:border-t-0 md:first:border-t`}>
                <span className="hidden text-sm tabular-nums text-muted md:block">{i + 1}</span>
                <span className="min-w-0 text-[15px] font-medium text-ink">{c.title}</span>
                <span>
                  {c.component ? (
                    <span className={`inline-block max-w-full truncate rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${color.chip}`}>{c.component.name}</span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </span>
                <span className="flex items-center gap-2.5">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-canvas">
                    <span className={`block h-full rounded-full ${color.bar}`} style={{ width: `${share}%` }} />
                  </span>
                  <span className="w-9 text-right text-xs tabular-nums text-muted">{share}%</span>
                </span>
                <span className="text-right text-[15px] font-semibold tabular-nums text-ink md:text-right">{c.maxScore}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </article>
  );
};

export default function RubricsPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  const [draft, setDraft] = useState<Draft | null>(null);
  const q = useQuery({ queryKey: ['rubrics'], queryFn: assignmentsService.rubrics });
  const config = useQuery({ queryKey: ['assessment-config'], queryFn: assessmentsService.config });
  const save = useMutation({
    mutationFn: (d: Draft) => (d.id ? assignmentsService.updateRubric(d.id, d) : assignmentsService.createRubric(d)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rubrics'] }); setDraft(null); notify.success('Rubrika saqlandi'); },
    onError: (e) => notify.error(e),
  });
  const remove = useMutation({
    mutationFn: assignmentsService.deleteRubric,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rubrics'] }); notify.success('O‘chirildi'); },
    onError: (e) => notify.error(e),
  });
  const edit = (r: Rubric) => setDraft({ id: r.id, title: r.title, description: r.description, criteria: r.criteria.map((c) => ({ title: c.title, maxScore: c.maxScore, componentId: c.componentId, description: c.description })) });
  const setCrit = (i: number, patch: Partial<Draft['criteria'][number]>) =>
    setDraft((d) => d && { ...d, criteria: d.criteria.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  const valid = draft && draft.title.trim().length >= 3 && draft.criteria.length > 0 && draft.criteria.every((c) => c.title.trim().length >= 2 && c.maxScore > 0);
  const components = config.data?.components.map((k) => ({ value: k.id, label: k.name })) ?? [];

  return (
    <>
      <PageHeader
        title="Baholash rubrikalari"
        description="Rubrika — topshiriqni baholash mezonlari. Har bir mezonga ball va (ixtiyoriy) kompetensiya komponentini belgilang."
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setDraft(EMPTY)}>Yangi rubrika</Button>}
      />
      <QueryState
        query={q}
        isEmpty={(d) => d.length === 0}
        empty="Hali rubrika yo‘q"
        emptyAction={<Button type="primary" icon={<PlusOutlined />} onClick={() => setDraft(EMPTY)}>Birinchi rubrikani yaratish</Button>}
      >
        {(rubrics) => (
          <div className="stagger grid grid-cols-1 gap-6">
            {rubrics.map((r) => <RubricCard key={r.id} r={r} onEdit={() => edit(r)} onDelete={() => remove.mutate(r.id)} />)}
          </div>
        )}
      </QueryState>

      <Modal
        open={Boolean(draft)}
        width={760}
        title={<span className="flex items-center gap-2"><ClusterOutlined className="text-primary" />{draft?.id ? 'Rubrikani tahrirlash' : 'Yangi rubrika'}</span>}
        okText="Saqlash"
        cancelText="Bekor qilish"
        onCancel={() => setDraft(null)}
        okButtonProps={{ disabled: !valid, loading: save.isPending }}
        onOk={() => draft && save.mutate(draft)}
        destroyOnHidden
      >
        {draft && (
          <Form layout="vertical" className="pt-2">
            <Form.Item label="Rubrika nomi" required>
              <Input autoFocus placeholder="Masalan: Manba tahlili rubrikasi" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </Form.Item>
            <Form.Item label="Qisqa tavsif (ixtiyoriy)">
              <Input.TextArea rows={2} value={draft.description ?? ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </Form.Item>

            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Mezonlar</span>
              <span className="text-sm text-muted">Jami: <b className="text-ink">{total(draft.criteria)}</b> ball</span>
            </div>
            <div className="space-y-2">
              <div className="hidden gap-2 px-3 text-xs text-muted md:grid md:grid-cols-[1fr_190px_100px_32px]">
                <span>Mezon nomi</span><span>Komponent (ixtiyoriy)</span><span>Ball</span><span />
              </div>
              {draft.criteria.map((c, i) => (
                <div key={i} className="grid gap-2 rounded-xl bg-canvas p-2 md:grid-cols-[1fr_190px_100px_32px] md:items-center">
                  <Input placeholder={`${i + 1}-mezon`} value={c.title} onChange={(e) => setCrit(i, { title: e.target.value })} />
                  <Select allowClear placeholder="Komponent" value={c.componentId ?? undefined} onChange={(v) => setCrit(i, { componentId: v ?? null })} options={components} />
                  <InputNumber min={1} className="w-full" value={c.maxScore} onChange={(v) => setCrit(i, { maxScore: v ?? 1 })} aria-label="Ball" />
                  <Tooltip title="Mezonni o‘chirish">
                    <Button type="text" danger icon={<DeleteOutlined />} disabled={draft.criteria.length === 1}
                      onClick={() => setDraft({ ...draft, criteria: draft.criteria.filter((_, j) => j !== i) })} aria-label="Mezonni o‘chirish" />
                  </Tooltip>
                </div>
              ))}
            </div>
            <Button type="dashed" block icon={<PlusOutlined />} className="mt-3" onClick={() => setDraft({ ...draft, criteria: [...draft.criteria, newCriterion()] })}>
              Mezon qo‘shish
            </Button>
            <p className="mb-0 mt-3 text-xs text-muted">Topshiriqda baho qo‘yilgan rubrikani o‘zgartirib bo‘lmaydi — kerak bo‘lsa yangisini yarating.</p>
          </Form>
        )}
      </Modal>
    </>
  );
}

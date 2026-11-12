import { CloseOutlined, DeleteOutlined, EditOutlined, HistoryOutlined, PlusOutlined, TagsOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Empty, Form, Input, InputNumber, Modal, Popconfirm, Skeleton, Tooltip } from 'antd';
import { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useNotify } from '@/hooks/useNotify';
import i18n from '@/i18n';
import { catalogService } from '@/services/catalog.service';
import type { Period, Topic } from '@/types/api';
import { yearLabel } from '@/utils/format';

type PeriodDraft = { id?: string; name: string; startYear: number | null; endYear: number | null; reference: string };
const EMPTY_PERIOD: PeriodDraft = { name: '', startYear: null, endYear: null, reference: '' };

const years = (p: Pick<Period, 'startYear' | 'endYear'>) => [yearLabel(p.startYear), yearLabel(p.endYear)].filter(Boolean).join(' – ');

/** Mavzu chipi — yonidagi × bilan oʻchiriladi */
const TopicChip = ({ t, onDelete }: { t: Topic; onDelete: () => void }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-solid border-line bg-canvas py-1 pl-3 pr-1 text-sm">
    {t.name}
    {(t._count?.sources ?? 0) > 0 && <span className="text-xs text-muted">· {t._count!.sources}</span>}
    <Popconfirm title={i18n.t('taxonomy.topicDelQ')} okText={i18n.t('tests.yes')} cancelText={i18n.t('tests.no')} onConfirm={onDelete}>
      <button type="button" aria-label={i18n.t('taxonomy.topicDelAria', { name: t.name })} className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[10px] text-muted hover:bg-red-50 hover:text-red-600">
        <CloseOutlined />
      </button>
    </Popconfirm>
  </span>
);

/** Davrga mavzu qoʻshish uchun ixcham maydon (Enter bilan ham qoʻshiladi) */
const AddTopic = ({ periodId, onAdd, loading }: { periodId: string | null; onAdd: (name: string, periodId: string | null) => Promise<unknown>; loading: boolean }) => {
  const [name, setName] = useState('');
  const submit = () => {
    if (name.trim().length >= 2) void onAdd(name.trim(), periodId).then(() => setName(''));
  };
  return (
    <div className="flex max-w-md gap-2">
      <Input placeholder={i18n.t('taxonomy.newTopicPh')} value={name} onChange={(e) => setName(e.target.value)} onPressEnter={submit} />
      <Button icon={<PlusOutlined />} disabled={name.trim().length < 2} loading={loading} onClick={submit}>{i18n.t('lesson.res.add')}</Button>
    </div>
  );
};

export default function TaxonomyPage() {
  const qc = useQueryClient();
  const notify = useNotify();
  // Boshqaruv sahifasi doim asosiy (oʻzbekcha) nomlar bilan ishlaydi — tarjima ustiga yozilib ketmasligi uchun
  const periods = useQuery({ queryKey: ['admin-periods'], queryFn: catalogService.periodsBase });
  const topics = useQuery({ queryKey: ['admin-topics'], queryFn: catalogService.topicsBase });
  const [draft, setDraft] = useState<PeriodDraft | null>(null);

  const refresh = () => {
    for (const key of ['periods', 'topics', 'admin-periods', 'admin-topics']) qc.invalidateQueries({ queryKey: [key] });
  };
  const savePeriod = useMutation({
    mutationFn: ({ id, ...d }: PeriodDraft) => {
      const body = { ...d, name: d.name.trim(), reference: d.reference.trim() || null };
      return id ? catalogService.updatePeriod(id, body) : catalogService.createPeriod(body);
    },
    onSuccess: (_, d) => { refresh(); setDraft(null); notify.success(d.id ? i18n.t('taxonomy.periodUpdated') : i18n.t('taxonomy.periodAdded')); },
    onError: (e) => notify.error(e),
  });
  const delPeriod = useMutation({ mutationFn: catalogService.deletePeriod, onSuccess: () => { refresh(); notify.success(i18n.t('taxonomy.periodDeleted')); }, onError: (e) => notify.error(e) });
  const addTopic = useMutation({
    mutationFn: ({ name, periodId }: { name: string; periodId: string | null }) => catalogService.createTopic({ name, periodId }),
    onSuccess: () => { refresh(); notify.success(i18n.t('taxonomy.topicAdded')); },
    onError: (e) => notify.error(e),
  });
  const delTopic = useMutation({ mutationFn: catalogService.deleteTopic, onSuccess: () => { refresh(); notify.success(i18n.t('taxonomy.topicDeleted')); }, onError: (e) => notify.error(e) });

  const onAddTopic = (name: string, periodId: string | null) => addTopic.mutateAsync({ name, periodId });
  const topicsOf = (periodId: string | null) => (topics.data ?? []).filter((t) => (t.periodId ?? null) === periodId);
  const loose = topicsOf(null);
  const yearsInvalid = draft != null && draft.startYear != null && draft.endYear != null && draft.startYear > draft.endYear;
  const validDraft = draft != null && draft.name.trim().length >= 2 && !yearsInvalid;

  return (
    <>
      <PageHeader
        title={i18n.t('seg.taxonomy')}
        description={i18n.t('taxonomy.desc')}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setDraft(EMPTY_PERIOD)}>{i18n.t('taxonomy.newPeriod')}</Button>}
      />

      {periods.isLoading || topics.isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <div className="stagger space-y-5">
          {(periods.data ?? []).length === 0 && (
            <div className="rounded-2xl border border-solid border-line bg-white p-10">
              <Empty description={i18n.t('taxonomy.empty')}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setDraft(EMPTY_PERIOD)}>{i18n.t('taxonomy.first')}</Button>
              </Empty>
            </div>
          )}

          {(periods.data ?? []).map((p, i) => {
            const list = topicsOf(p.id);
            return (
              <section key={p.id} className="rounded-2xl border border-solid border-line bg-white p-5 transition-shadow duration-300 hover:shadow-lift md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="font-serif-title flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-lg font-bold text-primary">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium uppercase tracking-wider text-accent">{years(p) || i18n.t('explore.noYears')}</div>
                      <h2 className="font-serif-title m-0 mt-1 text-xl font-semibold leading-snug text-ink">{p.name}</h2>
                      <div className="mt-1 text-sm text-muted">
                        {i18n.t('taxonomy.stats', { s: p._count?.sources ?? 0, o: p._count?.virtualObjects ?? 0, t: list.length })}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Tooltip title={i18n.t('topic.edit')}>
                      <Button type="text" icon={<EditOutlined />} aria-label={i18n.t('taxonomy.editAria')}
                        onClick={() => setDraft({ id: p.id, name: p.name, startYear: p.startYear, endYear: p.endYear, reference: p.reference ?? '' })} />
                    </Tooltip>
                    <Popconfirm title={i18n.t('taxonomy.delPeriodQ')} description={i18n.t('taxonomy.delPeriodHint')} okText={i18n.t('tests.yes')} cancelText={i18n.t('tests.no')} onConfirm={() => delPeriod.mutate(p.id)}>
                      <Button type="text" danger icon={<DeleteOutlined />} aria-label={i18n.t('taxonomy.delAria')} />
                    </Popconfirm>
                  </div>
                </div>

                <div className="mt-5 border-0 border-t border-solid border-line pt-4 md:pl-[60px]">
                  {list.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {list.map((t) => <TopicChip key={t.id} t={t} onDelete={() => delTopic.mutate(t.id)} />)}
                    </div>
                  )}
                  <AddTopic periodId={p.id} onAdd={onAddTopic} loading={addTopic.isPending && addTopic.variables?.periodId === p.id} />
                </div>
              </section>
            );
          })}

          <section className="rounded-2xl border border-dashed border-line bg-white/60 p-5 md:p-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-lg text-[#7a5a1c]"><TagsOutlined /></span>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif-title m-0 text-xl font-semibold text-ink">{i18n.t('taxonomy.cross')}</h2>
                <p className="m-0 mt-1 text-sm text-muted">{i18n.t('taxonomy.crossHint')}</p>
                <div className="mt-4">
                  {loose.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {loose.map((t) => <TopicChip key={t.id} t={t} onDelete={() => delTopic.mutate(t.id)} />)}
                    </div>
                  )}
                  <AddTopic periodId={null} onAdd={onAddTopic} loading={addTopic.isPending && addTopic.variables?.periodId === null} />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      <Modal
        open={Boolean(draft)}
        title={<span className="flex items-center gap-2"><HistoryOutlined className="text-primary" />{draft?.id ? i18n.t('taxonomy.editTitle') : i18n.t('taxonomy.newPeriod')}</span>}
        okText={i18n.t('common.save')}
        cancelText={i18n.t('common.cancel')}
        onCancel={() => setDraft(null)}
        okButtonProps={{ disabled: !validDraft, loading: savePeriod.isPending }}
        onOk={() => draft && savePeriod.mutate(draft)}
        destroyOnHidden
      >
        {draft && (
          <Form layout="vertical" className="pt-2">
            <Form.Item label={i18n.t('taxonomy.periodName')} required>
              <Input autoFocus placeholder={i18n.t('taxonomy.periodNamePh')} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </Form.Item>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item label={i18n.t('taxonomy.startYear')} help={i18n.t('taxonomy.startHelp')}>
                <InputNumber className="w-full" placeholder="1370" value={draft.startYear} onChange={(v) => setDraft({ ...draft, startYear: v })} />
              </Form.Item>
              <Form.Item label={i18n.t('taxonomy.endYear')} validateStatus={yearsInvalid ? 'error' : undefined} help={yearsInvalid ? i18n.t('taxonomy.endHelp') : undefined}>
                <InputNumber className="w-full" placeholder="1507" value={draft.endYear} onChange={(v) => setDraft({ ...draft, endYear: v })} />
              </Form.Item>
            </div>
            <Form.Item label={i18n.t('taxonomy.noteOpt')} className="!mb-0">
              <Input.TextArea rows={2} placeholder={i18n.t('taxonomy.notePh')} value={draft.reference} onChange={(e) => setDraft({ ...draft, reference: e.target.value })} />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
}

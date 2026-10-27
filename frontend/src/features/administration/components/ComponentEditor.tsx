import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, Input, InputNumber, List, Modal, Popconfirm, Select, Space } from 'antd';
import { useState } from 'react';
import { useNotify } from '@/hooks/useNotify';
import { EVIDENCE_KIND, toOptions } from '@/lib/labels';
import { assessmentsService } from '@/services/assessment.service';
import type { AssessmentComponent, AssessmentIndicator, EvidenceKind } from '@/types/api';

/** Bitta kompetensiya komponenti: ta'rif, vazn, dalil turlari vaznlari, mezon va indikatorlar */
export const ComponentEditor = ({ c }: { c: AssessmentComponent }) => {
  const qc = useQueryClient();
  const notify = useNotify();
  const refresh = () => qc.invalidateQueries({ queryKey: ['assessment-config'] });
  const [meta, setMeta] = useState({ name: c.name, definition: c.definition, methods: c.methods ?? '', weight: c.weight });
  const [weights, setWeights] = useState(c.evidenceWeights.map((w) => ({ evidenceKind: w.evidenceKind, weight: w.weight })));
  const [criterion, setCriterion] = useState('');
  const [indicator, setIndicator] = useState<Record<string, string>>({});
  const onErr = (e: unknown) => notify.error(e);

  const saveMeta = useMutation({ mutationFn: () => assessmentsService.updateComponent(c.id, meta), onSuccess: () => { refresh(); notify.success('Komponent saqlandi'); }, onError: onErr });
  const saveWeights = useMutation({ mutationFn: () => assessmentsService.replaceWeights(c.id, weights), onSuccess: () => { refresh(); notify.success('Vaznlar saqlandi'); }, onError: onErr });
  const addCriterion = useMutation({ mutationFn: () => assessmentsService.addCriterion(c.id, { title: criterion }), onSuccess: () => { refresh(); setCriterion(''); }, onError: onErr });
  const delCriterion = useMutation({ mutationFn: assessmentsService.deleteCriterion, onSuccess: refresh, onError: onErr });
  const addIndicator = useMutation({ mutationFn: (cid: string) => assessmentsService.addIndicator(cid, { title: indicator[cid] }), onSuccess: (_d, cid) => { refresh(); setIndicator((s) => ({ ...s, [cid]: '' })); }, onError: onErr });
  const delIndicator = useMutation({ mutationFn: assessmentsService.deleteIndicator, onSuccess: refresh, onError: onErr });
  const [editing, setEditing] = useState<AssessmentIndicator | null>(null);
  const saveDescriptors = useMutation({
    mutationFn: (i: AssessmentIndicator) =>
      assessmentsService.updateIndicator(i.id, { lowDescriptor: i.lowDescriptor, mediumDescriptor: i.mediumDescriptor, highDescriptor: i.highDescriptor }),
    onSuccess: () => { refresh(); setEditing(null); notify.success('Daraja tavsiflari saqlandi'); },
    onError: onErr,
  });

  return (
    <Card title={`${c.name} (${c.code})`} className="mb-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-2">
          <Input prefix={<span className="text-muted">Nomi:</span>} value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} />
          <Input.TextArea rows={2} placeholder="Ta’rif" value={meta.definition} onChange={(e) => setMeta({ ...meta, definition: e.target.value })} />
          <Input prefix={<span className="text-muted">Baholash usullari:</span>} value={meta.methods} onChange={(e) => setMeta({ ...meta, methods: e.target.value })} />
          <InputNumber className="w-72" prefix={<span className="text-muted">Umumiy ko‘rsatkichdagi vazn:</span>} min={0} step={0.1} value={meta.weight} onChange={(v) => setMeta({ ...meta, weight: v ?? 0 })} />
          <div><Button loading={saveMeta.isPending} onClick={() => saveMeta.mutate()}>Saqlash</Button></div>
          <div className="pt-4 font-medium">Dalil turlari vaznlari (komponent ichida)</div>
          {weights.map((w, i) => (
            <Space key={i} className="flex">
              <Select className="w-56" value={w.evidenceKind} options={toOptions(EVIDENCE_KIND)} onChange={(v: EvidenceKind) => setWeights(weights.map((x, j) => (j === i ? { ...x, evidenceKind: v } : x)))} />
              <InputNumber min={0} step={0.1} value={w.weight} onChange={(v) => setWeights(weights.map((x, j) => (j === i ? { ...x, weight: v ?? 0 } : x)))} />
              <Button danger icon={<DeleteOutlined />} onClick={() => setWeights(weights.filter((_, j) => j !== i))} aria-label="O‘chirish" />
            </Space>
          ))}
          <Space>
            <Button icon={<PlusOutlined />} onClick={() => setWeights([...weights, { evidenceKind: 'EXPERT', weight: 1 }])}>Dalil turi</Button>
            <Button type="primary" loading={saveWeights.isPending} onClick={() => saveWeights.mutate()}>Vaznlarni saqlash</Button>
          </Space>
        </div>
        <div>
          <div className="mb-2 font-medium">Mezonlar va kuzatiladigan indikatorlar</div>
          <List
            dataSource={c.criteria}
            locale={{ emptyText: 'Mezonlar yo‘q' }}
            renderItem={(cr) => (
              <List.Item className="block">
                <div className="flex items-start justify-between gap-2">
                  <b>{cr.title}</b>
                  <Popconfirm title="Mezonni o‘chirasizmi?" okText="Ha" cancelText="Yo‘q" onConfirm={() => delCriterion.mutate(cr.id)}><Button size="small" type="text" danger icon={<DeleteOutlined />} aria-label="O‘chirish" /></Popconfirm>
                </div>
                <ul className="mb-2 mt-1 pl-5 text-sm">
                  {cr.indicators.map((ind) => (
                    <li key={ind.id}>
                      {ind.title}
                      {!(ind.lowDescriptor && ind.mediumDescriptor && ind.highDescriptor) && <span className="ml-1 text-xs text-red-700">(darajalar tavsiflanmagan)</span>}
                      <Button size="small" type="link" onClick={() => setEditing(ind)}>darajalar</Button>
                      <Button size="small" type="link" danger onClick={() => delIndicator.mutate(ind.id)}>o‘chirish</Button>
                    </li>
                  ))}
                </ul>
                <Space.Compact className="w-full">
                  <Input size="small" placeholder="Yangi indikator" value={indicator[cr.id] ?? ''} onChange={(e) => setIndicator((s) => ({ ...s, [cr.id]: e.target.value }))} />
                  <Button size="small" disabled={(indicator[cr.id] ?? '').trim().length < 2} onClick={() => addIndicator.mutate(cr.id)}>Qo‘shish</Button>
                </Space.Compact>
              </List.Item>
            )}
          />
          <Space.Compact className="mt-2 w-full">
            <Input placeholder="Yangi mezon" value={criterion} onChange={(e) => setCriterion(e.target.value)} />
            <Button type="primary" disabled={criterion.trim().length < 2} loading={addCriterion.isPending} onClick={() => addCriterion.mutate()}>Mezon qo‘shish</Button>
          </Space.Compact>
        </div>
      </div>
      <Modal
        open={Boolean(editing)}
        title={editing ? `Indikator darajalari: ${editing.title}` : ''}
        okText="Saqlash"
        cancelText="Bekor qilish"
        onCancel={() => setEditing(null)}
        okButtonProps={{ loading: saveDescriptors.isPending }}
        onOk={() => editing && saveDescriptors.mutate(editing)}
      >
        {editing && (
          <div className="space-y-3">
            {([['lowDescriptor', 'Past daraja · 1 ball'], ['mediumDescriptor', 'O‘rta daraja · 2 ball'], ['highDescriptor', 'Yuqori daraja · 3 ball']] as const).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-1 block text-sm font-medium">{label}</span>
                <Input.TextArea autoSize={{ minRows: 2 }} value={editing[key]} onChange={(e) => setEditing({ ...editing, [key]: e.target.value })} placeholder="Shu darajada talaba nimani qiladi (kuzatiladigan xatti-harakat)?" />
              </label>
            ))}
          </div>
        )}
      </Modal>
    </Card>
  );
};

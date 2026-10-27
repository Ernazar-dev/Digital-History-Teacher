import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Empty, Input, Select, Tag } from 'antd';
import { useState } from 'react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { SourcePicker } from '@/features/source-analysis/components/SourcePicker';
import { museumService } from '@/services/museum.service';
import { sourcesService } from '@/services/catalog.service';
import type { LessonFormValues } from '../lessonForm';
import { Hint } from './Hint';
import { TopicMaterials } from './TopicMaterials';

/** Tarixiy manbalar va 3D/360° obyektlarni tanlash, har biri uchun darsdagi maqsadi */
export const StepResources = ({ form }: { form: UseFormReturn<LessonFormValues> }) => {
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'resources' });
  const [sourceId, setSourceId] = useState<string>();
  const [objectId, setObjectId] = useState<string>();
  const objects = useQuery({ queryKey: ['objects', 'picker'], queryFn: () => museumService.list({ pageSize: 100 }) });
  const values = form.watch('resources');
  const topicId = form.watch('topicId');

  const addSource = async () => {
    if (!sourceId || values.some((r) => r.sourceId === sourceId)) return;
    const s = await sourcesService.get(sourceId);
    append({ sourceId, virtualObjectId: null, purpose: '', label: s.title });
    setSourceId(undefined);
  };
  const addObject = () => {
    const o = objects.data?.data.find((x) => x.id === objectId);
    if (!o || values.some((r) => r.virtualObjectId === o.id)) return;
    append({ sourceId: null, virtualObjectId: o.id, purpose: '', label: o.title });
    setObjectId(undefined);
  };

  return (
    <>
      <Hint
        items={[
          'Manba dars maqsadiga va o‘quvchilar yoshiga mosmi?',
          'Manbaning ishonchliligi va cheklovlarini o‘quvchilarga qanday tushuntirasiz?',
          'Manba darsning qaysi bosqichida va qanday maqsadda ishlatiladi?',
        ]}
      />
      {topicId ? (
        <TopicMaterials
          topicId={topicId}
          addedSourceIds={values.flatMap((r) => (r.sourceId ? [r.sourceId] : []))}
          addedObjectIds={values.flatMap((r) => (r.virtualObjectId ? [r.virtualObjectId] : []))}
          onAddSource={(id, label) => append({ sourceId: id, virtualObjectId: null, purpose: '', label })}
          onAddObject={(id, label) => append({ sourceId: null, virtualObjectId: id, purpose: '', label })}
        />
      ) : (
        <Alert className="mb-6" type="info" showIcon message="«Sinf va mavzu» qadamida katalogdagi mavzuni tanlasangiz, shu yerda unga oid manbalar taklif qilinadi." />
      )}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card size="small" title="Boshqa manbani qidirib qo‘shish">
          <div className="flex gap-2">
            <div className="flex-1"><SourcePicker value={sourceId} onChange={(v) => setSourceId(v)} /></div>
            <Button icon={<PlusOutlined />} onClick={() => void addSource()} disabled={!sourceId}>Qo‘shish</Button>
          </div>
        </Card>
        <Card size="small" title="3D/360° obyekt qo‘shish">
          <div className="flex gap-2">
            <Select
              className="flex-1"
              showSearch
              optionFilterProp="label"
              placeholder="Obyektni tanlang"
              value={objectId}
              onChange={setObjectId}
              loading={objects.isLoading}
              options={objects.data?.data.map((o) => ({ value: o.id, label: o.title }))}
            />
            <Button icon={<PlusOutlined />} onClick={addObject} disabled={!objectId}>Qo‘shish</Button>
          </div>
        </Card>
      </div>
      {fields.length === 0 && <Empty description="Hali manba tanlanmagan" />}
      {fields.map((f, i) => (
        <Card key={f.id} size="small" className="mb-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <Tag color={f.sourceId ? 'blue' : 'purple'}>{f.sourceId ? 'Tarixiy manba' : '3D/360° obyekt'}</Tag>
              <b>{f.label}</b>
            </div>
            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => remove(i)} aria-label="Olib tashlash" />
          </div>
          <Input.TextArea
            aria-label={`${f.label} — darsdagi maqsadi`}
            status={values[i]?.purpose?.trim() ? undefined : 'warning'}
            placeholder="Bu manba darsda qanday maqsadda ishlatiladi? (topshirish uchun majburiy)"
            autoSize={{ minRows: 2 }}
            value={values[i]?.purpose ?? ''}
            onChange={(e) => form.setValue(`resources.${i}.purpose`, e.target.value, { shouldDirty: true })}
          />
        </Card>
      ))}
    </>
  );
};

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Card, Empty, Input, Select, Tag } from 'antd';
import { useState } from 'react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { SourcePicker } from '@/features/source-library/components/SourcePicker';
import i18n from '@/i18n';
import { museumService } from '@/services/museum.service';
import { sourcesService } from '@/services/catalog.service';
import type { LessonFormValues } from '../lessonForm';
import { Hint, hints } from './Hint';
import { TopicMaterials } from './TopicMaterials';

/** Tarixiy manbalar va 3D/360° obyektlarni tanlaş, har biri uçun darsdagi maqsadi */
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
      <Hint items={hints('resources')} />
      {topicId ? (
        <TopicMaterials
          topicId={topicId}
          addedSourceIds={values.flatMap((r) => (r.sourceId ? [r.sourceId] : []))}
          addedObjectIds={values.flatMap((r) => (r.virtualObjectId ? [r.virtualObjectId] : []))}
          onAddSource={(id, label) => append({ sourceId: id, virtualObjectId: null, purpose: '', label })}
          onAddObject={(id, label) => append({ sourceId: null, virtualObjectId: id, purpose: '', label })}
        />
      ) : (
        <Alert className="mb-6" type="info" showIcon message={i18n.t('lesson.res.needTopic')} />
      )}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card size="small" title={i18n.t('lesson.res.findOther')}>
          <div className="flex gap-2">
            <div className="flex-1"><SourcePicker value={sourceId} onChange={(v) => setSourceId(v)} /></div>
            <Button icon={<PlusOutlined />} onClick={() => void addSource()} disabled={!sourceId}>{i18n.t('lesson.res.add')}</Button>
          </div>
        </Card>
        <Card size="small" title={i18n.t('lesson.res.addObject')}>
          <div className="flex gap-2">
            <Select
              className="flex-1"
              showSearch
              optionFilterProp="label"
              placeholder={i18n.t('lesson.res.pickObject')}
              value={objectId}
              onChange={setObjectId}
              loading={objects.isLoading}
              options={objects.data?.data.map((o) => ({ value: o.id, label: o.title }))}
            />
            <Button icon={<PlusOutlined />} onClick={addObject} disabled={!objectId}>{i18n.t('lesson.res.add')}</Button>
          </div>
        </Card>
      </div>
      {fields.length === 0 && <Empty description={i18n.t('lesson.res.none')} />}
      {fields.map((f, i) => (
        <Card key={f.id} size="small" className="mb-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <Tag color={f.sourceId ? 'blue' : 'purple'}>{f.sourceId ? i18n.t('lesson.res.sourceTag') : i18n.t('lesson.res.objectTag')}</Tag>
              <b>{f.label}</b>
            </div>
            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => remove(i)} aria-label={i18n.t('lesson.res.removeAria')} />
          </div>
          <Input.TextArea
            aria-label={i18n.t('lesson.res.purposeAria', { label: f.label })}
            status={values[i]?.purpose?.trim() ? undefined : 'warning'}
            placeholder={i18n.t('lesson.res.purposePh')}
            autoSize={{ minRows: 2 }}
            value={values[i]?.purpose ?? ''}
            onChange={(e) => form.setValue(`resources.${i}.purpose`, e.target.value, { shouldDirty: true })}
          />
        </Card>
      ))}
    </>
  );
};

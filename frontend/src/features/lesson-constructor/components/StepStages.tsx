import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Progress } from 'antd';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { NumberField, TextAreaField, TextField } from '@/components/forms/fields';
import i18n from '@/i18n';
import type { LessonFormValues } from '../lessonForm';
import { Hint, hints } from './Hint';

/** Dars bosqiçlari va vaqt taqsimoti (umumiy vaqt nazorati bilan) */
export const StepStages = ({ form }: { form: UseFormReturn<LessonFormValues> }) => {
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'stages' });
  const stages = form.watch('stages');
  const duration = form.watch('durationMinutes') || 0;
  const used = stages.reduce((s, st) => s + (Number(st.durationMinutes) || 0), 0);
  const over = used > duration;

  return (
    <>
      <Hint items={hints('stages')} />
      <Card size="small" className="mb-4">
        <div className="mb-1 text-sm">{i18n.t('lesson.stages.time', { used, total: duration })}</div>
        <Progress percent={duration ? Math.min(100, Math.round((used / duration) * 100)) : 0} status={over ? 'exception' : undefined} />
        {over && <Alert type="error" showIcon message={i18n.t('lesson.stages.over')} />}
      </Card>
      {fields.map((f, i) => (
        <Card
          key={f.id}
          size="small"
          className="mb-4"
          title={i18n.t('lesson.stages.stageN', { n: i + 1 })}
          extra={
            <div className="flex gap-1">
              <Button size="small" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={i18n.t('lesson.stages.up')}>↑</Button>
              <Button size="small" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} aria-label={i18n.t('lesson.stages.down')}>↓</Button>
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => remove(i)} aria-label={i18n.t('lesson.stages.delAria')} />
            </div>
          }
        >
          <div className="grid gap-x-4 md:grid-cols-[1fr_160px]">
            <TextField control={form.control} name={`stages.${i}.title`} label={i18n.t('lesson.stages.name')} required />
            <NumberField control={form.control} name={`stages.${i}.durationMinutes`} label={i18n.t('lesson.stages.minutes')} min={1} max={240} />
            <TextAreaField control={form.control} name={`stages.${i}.teacherActivity`} label={i18n.t('lesson.stages.teacher')} rows={2} />
            <TextAreaField control={form.control} name={`stages.${i}.studentActivity`} label={i18n.t('lesson.stages.student')} rows={2} />
            <TextField control={form.control} name={`stages.${i}.methods`} label={i18n.t('lesson.stages.methods')} />
            <TextField control={form.control} name={`stages.${i}.resources`} label={i18n.t('lesson.stages.resources')} />
          </div>
        </Card>
      ))}
      <Button
        icon={<PlusOutlined />}
        onClick={() => append({ title: '', durationMinutes: 5, teacherActivity: '', studentActivity: '', methods: '', resources: '' })}
      >
        {i18n.t('lesson.stages.add')}
      </Button>
    </>
  );
};

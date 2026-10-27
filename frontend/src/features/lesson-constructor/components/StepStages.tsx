import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Progress } from 'antd';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { NumberField, TextAreaField, TextField } from '@/components/forms/fields';
import type { LessonFormValues } from '../lessonForm';
import { Hint } from './Hint';

/** Dars bosqichlari va vaqt taqsimoti (umumiy vaqt nazorati bilan) */
export const StepStages = ({ form }: { form: UseFormReturn<LessonFormValues> }) => {
  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'stages' });
  const stages = form.watch('stages');
  const duration = form.watch('durationMinutes') || 0;
  const used = stages.reduce((s, st) => s + (Number(st.durationMinutes) || 0), 0);
  const over = used > duration;

  return (
    <>
      <Hint items={['Har bir bosqichda o‘qituvchi va o‘quvchi nima qiladi?', 'Manba bilan ishlashga yetarli vaqt ajratilganmi?', 'Bosqichlar ketma-ketligi mantiqiymi?']} />
      <Card size="small" className="mb-4">
        <div className="mb-1 text-sm">Vaqt taqsimoti: {used} / {duration} daqiqa</div>
        <Progress percent={duration ? Math.min(100, Math.round((used / duration) * 100)) : 0} status={over ? 'exception' : undefined} />
        {over && <Alert type="error" showIcon message="Bosqichlar davomiyligi dars vaqtidan oshib ketdi" />}
      </Card>
      {fields.map((f, i) => (
        <Card
          key={f.id}
          size="small"
          className="mb-4"
          title={`${i + 1}-bosqich`}
          extra={
            <div className="flex gap-1">
              <Button size="small" disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Yuqoriga">↑</Button>
              <Button size="small" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} aria-label="Pastga">↓</Button>
              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => remove(i)} aria-label="Bosqichni o‘chirish" />
            </div>
          }
        >
          <div className="grid gap-x-4 md:grid-cols-[1fr_160px]">
            <TextField control={form.control} name={`stages.${i}.title`} label="Bosqich nomi" required />
            <NumberField control={form.control} name={`stages.${i}.durationMinutes`} label="Daqiqa" min={1} max={240} />
            <TextAreaField control={form.control} name={`stages.${i}.teacherActivity`} label="O‘qituvchi faoliyati" rows={2} />
            <TextAreaField control={form.control} name={`stages.${i}.studentActivity`} label="O‘quvchi faoliyati" rows={2} />
            <TextField control={form.control} name={`stages.${i}.methods`} label="Metod va vositalar" />
            <TextField control={form.control} name={`stages.${i}.resources`} label="Ishlatiladigan manbalar" />
          </div>
        </Card>
      ))}
      <Button
        icon={<PlusOutlined />}
        onClick={() => append({ title: '', durationMinutes: 5, teacherActivity: '', studentActivity: '', methods: '', resources: '' })}
      >
        Bosqich qo‘shish
      </Button>
    </>
  );
};

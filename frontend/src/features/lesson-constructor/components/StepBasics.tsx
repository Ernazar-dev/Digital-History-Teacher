import { useQuery } from '@tanstack/react-query';
import { Form, Select } from 'antd';
import { useMemo } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { NumberField, SelectField, TextAreaField, TextField } from '@/components/forms/fields';
import { catalogService } from '@/services/catalog.service';
import { GRADE_OPTIONS, type LessonFormValues } from '../lessonForm';
import { Hint } from './Hint';

/** Katalog mavzulari davrlar bo'yicha guruhlangan holda */
const useTopicOptions = () => {
  const topics = useQuery({ queryKey: ['topics', 'all'], queryFn: () => catalogService.topics() });
  const options = useMemo(() => {
    const groups = new Map<string, { value: string; label: string }[]>();
    topics.data?.forEach((t) => {
      const key = t.period?.name ?? 'Boshqa mavzular';
      groups.set(key, [...(groups.get(key) ?? []), { value: t.id, label: t.name }]);
    });
    return [...groups].map(([label, opts]) => ({ label, options: opts }));
  }, [topics.data]);
  return { options, topics: topics.data ?? [], loading: topics.isLoading };
};

export const StepBasics = ({ form }: { form: UseFormReturn<LessonFormValues> }) => {
  const { options, topics, loading } = useTopicOptions();
  return (
    <>
      <Hint items={['Qaysi sinf o‘quvchilari uchun dars tayyorlayapsiz va ularning yosh xususiyatlari qanday?', 'Mavzu o‘quv dasturining qaysi bo‘limiga mos keladi?']} />
      <div className="grid gap-x-6 md:grid-cols-2">
        <TextField control={form.control} name="title" label="Dars ishlanmasi sarlavhasi" required className="md:col-span-2" />
        <Controller
          control={form.control}
          name="topicId"
          render={({ field }) => (
            <Form.Item
              label="Katalogdagi mavzu"
              layout="vertical"
              help="Tanlasangiz, «Tarixiy manbalar» qadamida shu mavzuga oid materiallar taklif qilinadi"
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                loading={loading}
                aria-label="Katalogdagi mavzu"
                placeholder="Masalan: Jadidchilik harakati"
                value={field.value ?? undefined}
                options={options}
                onChange={(v?: string) => {
                  field.onChange(v ?? null);
                  const name = topics.find((t) => t.id === v)?.name;
                  if (name) form.setValue('topic', name, { shouldDirty: true, shouldValidate: true });
                }}
              />
            </Form.Item>
          )}
        />
        <TextField control={form.control} name="topic" label="Tarix fanining mavzusi (dars mavzusi)" required />
        <SelectField control={form.control} name="gradeLevel" label="Sinf yoki ta’lim darajasi" required options={GRADE_OPTIONS} />
        <NumberField control={form.control} name="durationMinutes" label="Davomiyligi (daqiqa)" min={5} max={240} required />
      </div>
    </>
  );
};

export const StepGoals = ({ form }: { form: UseFormReturn<LessonFormValues> }) => (
  <>
    <Hint
      items={[
        'Dars oxirida o‘quvchi nimani bilishi va nimani qila olishi kerak?',
        'Maqsad o‘lchanadigan (kuzatiladigan) fe’llar bilan ifodalanganmi?',
        'Tarixiy tafakkurning qaysi ko‘nikmasi (manba tahlili, sabab-oqibat, taqqoslash) rivojlantiriladi?',
      ]}
    />
    <TextAreaField control={form.control} name="goals" label="Darsning maqsadi" rows={3} />
    <TextAreaField control={form.control} name="objectives" label="Darsning vazifalari" rows={3} />
    <TextAreaField control={form.control} name="learningOutcomes" label="Kutilayotgan o‘quv natijalari" rows={3} />
  </>
);

export const StepAssessment = ({ form }: { form: UseFormReturn<LessonFormValues> }) => (
  <>
    <Hint
      items={[
        'O‘quvchining manba bilan ishlash natijasini qaysi mezonlar asosida baholaysiz?',
        'Refleksiya savollari o‘quvchini o‘z xulosasini qayta ko‘rib chiqishga undaydimi?',
        'Nima uchun aynan shu manbalar va metodlarni tanladingiz? (metodik asosnoma)',
      ]}
    />
    <TextAreaField control={form.control} name="assessmentCriteria" label="O‘quvchilar bilimini baholash mezonlari" rows={4} />
    <TextAreaField control={form.control} name="reflectionQuestions" label="Yakuniy refleksiya savollari" rows={3} />
    <TextAreaField control={form.control} name="methodicalRationale" label="Metodik qarorlaringiz asosnomasi" rows={4} help="Bu qism o‘qituvchi tomonidan refleksiv komponent bo‘yicha baholanishi mumkin" />
  </>
);

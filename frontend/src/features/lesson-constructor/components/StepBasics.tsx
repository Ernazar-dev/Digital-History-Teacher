import { useQuery } from '@tanstack/react-query';
import { Form, Select } from 'antd';
import { useMemo } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { NumberField, SelectField, TextAreaField, TextField } from '@/components/forms/fields';
import i18n from '@/i18n';
import { catalogService } from '@/services/catalog.service';
import { GRADE_OPTIONS, type LessonFormValues } from '../lessonForm';
import { Hint, hints } from './Hint';

/** Katalog mavzulari davrlar bo'yicha guruhlangan holda */
const useTopicOptions = () => {
  const topics = useQuery({ queryKey: ['topics', 'all'], queryFn: () => catalogService.topics() });
  const options = useMemo(() => {
    const groups = new Map<string, { value: string; label: string }[]>();
    topics.data?.forEach((t) => {
      const key = t.period?.name ?? i18n.t('lesson.f.otherTopics');
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
      <Hint items={hints('basics')} />
      <div className="grid gap-x-6 md:grid-cols-2">
        <TextField control={form.control} name="title" label={i18n.t('lesson.f.title')} required className="md:col-span-2" />
        <Controller
          control={form.control}
          name="topicId"
          render={({ field }) => (
            <Form.Item
              label={i18n.t('lesson.f.topicCatalog')}
              layout="vertical"
              help={i18n.t('lesson.f.topicCatalogHelp')}
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                loading={loading}
                aria-label={i18n.t('lesson.f.topicCatalog')}
                placeholder={i18n.t('lesson.f.topicPh')}
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
        <TextField control={form.control} name="topic" label={i18n.t('lesson.f.topic')} required />
        <SelectField control={form.control} name="gradeLevel" label={i18n.t('lesson.f.course')} required options={GRADE_OPTIONS} />
        <NumberField control={form.control} name="durationMinutes" label={i18n.t('lesson.f.duration')} min={5} max={240} required />
      </div>
    </>
  );
};

export const StepGoals = ({ form }: { form: UseFormReturn<LessonFormValues> }) => (
  <>
    <Hint items={hints('goals')} />
    <TextAreaField control={form.control} name="goals" label={i18n.t('lesson.f.goals')} rows={3} />
    <TextAreaField control={form.control} name="objectives" label={i18n.t('lesson.f.objectives')} rows={3} />
    <TextAreaField control={form.control} name="learningOutcomes" label={i18n.t('lesson.f.outcomes')} rows={3} />
  </>
);

export const StepAssessment = ({ form }: { form: UseFormReturn<LessonFormValues> }) => (
  <>
    <Hint items={hints('assessment')} />
    <TextAreaField control={form.control} name="assessmentCriteria" label={i18n.t('lesson.f.criteria')} rows={4} />
    <TextAreaField control={form.control} name="reflectionQuestions" label={i18n.t('lesson.f.reflection')} rows={3} />
    <TextAreaField control={form.control} name="methodicalRationale" label={i18n.t('lesson.f.rationale')} rows={4} help={i18n.t('lesson.f.rationaleHelp')} />
  </>
);

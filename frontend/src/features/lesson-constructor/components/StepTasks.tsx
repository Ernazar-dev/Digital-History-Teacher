import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Select } from 'antd';
import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form';
import { TextAreaField, TextField } from '@/components/forms/fields';
import i18n from '@/i18n';
import { METHOD_OPTIONS, type LessonFormValues } from '../lessonForm';
import { Hint, hints } from './Hint';

export const StepTasks = ({ form }: { form: UseFormReturn<LessonFormValues> }) => {
  const questions = useFieldArray({ control: form.control, name: 'problemQuestions' });
  return (
    <>
      <Hint items={hints('tasks')} />
      <div className="mb-6">
        <div className="mb-2 font-medium">{i18n.t('lesson.tasks.questions')}</div>
        {questions.fields.map((f, i) => (
          <div key={f.id} className="flex items-start gap-2">
            <TextField control={form.control} name={`problemQuestions.${i}.text`} className="flex-1" placeholder={i18n.t('lesson.tasks.qN', { n: i + 1 })} />
            <Button danger icon={<DeleteOutlined />} onClick={() => questions.remove(i)} aria-label={i18n.t('lesson.tasks.delQAria')} />
          </div>
        ))}
        <Button icon={<PlusOutlined />} onClick={() => questions.append({ text: '' })}>{i18n.t('lesson.tasks.addQ')}</Button>
      </div>
      <div className="grid gap-x-6 md:grid-cols-2">
        <TextAreaField control={form.control} name="individualTasks" label={i18n.t('lesson.tasks.individual')} rows={5} />
        <TextAreaField control={form.control} name="groupTasks" label={i18n.t('lesson.tasks.group')} rows={5} />
      </div>
      <Controller
        control={form.control}
        name="interactiveMethods"
        render={({ field }) => (
          <Form.Item label={i18n.t('lesson.tasks.methods')} layout="vertical" help={i18n.t('lesson.tasks.methodsHelp')}>
            <Select mode="tags" value={field.value} onChange={field.onChange} options={METHOD_OPTIONS} placeholder={i18n.t('lesson.tasks.methodsPh')} />
          </Form.Item>
        )}
      />
    </>
  );
};

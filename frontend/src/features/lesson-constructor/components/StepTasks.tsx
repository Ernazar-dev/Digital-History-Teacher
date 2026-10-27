import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Select } from 'antd';
import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form';
import { TextAreaField, TextField } from '@/components/forms/fields';
import { METHOD_OPTIONS, type LessonFormValues } from '../lessonForm';
import { Hint } from './Hint';

export const StepTasks = ({ form }: { form: UseFormReturn<LessonFormValues> }) => {
  const questions = useFieldArray({ control: form.control, name: 'problemQuestions' });
  return (
    <>
      <Hint
        items={[
          'Muammoli savol manbadagi dalillarga tayanib javob berishni talab qiladimi?',
          'Savolning bir nechta asosli javobi bo‘lishi mumkinmi?',
          'Individual va guruhli topshiriqlar bir-birini qanday to‘ldiradi?',
        ]}
      />
      <div className="mb-6">
        <div className="mb-2 font-medium">Manbalar asosidagi muammoli savollar</div>
        {questions.fields.map((f, i) => (
          <div key={f.id} className="flex items-start gap-2">
            <TextField control={form.control} name={`problemQuestions.${i}.text`} className="flex-1" placeholder={`${i + 1}-savol`} />
            <Button danger icon={<DeleteOutlined />} onClick={() => questions.remove(i)} aria-label="Savolni o‘chirish" />
          </div>
        ))}
        <Button icon={<PlusOutlined />} onClick={() => questions.append({ text: '' })}>Savol qo‘shish</Button>
      </div>
      <div className="grid gap-x-6 md:grid-cols-2">
        <TextAreaField control={form.control} name="individualTasks" label="Individual topshiriqlar" rows={5} />
        <TextAreaField control={form.control} name="groupTasks" label="Guruhli topshiriqlar" rows={5} />
      </div>
      <Controller
        control={form.control}
        name="interactiveMethods"
        render={({ field }) => (
          <Form.Item label="Interaktiv metodlar" layout="vertical" help="Ro‘yxatdan tanlang yoki o‘zingiz yozib Enter bosing">
            <Select mode="tags" value={field.value} onChange={field.onChange} options={METHOD_OPTIONS} placeholder="Metodlarni tanlang" />
          </Form.Item>
        )}
      />
    </>
  );
};

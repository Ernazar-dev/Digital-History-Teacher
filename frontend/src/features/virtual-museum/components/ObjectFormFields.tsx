import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Form } from 'antd';
import { Controller, useFieldArray, type UseFormReturn } from 'react-hook-form';
import { NumberField, SelectField, SwitchField, TextAreaField, TextField } from '@/components/forms/fields';
import { SourcePicker } from '@/features/source-analysis/components/SourcePicker';
import { OBJECT_TYPE, PROVIDER, TASK_KIND, toOptions } from '@/lib/labels';
import { catalogService } from '@/services/catalog.service';
import type { ObjectFormValues } from '../objectForm.schema';

export const ObjectFormFields = ({ form }: { form: UseFormReturn<ObjectFormValues> }) => {
  const { control } = form;
  const periods = useQuery({ queryKey: ['periods'], queryFn: catalogService.periods });
  const tasks = useFieldArray({ control, name: 'tasks' });
  return (
    <div className="space-y-6">
      <Card title="Asosiy ma’lumotlar">
        <div className="grid gap-x-6 md:grid-cols-2">
          <TextField control={control} name="title" label="Nomi" required className="md:col-span-2" />
          <SelectField control={control} name="type" label="Obyekt turi" options={toOptions(OBJECT_TYPE)} />
          <SelectField control={control} name="provider" label="Platforma" options={toOptions(PROVIDER)} />
          <SelectField control={control} name="periodId" label="Tarixiy davr" allowClear options={periods.data?.map((p) => ({ value: p.id, label: p.name })) ?? []} />
          <TextField control={control} name="periodLabel" label="Davr (matn)" />
          <TextField control={control} name="location" label="Joylashuvi" />
          <div className="grid grid-cols-2 gap-4">
            <NumberField control={control} name="latitude" label="Kenglik" help="Faqat aniq ma’lum bo‘lsa" step={0.0001} />
            <NumberField control={control} name="longitude" label="Uzunlik" step={0.0001} />
          </div>
          <TextAreaField control={control} name="description" label="Tavsif" required rows={4} className="md:col-span-2" />
          <TextAreaField control={control} name="historicalSignificance" label="Tarixiy ahamiyati" rows={3} className="md:col-span-2" />
          <TextAreaField control={control} name="historicalReferences" label="Tarixiy ma’lumotlar manbalari" rows={2} className="md:col-span-2" />
          <TextAreaField control={control} name="methodicalRecommendations" label="Metodik tavsiyalar" rows={3} className="md:col-span-2" />
        </div>
      </Card>
      <Card title="Tashqi kontent va litsenziya">
        <div className="grid gap-x-6 md:grid-cols-2">
          <TextField control={control} name="externalUrl" label="Tashqi manba URL" required help="Masalan: https://sketchfab.com/models/<ID>" />
          <TextField control={control} name="embedUrl" label="Embed URL (ixtiyoriy)" help="Sketchfab uchun bo‘sh qoldirish mumkin" />
          <TextField control={control} name="thumbnailUrl" label="Preview rasm URL" />
          <TextField control={control} name="authorOrOrganization" label="Muallif yoki tashkilot" />
          <TextField control={control} name="license" label="Litsenziya" />
          <TextAreaField control={control} name="termsNote" label="Foydalanish shartlari" rows={2} />
        </div>
      </Card>
      <Card title="Bog‘langan manbalar">
        <Controller
          control={control}
          name="sourceIds"
          render={({ field }) => (
            <Form.Item label="Tarixiy manbalar" layout="vertical">
              <SourcePicker mode="multiple" value={field.value} onChange={(v) => field.onChange(v)} placeholder="Manbalarni tanlang" />
            </Form.Item>
          )}
        />
      </Card>
      <Card title="Pedagogik topshiriqlar" extra={<Button icon={<PlusOutlined />} onClick={() => tasks.append({ kind: 'OBSERVATION', prompt: '' })}>Topshiriq qo‘shish</Button>}>
        {tasks.fields.length === 0 && <p className="m-0 text-muted">Kuzatuv savollari, dalil topshiriqlari va boshqalarni qo‘shing.</p>}
        {tasks.fields.map((f, i) => (
          <div key={f.id} className="grid items-start gap-x-4 md:grid-cols-[220px_1fr_auto]">
            <SelectField control={control} name={`tasks.${i}.kind`} label={i === 0 ? 'Turi' : undefined} options={toOptions(TASK_KIND)} />
            <TextAreaField control={control} name={`tasks.${i}.prompt`} label={i === 0 ? 'Topshiriq matni' : undefined} rows={2} />
            <Button danger icon={<DeleteOutlined />} className={i === 0 ? 'md:mt-[30px]' : ''} onClick={() => tasks.remove(i)} aria-label="Topshiriqni o‘chirish" />
          </div>
        ))}
      </Card>
      <Card title="Ko‘rinishi">
        <SwitchField control={control} name="isActive" label="O‘quvchilarga ko‘rinadi" />
      </Card>
    </div>
  );
};

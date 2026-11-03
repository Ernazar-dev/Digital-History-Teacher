import { Card } from 'antd';
import type { UseFormReturn } from 'react-hook-form';
import { TextAreaField, TextField } from '@/components/forms/fields';
import type { ObjectFormValues } from '../objectForm.schema';

export const ObjectFormFields = ({ form }: { form: UseFormReturn<ObjectFormValues> }) => {
  const { control } = form;
  return (
    <Card>
      <TextField control={control} name="title" label="Nomi" required placeholder="Masalan: Registon ansambli" />
      <TextField
        control={control}
        name="externalUrl"
        label="3D model yoki 360° havolasi"
        required
        placeholder="https://sketchfab.com/3d-models/... yoki https://uzbekistan360.uz/..."
        help="Sketchfab yoki Uzbekistan360 havolasini qo‘ying — 3D yoki 360° ekanini tizim o‘zi aniqlaydi"
      />
      <TextAreaField
        control={control}
        name="description"
        label="Obyekt haqida ma’lumot"
        required
        rows={8}
        placeholder="Obyekt qachon, kim tomonidan qurilgan, tarixiy ahamiyati, o‘quvchilar nimaga e’tibor berishi kerak..."
      />
    </Card>
  );
};

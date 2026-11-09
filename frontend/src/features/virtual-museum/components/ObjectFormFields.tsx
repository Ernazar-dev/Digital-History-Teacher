import { Card } from 'antd';
import type { UseFormReturn } from 'react-hook-form';
import { TextAreaField, TextField } from '@/components/forms/fields';
import i18n from '@/i18n';
import type { ObjectFormValues } from '../objectForm.schema';

export const ObjectFormFields = ({ form }: { form: UseFormReturn<ObjectFormValues> }) => {
  const { control } = form;
  return (
    <Card>
      <TextField control={control} name="title" label={i18n.t('objectForm.name')} required placeholder={i18n.t('objectForm.namePh')} />
      <TextField
        control={control}
        name="externalUrl"
        label={i18n.t('objectForm.url')}
        required
        placeholder={i18n.t('objectForm.urlPh')}
        help={i18n.t('objectForm.urlHelp')}
      />
      <TextAreaField
        control={control}
        name="description"
        label={i18n.t('objectForm.about')}
        required
        rows={8}
        placeholder={i18n.t('objectForm.aboutPh')}
      />
    </Card>
  );
};

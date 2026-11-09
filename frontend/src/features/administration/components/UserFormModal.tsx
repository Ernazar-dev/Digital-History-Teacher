import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Modal } from 'antd';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SelectField, TextField } from '@/components/forms/fields';
import { optionalEmailRule, passwordRule, usernameRule } from '@/features/auth/schemas';
import i18n from '@/i18n';
import { ROLE, toOptions, USER_STATUS } from '@/lib/labels';

const schema = z.object({
  fullName: z.string().trim().min(3, 'validation.min3'),
  username: usernameRule,
  email: optionalEmailRule,
  institution: z.string().optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']),
  status: z.enum(['PENDING', 'ACTIVE', 'BLOCKED']),
  password: passwordRule,
});
export type UserFormValues = z.infer<typeof schema>;

export const UserFormModal = ({ open, onClose, onSubmit, loading }: { open: boolean; onClose: () => void; onSubmit: (v: UserFormValues) => void; loading: boolean }) => {
  const { control, handleSubmit, reset } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', username: '', email: '', institution: '', role: 'STUDENT', status: 'ACTIVE', password: '' },
  });
  return (
    <Modal
      open={open}
      title={i18n.t('users.new')}
      okText={i18n.t('users.create')}
      cancelText={i18n.t('common.cancel')}
      confirmLoading={loading}
      onCancel={() => {
        reset();
        onClose();
      }}
      onOk={handleSubmit((v) => onSubmit(v))}
      destroyOnHidden
      width={640}
    >
      <Form layout="vertical" component="div">
        <div className="grid gap-x-4 sm:grid-cols-2">
          <TextField control={control} name="fullName" label={i18n.t('auth.fullName')} required />
          <TextField control={control} name="username" label={i18n.t('auth.username')} required placeholder="aziz.karimov" />
          <SelectField control={control} name="role" label={i18n.t('users.colRole')} options={toOptions(ROLE)} />
          <SelectField control={control} name="status" label={i18n.t('users.colStatus')} options={toOptions(USER_STATUS)} />
          <TextField control={control} name="email" label={i18n.t('profile.emailOptional')} />
          <TextField control={control} name="institution" label={i18n.t('users.institutionOpt')} />
        </div>
        <TextField control={control} name="password" label={i18n.t('users.initialPwd')} type="password" required help={i18n.t('users.pwdHelp')} />
      </Form>
    </Modal>
  );
};

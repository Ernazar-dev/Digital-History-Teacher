import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Modal } from 'antd';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { SelectField, TextField } from '@/components/forms/fields';
import { optionalEmailRule, passwordRule, usernameRule } from '@/features/auth/schemas';
import { ROLE, toOptions, USER_STATUS } from '@/lib/labels';

const schema = z.object({
  fullName: z.string().trim().min(3, 'Kamida 3 belgi'),
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
      title="Yangi foydalanuvchi"
      okText="Yaratish"
      cancelText="Bekor qilish"
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
          <TextField control={control} name="fullName" label="F.I.Sh." required />
          <TextField control={control} name="username" label="Login" required placeholder="aziz.karimov" />
          <SelectField control={control} name="role" label="Rol" options={toOptions(ROLE)} />
          <SelectField control={control} name="status" label="Holat" options={toOptions(USER_STATUS)} />
          <TextField control={control} name="email" label="Email (ixtiyoriy)" />
          <TextField control={control} name="institution" label="Muassasa (ixtiyoriy)" />
        </div>
        <TextField control={control} name="password" label="Boshlang‘ich parol" type="password" required help="Kamida 8 belgi. Birinchi kirishdan keyin o‘zgartirish tavsiya etiladi." />
      </Form>
    </Modal>
  );
};

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Descriptions, Form } from 'antd';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '@/components/common/PageHeader';
import { TextField } from '@/components/forms/fields';
import { PortfolioFiles } from '@/features/portfolio/components/PortfolioFiles';
import { useNotify } from '@/hooks/useNotify';
import { ROLE } from '@/lib/labels';
import { authService } from '@/services/auth.service';
import { fmtDateTime } from '@/utils/format';
import { useAuthStore } from '../auth.store';
import { optionalEmailRule, passwordRule } from '../schemas';

const profileSchema = z.object({ fullName: z.string().trim().min(3, 'Kamida 3 belgi'), email: optionalEmailRule, institution: z.string().trim().max(200) });
const passwordSchema = z
  .object({ currentPassword: z.string().min(1, 'Joriy parolni kiriting'), newPassword: passwordRule, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { message: 'Parollar mos emas', path: ['confirm'] });

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)!;
  const notify = useNotify();
  const navigate = useNavigate();
  const profile = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.fullName, email: user.email ?? '', institution: user.institution ?? '' },
  });
  const pwd = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });

  const save = useMutation({
    mutationFn: (v: z.infer<typeof profileSchema>) => authService.updateProfile({ fullName: v.fullName, email: v.email || null, institution: v.institution || null }),
    onSuccess: (u) => {
      useAuthStore.getState().setUser(u);
      notify.success('Profil saqlandi');
    },
    onError: (e) => notify.error(e),
  });
  const change = useMutation({
    mutationFn: (v: z.infer<typeof passwordSchema>) => authService.changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword }),
    onSuccess: () => {
      notify.success('Parol o‘zgartirildi. Qayta kiring.');
      useAuthStore.getState().clear();
      navigate('/login');
    },
    onError: (e) => notify.error(e),
  });

  return (
    <>
      <PageHeader title={user.role === 'STUDENT' ? 'Profil va portfolio' : 'Profil va sozlamalar'} />
      {user.role === 'STUDENT' && (
        <Card
          className="mb-6"
          title="Elektron portfolio"
          extra={<span className="hidden text-sm text-muted sm:inline">Ishlaringizni yuklang — o‘qituvchingiz ko‘ra oladi</span>}
        >
          <PortfolioFiles />
        </Card>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Shaxsiy ma’lumotlar">
          <Descriptions column={1} size="small" className="mb-4">
            <Descriptions.Item label="Login">{user.username}</Descriptions.Item>
            <Descriptions.Item label="Rol">{ROLE[user.role]}</Descriptions.Item>
            <Descriptions.Item label="Oxirgi kirish">{fmtDateTime(user.lastLoginAt)}</Descriptions.Item>
          </Descriptions>
          <Form layout="vertical" onFinish={profile.handleSubmit((v) => save.mutate(v))} component="form">
            <TextField control={profile.control} name="fullName" label="F.I.Sh." required />
            <TextField control={profile.control} name="email" label="Email (ixtiyoriy)" />
            <TextField control={profile.control} name="institution" label="Ta’lim muassasasi" />
            <Button type="primary" htmlType="submit" loading={save.isPending}>Saqlash</Button>
          </Form>
        </Card>
        <Card title="Parolni o‘zgartirish">
          <Form layout="vertical" onFinish={pwd.handleSubmit((v) => change.mutate(v))} component="form">
            <TextField control={pwd.control} name="currentPassword" label="Joriy parol" type="password" required />
            <TextField control={pwd.control} name="newPassword" label="Yangi parol" type="password" required />
            <TextField control={pwd.control} name="confirm" label="Yangi parolni takrorlang" type="password" required />
            <Button htmlType="submit" loading={change.isPending}>Parolni o‘zgartirish</Button>
          </Form>
        </Card>
      </div>
    </>
  );
}

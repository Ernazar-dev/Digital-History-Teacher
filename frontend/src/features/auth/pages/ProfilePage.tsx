import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Descriptions, Form } from 'antd';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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

const profileSchema = z.object({ fullName: z.string().trim().min(3, 'validation.min3'), email: optionalEmailRule, institution: z.string().trim().max(200) });
const passwordSchema = z
  .object({ currentPassword: z.string().min(1, 'validation.currentPwdRequired'), newPassword: passwordRule, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { message: 'validation.pwdMismatch', path: ['confirm'] });

export default function ProfilePage() {
  const { t } = useTranslation();
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
      notify.success(t('profile.saved'));
    },
    onError: (e) => notify.error(e),
  });
  const change = useMutation({
    mutationFn: (v: z.infer<typeof passwordSchema>) => authService.changePassword({ currentPassword: v.currentPassword, newPassword: v.newPassword }),
    onSuccess: () => {
      notify.success(t('profile.pwdChanged'));
      useAuthStore.getState().clear();
      navigate('/login');
    },
    onError: (e) => notify.error(e),
  });

  return (
    <>
      <PageHeader title={user.role === 'STUDENT' ? t('profile.titleStudent') : t('profile.titleStaff')} />
      {user.role === 'STUDENT' && (
        <Card
          className="mb-6"
          title={t('profile.portfolio')}
          extra={<span className="hidden text-sm text-muted sm:inline">{t('profile.portfolioHint')}</span>}
        >
          <PortfolioFiles />
        </Card>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t('profile.personal')}>
          <Descriptions column={1} size="small" className="mb-4">
            <Descriptions.Item label={t('auth.username')}>{user.username}</Descriptions.Item>
            <Descriptions.Item label={t('profile.role')}>{ROLE[user.role]}</Descriptions.Item>
            <Descriptions.Item label={t('profile.lastLogin')}>{fmtDateTime(user.lastLoginAt)}</Descriptions.Item>
          </Descriptions>
          <Form layout="vertical" onFinish={profile.handleSubmit((v) => save.mutate(v))} component="form">
            <TextField control={profile.control} name="fullName" label={t('auth.fullName')} required />
            <TextField control={profile.control} name="email" label={t('profile.emailOptional')} />
            <TextField control={profile.control} name="institution" label={t('profile.institution')} />
            <Button type="primary" htmlType="submit" loading={save.isPending}>{t('common.save')}</Button>
          </Form>
        </Card>
        <Card title={t('profile.changePwd')}>
          <Form layout="vertical" onFinish={pwd.handleSubmit((v) => change.mutate(v))} component="form">
            <TextField control={pwd.control} name="currentPassword" label={t('profile.currentPwd')} type="password" required />
            <TextField control={pwd.control} name="newPassword" label={t('auth.newPassword')} type="password" required />
            <TextField control={pwd.control} name="confirm" label={t('profile.repeatPwd')} type="password" required />
            <Button htmlType="submit" loading={change.isPending}>{t('profile.changePwd')}</Button>
          </Form>
        </Card>
      </div>
    </>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Form } from 'antd';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TextField } from '@/components/forms/fields';
import { errorMessage } from '@/lib/http';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '../auth.store';
import { useSiteViewStore } from '../siteView.store';
import { AuthShell } from '../components/AuthShell';
import { loginSchema, type LoginForm } from '../schemas';
import { safeNext } from '@/lib/safeNext';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { control, handleSubmit } = useForm<LoginForm>({ resolver: zodResolver(loginSchema), defaultValues: { username: '', password: '' } });
  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: ({ user, accessToken }) => {
      useAuthStore.getState().setSession(user, accessToken);
      // Xodim kirgach — sayt koʻrinishi emas, boshqaruv paneli ochiladi
      useSiteViewStore.getState().setSiteView(false);
      const next = params.get('next');
      navigate(safeNext(next), { replace: true });
    },
  });

  return (
    <AuthShell
      title={t('auth.welcome')}
      subtitle={t('auth.loginSub')}
      footer={<>{t('auth.noAccount')} <Link to={params.get('next') ? `/register?next=${encodeURIComponent(params.get('next')!)}` : '/register'} className="font-medium">{t('account.register')}</Link></>}
    >
      {login.isError && <Alert type="error" showIcon className="mb-4" message={errorMessage(login.error)} />}
      <Form layout="vertical" size="large" className="auth-form" onFinish={handleSubmit((v) => login.mutate(v))} component="form" noValidate>
        <TextField control={control} name="username" label={t('auth.username')} required autoComplete="username" placeholder={t('auth.usernamePlaceholder')} />
        <TextField control={control} name="password" label={t('auth.password')} type="password" required autoComplete="current-password" />
        <div className="-mt-1 mb-5 text-right text-sm">
          <Link to="/forgot-password">{t('auth.forgot')}</Link>
        </div>
        <Button type="primary" htmlType="submit" block size="large" loading={login.isPending} className="btn-shine">{t('account.login')}</Button>
      </Form>
    </AuthShell>
  );
}

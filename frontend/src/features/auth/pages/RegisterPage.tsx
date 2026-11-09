import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Button, Form, Result } from 'antd';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { SelectField, TextField } from '@/components/forms/fields';
import { useNotify } from '@/hooks/useNotify';
import { errorMessage } from '@/lib/http';
import { authService } from '@/services/auth.service';
import { groupsService } from '@/services/people.service';
import { useAuthStore } from '../auth.store';
import { AuthShell } from '../components/AuthShell';
import { registerSchema, type RegisterForm } from '../schemas';
import { safeNext } from '@/lib/safeNext';

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [params] = useSearchParams();
  const next = params.get('next');
  const { control, handleSubmit, setError } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', username: '', password: '', groupId: undefined },
  });
  const groups = useQuery({ queryKey: ['groups', 'public'], queryFn: groupsService.publicList });
  const hasGroups = (groups.data?.length ?? 0) > 0;
  // Guruhlar mavjud bo'lsa, talaba o'z guruhini tanlashi shart — aks holda topshiriqlar ko'rinmaydi
  const onSubmit = (v: RegisterForm) => {
    if (hasGroups && !v.groupId) {
      setError('groupId', { message: 'auth.groupRequired' });
      return;
    }
    register.mutate(v);
  };
  const register = useMutation({
    mutationFn: (v: RegisterForm) => authService.register({ ...v, username: v.username.toLowerCase() }),
    onSuccess: ({ user, accessToken }) => {
      // Faol hisob — darhol platformaga (qayta login shart emas)
      if (!accessToken) return;
      useAuthStore.getState().setSession(user, accessToken);
      notify.success(t('auth.welcomeUser', { name: user.fullName }));
      navigate(safeNext(next), { replace: true });
    },
  });

  // Faqat tasdiq kutayotgan hisob uchun (talabalarni avtomatik tasdiqlash o'chirilganda)
  if (register.isSuccess && !register.data.accessToken) {
    return (
      <div className="animate-scale-in mx-auto w-full max-w-lg rounded-[28px] border border-line bg-white px-6 py-4 shadow-lift">
        <Result
          status="info"
          title={t('auth.applied')}
          subTitle={register.data.message}
          extra={<Link to="/"><Button type="primary" size="large">{t('auth.toHome')}</Button></Link>}
        />
      </div>
    );
  }

  return (
    <AuthShell
      title={t('auth.createAccount')}
      subtitle={t('auth.registerSub')}
      footer={<>{t('auth.haveAccount')} <Link to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="font-medium">{t('account.login')}</Link></>}
    >
      {register.isError && <Alert type="error" showIcon className="mb-4" message={errorMessage(register.error)} />}
      <Form layout="vertical" className="auth-form" onFinish={handleSubmit(onSubmit)} component="form" noValidate>
        <TextField control={control} name="fullName" label={t('auth.fullName')} required autoComplete="name" placeholder={t('auth.fullNamePlaceholder')} />
        <TextField control={control} name="username" label={t('auth.username')} required autoComplete="username" placeholder="aziz.karimov" help={t('auth.usernameHelp')} />
        <TextField control={control} name="password" label={t('auth.password')} type="password" required autoComplete="new-password" help={t('auth.passwordHelp')} />
        {hasGroups && (
          <SelectField
            control={control}
            name="groupId"
            label={t('auth.group')}
            required
            placeholder={t('auth.pickGroup')}
            help={t('auth.groupHelp')}
            options={groups.data!.map((g) => ({ value: g.id, label: g.name }))}
          />
        )}
        <Button type="primary" htmlType="submit" block size="large" loading={register.isPending} className="btn-shine mt-1">{t('account.register')}</Button>
      </Form>
    </AuthShell>
  );
}

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Alert, Button, Form, Result } from 'antd';
import { useForm, useWatch } from 'react-hook-form';
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
  const navigate = useNavigate();
  const notify = useNotify();
  const [params] = useSearchParams();
  const next = params.get('next');
  const { control, handleSubmit, setError } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', username: '', role: 'STUDENT', password: '', groupId: undefined },
  });
  const role = useWatch({ control, name: 'role' });
  const groups = useQuery({ queryKey: ['groups', 'public'], queryFn: groupsService.publicList });
  const hasGroups = (groups.data?.length ?? 0) > 0;
  // Guruhlar mavjud bo'lsa, talaba o'z guruhini tanlashi shart — aks holda topshiriqlar ko'rinmaydi
  const onSubmit = (v: RegisterForm) => {
    if (v.role === 'STUDENT' && hasGroups && !v.groupId) {
      setError('groupId', { message: 'Guruhingizni tanlang' });
      return;
    }
    register.mutate(v.role === 'STUDENT' ? v : { ...v, groupId: undefined });
  };
  const register = useMutation({
    mutationFn: (v: RegisterForm) => authService.register({ ...v, username: v.username.toLowerCase() }),
    onSuccess: ({ user, accessToken }) => {
      // Faol hisob — darhol platformaga (qayta login shart emas)
      if (!accessToken) return;
      useAuthStore.getState().setSession(user, accessToken);
      notify.success(`Xush kelibsiz, ${user.fullName}!`);
      navigate(safeNext(next), { replace: true });
    },
  });

  // Faqat tasdiq kutayotgan hisob (o'qituvchi) uchun
  if (register.isSuccess && !register.data.accessToken) {
    return (
      <div className="animate-scale-in mx-auto w-full max-w-lg rounded-[28px] border border-line bg-white px-6 py-4 shadow-lift">
        <Result
          status="info"
          title="Ariza qabul qilindi"
          subTitle={register.data.message}
          extra={<Link to="/"><Button type="primary" size="large">Bosh sahifaga</Button></Link>}
        />
      </div>
    );
  }

  return (
    <AuthShell
      title="Hisob yaratish"
      subtitle="Bir necha soniyada metodik yo‘lingizni boshlang."
      footer={<>Hisobingiz bormi? <Link to={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="font-medium">Kirish</Link></>}
    >
      {register.isError && <Alert type="error" showIcon className="mb-4" message={errorMessage(register.error)} />}
      <Form layout="vertical" className="auth-form" onFinish={handleSubmit(onSubmit)} component="form" noValidate>
        <TextField control={control} name="fullName" label="F.I.Sh." required autoComplete="name" placeholder="Ism Familiya" />
        <TextField control={control} name="username" label="Login" required autoComplete="username" placeholder="aziz.karimov" help="Lotin harflari, raqamlar va . _ - (3–32 belgi)" />
        <TextField control={control} name="password" label="Parol" type="password" required autoComplete="new-password" help="Kamida 8 belgi" />
        <SelectField
          control={control}
          name="role"
          label="Rol"
          required
          options={[{ value: 'STUDENT', label: 'Talaba (bo‘lajak tarix o‘qituvchisi)' }, { value: 'TEACHER', label: 'O‘qituvchi — administrator tasdig‘idan so‘ng' }]}
        />
        {role === 'STUDENT' && hasGroups && (
          <SelectField
            control={control}
            name="groupId"
            label="Guruhingiz"
            required
            placeholder="Guruhni tanlang"
            help="Topshiriqlar shu guruh orqali beriladi"
            options={groups.data!.map((g) => ({ value: g.id, label: g.name }))}
          />
        )}
        <Button type="primary" htmlType="submit" block size="large" loading={register.isPending} className="btn-shine mt-1">Ro‘yxatdan o‘tish</Button>
      </Form>
    </AuthShell>
  );
}

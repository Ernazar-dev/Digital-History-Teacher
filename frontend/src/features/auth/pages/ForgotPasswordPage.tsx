import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Alert, Button, Form, Steps } from 'antd';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { TextField } from '@/components/forms/fields';
import { errorMessage } from '@/lib/http';
import { authService } from '@/services/auth.service';
import { AuthShell } from '../components/AuthShell';
import { passwordRule } from '../schemas';

const requestSchema = z.object({ username: z.string().trim().min(1, 'Loginni kiriting') });
const resetSchema = z.object({ token: z.string().min(20, 'Tokenni kiriting'), password: passwordRule });

/**
 * Parolni tiklash (2 bosqich, bitta ixcham oynada). Email yuborish servisi ulanmagan:
 * development rejimida token javobda qaytadi va avtomatik qo'yiladi; productionda administrator parolni qayta o'rnatadi.
 */
export default function ForgotPasswordPage() {
  const [step, setStep] = useState<0 | 1>(0);
  const [devToken, setDevToken] = useState(false);
  const req = useForm<z.infer<typeof requestSchema>>({ resolver: zodResolver(requestSchema), defaultValues: { username: '' } });
  const rst = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema), defaultValues: { token: '', password: '' } });
  const request = useMutation({
    mutationFn: (v: { username: string }) => authService.forgotPassword(v.username),
    onSuccess: (d) => {
      if (d.devResetToken) {
        setDevToken(true);
        rst.setValue('token', d.devResetToken);
      }
      setStep(1);
    },
  });
  const reset = useMutation({ mutationFn: (v: { token: string; password: string }) => authService.resetPassword(v.token, v.password) });

  return (
    <AuthShell
      title="Parolni tiklash"
      subtitle="Loginingizni kiriting va yangi parol o‘rnating."
      footer={<>Parolingiz esingizga tushdimi? <Link to="/login" className="font-medium">Kirish</Link></>}
    >
      <Steps size="small" current={step} className="mb-6" items={[{ title: 'Tiklash tokeni' }, { title: 'Yangi parol' }]} />

      {step === 0 ? (
        <Form layout="vertical" size="large" className="auth-form" onFinish={req.handleSubmit((v) => request.mutate(v))} component="form">
          {request.isError && <Alert className="mb-4" type="error" showIcon message={errorMessage(request.error)} />}
          <TextField control={req.control} name="username" label="Login" required autoComplete="username" />
          <Button htmlType="submit" type="primary" block loading={request.isPending} className="btn-shine">Tiklash tokenini olish</Button>
          <button type="button" className="mt-4 w-full cursor-pointer border-0 bg-transparent p-0 text-center text-sm text-primary hover:text-accent" onClick={() => setStep(1)}>
            Menda token bor
          </button>
        </Form>
      ) : (
        <Form layout="vertical" size="large" className="auth-form" onFinish={rst.handleSubmit((v) => reset.mutate(v))} component="form">
          {request.isSuccess && !reset.isSuccess && (
            <Alert
              className="mb-4"
              type="success"
              showIcon
              message={request.data.message}
              description={devToken ? 'Development rejimi: token avtomatik qo‘yildi.' : undefined}
            />
          )}
          {reset.isSuccess && <Alert className="mb-4" type="success" showIcon message={reset.data.message} action={<Link to="/login">Kirish</Link>} />}
          {reset.isError && <Alert className="mb-4" type="error" showIcon message={errorMessage(reset.error)} />}
          <TextField control={rst.control} name="token" label="Tiklash tokeni" required />
          <TextField control={rst.control} name="password" label="Yangi parol" type="password" required autoComplete="new-password" />
          <div className="flex gap-3">
            <Button onClick={() => setStep(0)}>Orqaga</Button>
            <Button htmlType="submit" type="primary" block loading={reset.isPending} className="btn-shine">Parolni yangilash</Button>
          </div>
        </Form>
      )}
    </AuthShell>
  );
}

import { Button, Result, Spin } from 'antd';
import type { ReactNode } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { GuestGate } from '@/components/feedback/LoginPrompt';
import { useAuthStore } from '@/features/auth/auth.store';
import i18n from '@/i18n';
import type { Role } from '@/types/api';
import { safeNext } from '@/lib/safeNext';

/**
 * Frontend guard faqat UX uchun — ruxsatlar backendda ham tekshiriladi.
 * Mehmon yopiq bo'limga kirsa — yo'naltirilmaydi, sahifa o'rnida "Kirish / Ro'yxatdan o'tish" taklifi ko'rinadi.
 */
/** Sessiya fonda tekshirilayotganda — kirish taklifi o'rniga qisqa kutish */
const Pending = () => <div className="flex min-h-[50vh] items-center justify-center"><Spin size="large" /></div>;

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  if (!user) return initialized ? <GuestGate /> : <Pending />;
  return <>{children}</>;
};

export const RequireRole = ({ roles, children }: { roles: Role[]; children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  if (!user) return initialized ? <GuestGate /> : <Pending />;
  if (!roles.includes(user.role)) {
    return (
      <Result
        status="403"
        title={i18n.t('misc.forbidden')}
        subTitle={i18n.t('misc.forbiddenText')}
        extra={<Link to="/app"><Button type="primary">{i18n.t('misc.toHome')}</Button></Link>}
      />
    );
  }
  return <>{children}</>;
};

/** Kirgan foydalanuvchi — ?next= dagi sahifaga (faqat /app ichida), aks holda /app ga */
export const GuestOnly = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  const [params] = useSearchParams();
  const next = params.get('next');
  if (user) return <Navigate to={safeNext(next)} replace />;
  return <>{children}</>;
};

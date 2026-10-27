import { Button, Result } from 'antd';
import type { ReactNode } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { GuestGate } from '@/components/feedback/LoginPrompt';
import { useAuthStore } from '@/features/auth/auth.store';
import type { Role } from '@/types/api';
import { safeNext } from '@/lib/safeNext';

/**
 * Frontend guard faqat UX uchun — ruxsatlar backendda ham tekshiriladi.
 * Mehmon yopiq bo'limga kirsa — yo'naltirilmaydi, sahifa o'rnida "Kirish / Ro'yxatdan o'tish" taklifi ko'rinadi.
 */
export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <GuestGate />;
  return <>{children}</>;
};

export const RequireRole = ({ roles, children }: { roles: Role[]; children: ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <GuestGate />;
  if (!roles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="Ruxsat yo‘q"
        subTitle="Bu sahifa sizning rolingiz uchun mavjud emas."
        extra={<Link to="/app"><Button type="primary">Bosh sahifaga</Button></Link>}
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

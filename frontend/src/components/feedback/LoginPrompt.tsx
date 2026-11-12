import { LockOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth.store';
import { useLoginPrompt } from '@/features/auth/loginPrompt.store';

/** Kirish/roʻyxatdan soʻng shu sahifaga qaytish uchun ?next= */
const useNext = () => {
  const { pathname, search } = useLocation();
  return `?next=${encodeURIComponent(pathname + search)}`;
};

const AuthButtons = ({ onClick }: { onClick?: () => void }) => {
  const { t } = useTranslation();
  const next = useNext();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
      <Link to={`/register${next}`} onClick={onClick}><Button type="primary" size="large" block>{t('account.register')}</Button></Link>
      <Link to={`/login${next}`} onClick={onClick}><Button size="large" block>{t('account.login')}</Button></Link>
    </div>
  );
};

/** Mehmon saqlash/yuborish kabi amal qilganda chiqadigan oyna (http interseptori ochadi) */
export const LoginPromptModal = () => {
  const { t } = useTranslation();
  const { open, hide } = useLoginPrompt();
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  useEffect(() => hide(), [pathname, user, hide]);
  return (
    <Modal open={open && !user} onCancel={hide} footer={null} width={420} centered>
      <div className="px-2 pb-2 pt-4 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-xl text-primary"><LockOutlined /></span>
        <h3 className="m-0 mt-4 text-lg font-semibold">{t('gate.signInFirst')}</h3>
        <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">{t('gate.signInHint')}</p>
        <AuthButtons onClick={hide} />
      </div>
    </Modal>
  );
};

/** Faqat roʻyxatdan oʻtganlar uchun boʻlim — mehmonga sahifa oʻrnida koʻrsatiladi */
export const GuestGate = ({ title }: { title?: string }) => {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl text-primary"><LockOutlined /></span>
      <h1 className="m-0 mt-5 text-2xl font-semibold">{title ?? t('gate.cabinetTitle')}</h1>
      <p className="mb-8 mt-3 leading-relaxed text-muted">{t('gate.cabinetHint')}</p>
      <AuthButtons />
      <p className="mb-0 mt-6 text-sm text-muted">
        <Trans
          i18nKey="gate.browse"
          components={{ s: <Link to="/app/sources" />, m: <Link to="/app/museum" />, e: <Link to="/app/explore" /> }}
        />
      </p>
    </div>
  );
};

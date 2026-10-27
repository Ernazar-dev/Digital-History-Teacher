import { LockOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth.store';
import { useLoginPrompt } from '@/features/auth/loginPrompt.store';

/** Kirish/ro'yxatdan so'ng shu sahifaga qaytish uchun ?next= */
const useNext = () => {
  const { pathname, search } = useLocation();
  return `?next=${encodeURIComponent(pathname + search)}`;
};

const AuthButtons = ({ onClick }: { onClick?: () => void }) => {
  const next = useNext();
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
      <Link to={`/register${next}`} onClick={onClick}><Button type="primary" size="large" block>Ro‘yxatdan o‘tish</Button></Link>
      <Link to={`/login${next}`} onClick={onClick}><Button size="large" block>Kirish</Button></Link>
    </div>
  );
};

/** Mehmon saqlash/yuborish kabi amal qilganda chiqadigan oyna (http interseptori ochadi) */
export const LoginPromptModal = () => {
  const { open, hide } = useLoginPrompt();
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();
  useEffect(() => hide(), [pathname, user, hide]);
  return (
    <Modal open={open && !user} onCancel={hide} footer={null} width={420} centered>
      <div className="px-2 pb-2 pt-4 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-xl text-primary"><LockOutlined /></span>
        <h3 className="m-0 mt-4 text-lg font-semibold">Avval tizimga kiring</h3>
        <p className="mb-6 mt-2 text-sm leading-relaxed text-muted">
          Ko‘rish hamma uchun ochiq. Saqlash, javob yuborish va ish yaratish uchun hisob kerak — ro‘yxatdan o‘tish bir daqiqa oladi.
        </p>
        <AuthButtons onClick={hide} />
      </div>
    </Modal>
  );
};

/** Faqat ro'yxatdan o'tganlar uchun bo'lim — mehmonga sahifa o'rnida ko'rsatiladi */
export const GuestGate = ({ title = 'Bu bo‘lim shaxsiy kabinetda' }: { title?: string }) => (
  <div className="mx-auto max-w-md py-16 text-center">
    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-2xl text-primary"><LockOutlined /></span>
    <h1 className="m-0 mt-5 text-2xl font-semibold">{title}</h1>
    <p className="mb-8 mt-3 leading-relaxed text-muted">
      Bu yerda shaxsiy ishlaringiz — tahlillar, dars ishlanmalari, topshiriqlar va natijalar saqlanadi. Davom etish uchun tizimga kiring.
    </p>
    <AuthButtons />
    <p className="mb-0 mt-6 text-sm text-muted">
      Yoki hozircha <Link to="/app/sources">manbalar kutubxonasi</Link>, <Link to="/app/museum">virtual muzey</Link> va{' '}
      <Link to="/app/explore">vaqt chizig‘i</Link>ni ko‘rib chiqing.
    </p>
  </div>
);

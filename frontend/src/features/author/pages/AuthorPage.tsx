import { CheckCircleFilled, MailOutlined, PhoneOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { errorMessage } from '@/lib/http';
import { messagesService } from '@/services/messages.service';

const EMAIL = 'otegenovberdibay@gmail.com';
const PHONE = '+998913013211';
const PHONE_VIEW = '+998 91 301 32 11';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+\d][\d\s()-]{5,24}$/;

const inputCls =
  'w-full rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-[15px] text-white placeholder-white/55 outline-none transition focus:border-white/70 focus:bg-white/15 focus:ring-2 focus:ring-white/25';

const ContactRow = ({ icon, label, value, href }: { icon: ReactNode; label: string; value: string; href: string }) => (
  <a href={href} className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-3.5 text-white no-underline backdrop-blur transition hover:border-white/40 hover:bg-white/15">
    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-lg text-white">{icon}</span>
    <span className="min-w-0">
      <span className="block text-xs uppercase tracking-wider text-white/60">{label}</span>
      <span className="block break-all text-sm font-semibold">{value}</span>
    </span>
  </a>
);

/** «Muallif va bog‘lanish» — muallif tanishuvi, aloqa ma’lumotlari va admin panelga tushadigan xabar formasi */
export default function AuthorPage() {
  const { t } = useTranslation();
  const [v, setV] = useState({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((p) => ({ ...p, [k]: e.target.value }));

  const send = useMutation({
    mutationFn: messagesService.send,
    onSuccess: () => {
      setSent(true);
      setV({ name: '', email: '', phone: '', message: '' });
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const email = v.email.trim();
    const phone = v.phone.trim();
    const err: Record<string, string> = {};
    if (v.name.trim().length < 2) err.name = t('author.errName');
    if (!email && !phone) err.contact = t('author.errContact');
    if (email && !EMAIL_RE.test(email)) err.email = t('author.errEmail');
    if (phone && !PHONE_RE.test(phone)) err.phone = t('author.errPhone');
    if (v.message.trim().length < 5) err.message = t('author.errMessage');
    setErrors(err);
    if (Object.keys(err).length) return;
    send.mutate({ name: v.name.trim(), email, phone, message: v.message.trim() });
  };

  const fieldErr = (k: string) => errors[k] && <p role="alert" className="m-0 mt-1.5 text-sm text-amber-200">{errors[k]}</p>;

  return (
    <section className="overflow-hidden rounded-3xl lg:h-[calc(100dvh-104px)] lg:min-h-[620px] bg-gradient-to-br from-[#0b2150] via-[#12408c] to-[#1d6fd1] text-white shadow-xl">
      <div className="grid lg:h-full lg:grid-cols-[1.05fr_1fr]">
        {/* Muallif: surat to‘liq (kesilmaydi), 4:5 nisbatda bo‘sh joyga sig‘adi — sahifa ekran balandligidan oshmaydi */}
        <div className="order-1 flex flex-col items-center gap-4 bg-black/10 p-6 md:p-8 lg:order-2 lg:min-h-0">
          <div className="aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border-2 border-accent-light/70 shadow-2xl lg:min-h-0 lg:w-auto lg:max-w-full lg:flex-1">
            <img src="/author.jpg" alt={t('author.photoAlt')} width={800} height={1000} className="size-full object-cover" />
          </div>
          <div className="text-center">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">{t('author.eyebrow')}</p>
            <h1 className="font-serif-title m-0 mt-1 text-xl font-bold text-white md:text-2xl">{t('author.name')}</h1>
            <p className="m-0 mt-1 text-sm leading-snug text-white/80">{t('author.position')}</p>
          </div>
          <div className="grid w-full gap-2.5 sm:grid-cols-2">
            <ContactRow icon={<MailOutlined />} label={t('author.email')} value={EMAIL} href={`mailto:${EMAIL}`} />
            <ContactRow icon={<PhoneOutlined />} label={t('author.phone')} value={PHONE_VIEW} href={`tel:${PHONE}`} />
          </div>
        </div>

        {/* Forma */}
        <div className="order-2 px-6 py-10 md:px-10 lg:order-1 lg:flex lg:flex-col lg:justify-center lg:overflow-y-auto lg:py-6">
          <h2 className="font-serif-title m-0 text-3xl font-bold text-white md:text-4xl">{t('author.formTitle')}</h2>
          <p className="mb-5 mt-2 max-w-md text-[15px] leading-relaxed text-white/75">{t('author.formLead')}</p>

          {sent ? (
            <div role="status" className="rounded-2xl border border-white/20 bg-white/10 p-7 text-center">
              <CheckCircleFilled className="text-5xl text-emerald-300" />
              <h3 className="m-0 mt-4 text-xl font-semibold text-white">{t('author.sentTitle')}</h3>
              <p className="mx-auto mb-5 mt-2 max-w-sm text-white/75">{t('author.sentText')}</p>
              <button type="button" onClick={() => setSent(false)} className="cursor-pointer rounded-xl border border-white/40 bg-transparent px-5 py-2.5 font-semibold text-white transition hover:bg-white/10">
                {t('author.again')}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-3.5">
              <div>
                <input className={inputCls} value={v.name} onChange={set('name')} placeholder={t('author.fName')} aria-label={t('author.fName')} autoComplete="name" maxLength={120} />
                {fieldErr('name')}
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <input className={inputCls} type="email" value={v.email} onChange={set('email')} placeholder={t('author.fEmail')} aria-label={t('author.fEmail')} autoComplete="email" maxLength={160} />
                  {fieldErr('email')}
                </div>
                <div>
                  <input className={inputCls} type="tel" value={v.phone} onChange={set('phone')} placeholder={t('author.fPhone')} aria-label={t('author.fPhone')} autoComplete="tel" maxLength={25} />
                  {fieldErr('phone')}
                </div>
              </div>
              {errors.contact ? fieldErr('contact') : <p className="m-0 text-[13px] text-white/60">{t('author.contactHint')}</p>}
              <div>
                <textarea className={`${inputCls} min-h-28 resize-y`} value={v.message} onChange={set('message')} placeholder={t('author.fMessage')} aria-label={t('author.fMessage')} maxLength={3000} />
                {fieldErr('message')}
              </div>
              {send.isError && <p role="alert" className="m-0 rounded-xl bg-red-500/20 px-4 py-2.5 text-sm text-red-100">{errorMessage(send.error)}</p>}
              <button
                type="submit"
                disabled={send.isPending}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-white px-5 py-3.5 text-[15px] font-bold text-[#12408c] shadow-lg transition hover:bg-white/90 disabled:cursor-wait disabled:opacity-70"
              >
                <SendOutlined /> {send.isPending ? t('author.sending') : t('author.send')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

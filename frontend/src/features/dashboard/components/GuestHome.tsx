import { ArrowRightOutlined, BankOutlined, BookOutlined, GlobalOutlined, LockOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Reveal } from '@/components/motion/motion';
import { MODULES } from '@/features/public/content';
import { OBJECT_TYPE } from '@/lib/labels';
import { museumService } from '@/services/museum.service';

/** `title` va `text` — i18n kalitlari */
const OPEN = [
  { to: '/app/sources', icon: <BookOutlined />, title: 'nav.sources', text: 'guest.sourcesText' },
  { to: '/app/museum', icon: <BankOutlined />, title: 'nav.museum', text: 'guest.museumText' },
  { to: '/app/explore', icon: <GlobalOutlined />, title: 'nav.explore', text: 'guest.exploreText' },
];

const OPEN_PATHS = new Set(OPEN.map((o) => o.to));

/** Tizimga kirmagan foydalanuvçi uçun /app boş sahifasi: oçiq bölimlar + kiriş taklifi */
export const GuestHome = () => {
  const { t } = useTranslation();
  const objects = useQuery({ queryKey: ['guest-objects'], queryFn: () => museumService.list({ pageSize: 4 }) });
  const locked = MODULES.filter((m) => !OPEN_PATHS.has(m.to));

  return (
    <div className="space-y-14">
      <header className="max-w-2xl">
        <span className="text-sm font-medium text-accent">{t('guest.badge')}</span>
        <h1 className="font-serif-title m-0 mt-2 text-3xl font-bold leading-tight md:text-[42px]">{t('guest.title')}</h1>
        <p className="mb-0 mt-3 text-lg leading-relaxed text-muted">{t('guest.text')}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/register?next=%2Fapp"><Button type="primary" size="large">{t('account.register')}</Button></Link>
          <Link to="/app/sources"><Button size="large">{t('guest.viewSources')} <ArrowRightOutlined /></Button></Link>
        </div>
      </header>

      <section>
        <h2 className="m-0 mb-4 text-lg font-semibold">{t('guest.openSections')}</h2>
        <div className="stagger grid gap-4 md:grid-cols-3">
          {OPEN.map((o, i) => (
            <Reveal key={o.to} delay={i * 80}>
              <Link to={o.to} className="group block h-full rounded-2xl border border-line bg-white p-6 no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-lg text-primary">{o.icon}</span>
                <h3 className="m-0 mt-4 text-base font-semibold text-ink">{t(o.title)}</h3>
                <p className="mb-0 mt-1.5 text-sm leading-relaxed text-muted">{t(o.text)}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  {t('guest.open')} <ArrowRightOutlined className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {(objects.data?.data.length ?? 0) > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="m-0 text-lg font-semibold">{t('guest.fromMuseum')}</h2>
            <Link to="/app/museum" className="text-sm">{t('guest.all')}</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {objects.data!.data.map((o) => (
              <Link key={o.id} to={`/app/museum/${o.slug}`} className="group block no-underline">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-line/60">
                  {o.thumbnailUrl && <img src={o.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-premium group-hover:scale-105" />}
                </div>
                <div className="mt-2 text-xs text-muted">{OBJECT_TYPE[o.type]}</div>
                <div className="line-clamp-2 text-sm font-medium text-ink">{o.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-white p-6 md:p-8">
        <h2 className="m-0 text-lg font-semibold">{t('guest.accountTitle')}</h2>
        <p className="mb-5 mt-1 text-sm text-muted">{t('guest.accountText')}</p>
        <ul className="m-0 grid list-none gap-x-8 gap-y-3 p-0 sm:grid-cols-2">
          {locked.map((m) => (
            <li key={m.n} className="flex items-start gap-3">
              <LockOutlined className="mt-1 text-xs text-muted" />
              <span className="text-sm"><span className="font-medium">{m.title}.</span> <span className="text-muted">{m.text}</span></span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

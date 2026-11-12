import { ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth.store';
import { usePlatform } from '@/hooks/usePlatform';
import { Logo } from './Logo';

/** `title` va `label` — i18n kalitlari */
const COLUMNS = [
  {
    title: 'nav.sources',
    links: [
      { to: '/app/sources', label: 'nav.sources' },
      { to: '/app/methodology', label: 'nav.methodology' },
    ],
  },
  {
    title: 'footer.museumAndLessons',
    links: [
      { to: '/app/museum', label: 'nav.museum' },
      { to: '/app/explore', label: 'nav.explore' },
      { to: '/app/lessons', label: 'footer.lessonBuilder' },
      { to: '/app/assignments', label: 'nav.assignments' },
    ],
  },
];

const linkCls = 'text-white/60 no-underline transition-colors duration-200 hover:text-accent-light';

/**
 * Sayt footeri — landing, «Platforma haqida» va talaba/mehmon sahifalari uçun bitta umumiy.
 * Töq fon sahifadan aniq ajralib turadi (oldingi oq footer krem fonga qöşilib ketardi).
 */
export const SiteFooter = () => {
  const { t } = useTranslation();
  const { name, fullName, institution } = usePlatform();
  const user = useAuthStore((s) => s.user);
  const account = user
    ? [{ to: '/app', label: 'account.personalCabinet' }, { to: '/app/profile', label: 'account.profileShort' }]
    : [{ to: '/login', label: 'account.login' }, { to: '/register', label: 'account.register' }];

  return (
    <footer className="relative bg-midnight text-white">
      {/* Yuqori oltin çiziq — footer boşlanganini aniq körsatadi */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo dark />
            <p className="mb-0 mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              {fullName || t('footer.description')}
            </p>
            <Link to="/about" className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent no-underline hover:text-accent-light">
              {t('footer.about')} <ArrowRightOutlined className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          {[...COLUMNS, { title: 'footer.account', links: account }].map((col) => (
            <nav key={col.title} aria-label={t(col.title)}>
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{t(col.title)}</div>
              <ul className="m-0 list-none space-y-3 p-0 text-sm">
                {col.links.map((l) => (
                  <li key={l.to}><Link to={l.to} className={linkCls}>{t(l.label)}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-0 border-t border-solid border-white/10 pt-6 text-xs text-white/45 md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} {name}</span>
          <span>{institution || t('footer.institution')}</span>
        </div>
      </div>
    </footer>
  );
};

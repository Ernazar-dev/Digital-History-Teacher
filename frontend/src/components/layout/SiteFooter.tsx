import { ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/auth.store';
import { usePlatform } from '@/hooks/usePlatform';
import { Logo } from './Logo';

const COLUMNS = [
  {
    title: 'Manbalar',
    links: [
      { to: '/app/sources', label: 'Manbalar kutubxonasi' },
      { to: '/app/analysis', label: 'Tahlil laboratoriyasi' },
    ],
  },
  {
    title: 'Muzey va darslar',
    links: [
      { to: '/app/museum', label: 'Virtual muzey' },
      { to: '/app/explore', label: 'Xarita va vaqt chizig‘i' },
      { to: '/app/lessons', label: 'Dars konstruktori' },
      { to: '/app/assignments', label: 'Topshiriqlar' },
    ],
  },
];

const linkCls = 'text-white/60 no-underline transition-colors duration-200 hover:text-accent-light';

/**
 * Sayt footeri — landing, «Platforma haqida» va talaba/mehmon sahifalari uchun bitta umumiy.
 * To'q fon sahifadan aniq ajralib turadi (oldingi oq footer krem fonga qo'shilib ketardi).
 */
export const SiteFooter = () => {
  const { name, fullName, institution } = usePlatform();
  const user = useAuthStore((s) => s.user);
  const account = user
    ? [{ to: '/app', label: 'Shaxsiy kabinet' }, { to: '/app/profile', label: 'Profil' }]
    : [{ to: '/login', label: 'Kirish' }, { to: '/register', label: 'Ro‘yxatdan o‘tish' }];

  return (
    <footer className="no-print relative bg-midnight text-white">
      {/* Yuqori oltin chiziq — footer boshlanganini aniq ko'rsatadi */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" aria-hidden />
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo dark />
            <p className="mb-0 mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              {fullName || 'Bo‘lajak tarix o‘qituvchilarining metodik kompetensiyasini rivojlantirish raqamli ta’lim platformasi'}
            </p>
            <Link to="/about" className="group mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent no-underline hover:text-accent-light">
              Platforma haqida <ArrowRightOutlined className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          {[...COLUMNS, { title: 'Hisob', links: account }].map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">{col.title}</div>
              <ul className="m-0 list-none space-y-3 p-0 text-sm">
                {col.links.map((l) => (
                  <li key={l.to}><Link to={l.to} className={linkCls}>{l.label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-0 border-t border-solid border-white/10 pt-6 text-xs text-white/45 md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} {name}</span>
          <span>{institution || 'PhD tadqiqoti doirasida ishlab chiqilgan ta’lim platformasi'}</span>
        </div>
      </div>
    </footer>
  );
};

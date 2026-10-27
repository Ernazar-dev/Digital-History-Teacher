import { DownOutlined, HomeOutlined, LockOutlined, LogoutOutlined, MenuOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Drawer, Dropdown, Grid, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { usePlatform } from '@/hooks/usePlatform';
import { ROLE } from '@/lib/labels';
import { Logo } from './Logo';
import { isNavGroup, TOP_NAV, TOP_NAV_ITEMS, type TopNavGroup, type TopNavItem } from './navigation';

const HOME = '/';

const initials = (name?: string) =>
  (name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('') || '?';

/** «Bosh sahifa» kabinet emas, landing'ga olib boradi */
const withHome = (i: TopNavItem): TopNavItem => (i.to === '/app' ? { ...i, to: HOME } : i);

/** Eng uzun mos keluvchi yo'l faol hisoblanadi; bosh sahifa — faqat aynan o'zida */
const activePath = (path: string) =>
  TOP_NAV_ITEMS.map((i) => withHome(i).to)
    .filter((k) => path === k || (k !== HOME && path.startsWith(`${k}/`)))
    .sort((a, b) => b.length - a.length)[0] ?? '';

/**
 * Yagona yuqori navbar — landing, ochiq sahifalar va talaba kabineti uchun bir xil.
 * Bir xil yo'nalishdagi bo'limlar pastga ochiladigan guruhlarga jamlangan.
 */
export const TopNavbar = () => {
  const { user, logout } = useAuth();
  const { name } = usePlatform();
  const { pathname } = useLocation();
  const screens = Grid.useBreakpoint();
  const [drawer, setDrawer] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const wide = Boolean(screens.xl);
  const active = activePath(pathname);
  // Kirish/ro'yxatdan so'ng shu sahifaga qaytish — faqat platforma sahifalaridan
  const next = pathname.startsWith('/app') ? `?next=${encodeURIComponent(pathname)}` : '';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    setDrawer(false);
    setOpenGroup(null);
  }, [pathname]);

  const locked = (i: TopNavItem) => !user && !i.open;
  const lockIcon = <LockOutlined className="text-[11px] opacity-40" aria-label="kirish talab etiladi" />;
  const pill = (on: boolean) =>
    `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors duration-200 ${
      on ? 'bg-primary-soft text-primary' : 'text-muted hover:bg-black/[0.04] hover:text-ink'
    }`;

  const single = (raw: TopNavItem) => {
    const i = withHome(raw);
    return (
      <Link key={i.to} to={i.to} aria-current={active === i.to ? 'page' : undefined} className={pill(active === i.to)}>
        {i.label}
        {locked(i) && lockIcon}
      </Link>
    );
  };

  /** Guruh paneli: ikonka, nom va qisqa izoh bilan bandlar */
  const panel = (g: TopNavGroup) => (
    <div className="w-[340px] rounded-2xl border border-solid border-line bg-white p-2 shadow-lift">
      {g.items.map((i) => (
        <Link
          key={i.to}
          to={i.to}
          aria-current={active === i.to ? 'page' : undefined}
          className={`group flex items-start gap-3 rounded-xl p-3 no-underline transition-colors ${active === i.to ? 'bg-primary-soft' : 'hover:bg-canvas'}`}
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg transition-colors ${
              active === i.to ? 'bg-primary text-white' : 'bg-primary-soft text-primary group-hover:bg-primary group-hover:text-white'
            }`}
          >
            {i.icon}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              {i.label}
              {locked(i) && lockIcon}
            </span>
            {i.desc && <span className="mt-0.5 block text-xs leading-snug text-muted">{i.desc}</span>}
          </span>
        </Link>
      ))}
    </div>
  );

  const group = (g: TopNavGroup) => {
    const on = g.items.some((i) => i.to === active);
    const open = openGroup === g.label;
    return (
      <Dropdown
        key={g.label}
        trigger={['hover', 'click']}
        placement="bottomLeft"
        mouseEnterDelay={0.05}
        open={open}
        onOpenChange={(v) => setOpenGroup(v ? g.label : null)}
        popupRender={() => panel(g)}
      >
        <button type="button" aria-haspopup="menu" aria-expanded={open} className={`${pill(on || open)} cursor-pointer border-0 ${on || open ? '' : 'bg-transparent'}`}>
          {g.label}
          <DownOutlined className={`text-[10px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </Dropdown>
    );
  };

  const account = user ? (
    <Dropdown
      trigger={['click']}
      menu={{
        items: [
          { key: 'who', label: <div className="py-1"><div className="font-medium">{user.fullName}</div><div className="text-xs text-muted">{ROLE[user.role]}</div></div>, disabled: true },
          { type: 'divider' },
          { key: 'cabinet', icon: <HomeOutlined />, label: <Link to="/app">Kabinet</Link> },
          { key: 'profile', icon: <UserOutlined />, label: <Link to="/app/profile">Profil va portfolio</Link> },
          { type: 'divider' },
          { key: 'logout', icon: <LogoutOutlined />, label: 'Chiqish', onClick: () => void logout() },
        ],
      }}
    >
      <button type="button" className="flex cursor-pointer items-center rounded-full border-0 bg-transparent p-0.5" aria-label="Foydalanuvchi menyusi">
        <Avatar size={34} className="!bg-primary !text-sm !font-semibold">{initials(user.fullName)}</Avatar>
      </button>
    </Dropdown>
  ) : (
    <div className="flex items-center gap-2">
      <Link to={`/login${next}`}><Button type="text">Kirish</Button></Link>
      <Link to={`/register${next}`}><Button type="primary">Ro‘yxatdan o‘tish</Button></Link>
    </div>
  );

  const drawerLink = (raw: TopNavItem) => {
    const i = withHome(raw);
    return (
      <Link
        key={i.to}
        to={i.to}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 no-underline transition-colors ${
          active === i.to ? 'bg-primary-soft font-medium text-primary' : 'text-ink hover:bg-canvas'
        }`}
      >
        <span className="text-base opacity-70">{i.icon}</span>
        <span className="flex-1">{i.label}</span>
        {locked(i) && lockIcon}
      </Link>
    );
  };

  return (
    <>
      <header
        className={`no-print sticky top-0 z-30 border-b bg-white/90 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? 'border-line shadow-[0_6px_24px_-18px_rgba(11,21,48,0.35)]' : 'border-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
          <Logo to={HOME} />
          {wide && (
            <nav className="ml-2 flex items-center gap-0.5" aria-label="Asosiy bo‘limlar">
              {TOP_NAV.map((e) => (isNavGroup(e) ? group(e) : single(e)))}
            </nav>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <Tooltip title="Qidiruv">
              <Link to="/app/search" aria-label="Qidiruv">
                <Button type="text" shape="circle" icon={<SearchOutlined />} />
              </Link>
            </Tooltip>
            {(wide || user) && account}
            {!wide && <Button type="text" shape="circle" icon={<MenuOutlined />} onClick={() => setDrawer(true)} aria-label="Menyuni ochish" />}
          </div>
        </div>
      </header>

      <Drawer open={drawer} onClose={() => setDrawer(false)} placement="right" width={300} title={<span className="font-serif-title">{name}</span>}>
        <nav className="flex flex-col gap-1" aria-label="Bo‘limlar">
          {TOP_NAV.map((e) =>
            isNavGroup(e) ? (
              <div key={e.label} className="mt-3">
                <div className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{e.label}</div>
                {e.items.map(drawerLink)}
              </div>
            ) : (
              drawerLink(e)
            ),
          )}
        </nav>
        {!user && <div className="mt-6 border-0 border-t border-solid border-line pt-6">{account}</div>}
      </Drawer>
    </>
  );
};

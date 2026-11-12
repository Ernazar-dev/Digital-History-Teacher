import { ExportOutlined, LogoutOutlined, MenuOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Breadcrumb, Button, Drawer, Dropdown, Grid, Input, Layout, Menu, Tooltip, type MenuProps } from 'antd';
import { Suspense, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { PageLoader } from '@/components/feedback/PageLoader';
import { useAuth } from '@/features/auth/useAuth';
import i18n from '@/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { breadcrumbItems } from './breadcrumbs';
import { navFor, type NavItem } from './navigation';

const SIDER_WIDTH = 272;

const toItem = (i: NavItem): NonNullable<MenuProps['items']>[number] =>
  ({ key: i.key, icon: i.icon, label: i.children ? i.label : <Link to={i.key}>{i.label}</Link>, children: i.children?.map(toItem) });

/** Bir xil `sectionʼdagi ketma-ket bandlar sarlavhali guruhga jamlanadi */
const toMenu = (items: NavItem[]): MenuProps['items'] => {
  const out: NonNullable<MenuProps['items']> = [];
  items.forEach((i) => {
    const last = out[out.length - 1] as { type?: string; key?: unknown; children?: unknown[] } | undefined;
    if (!i.section) out.push(toItem(i));
    else if (last?.type === 'group' && last.key === `g-${i.section}`) last.children!.push(toItem(i));
    else out.push({ type: 'group', key: `g-${i.section}`, label: i.section, children: [toItem(i)] });
  });
  return out;
};

/** Eng uzun mos keluvchi menyu kalitini tanlaydi */
const activeKey = (path: string, items: NavItem[]): string => {
  const keys = items.flatMap((i) => (i.children ? i.children.map((c) => c.key) : [i.key]));
  // «Bosh sahifa» (/app) faqat aynan oʻzida faol — aks holda menyuda yoʻq har qanday sahifada notoʻg'ri belgilanadi
  return keys.filter((k) => path === k || (k !== '/app' && path.startsWith(`${k}/`))).sort((a, b) => b.length - a.length)[0] ?? '';
};

const initials = (name?: string) =>
  (name ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('') || '?';

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const [drawer, setDrawer] = useState(false);
  const items = useMemo(() => (user ? navFor(user.role) : []), [user]);
  const selected = activeKey(location.pathname, items);
  const isMobile = !screens.lg;

  const breadcrumb = breadcrumbItems(location.pathname);

  const sider = (
    <div className="app-sider grain relative flex h-full flex-col overflow-hidden bg-midnight">
      <div className="pattern-girih pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_45%)]" aria-hidden />
      <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/50 blur-3xl" aria-hidden />
      <div className="relative px-6 pb-4 pt-6"><Logo dark to="/app" /></div>
      <div className="relative mx-6 mb-3 h-px bg-gradient-to-r from-accent/40 via-white/10 to-transparent" />
      <div className="relative flex-1 overflow-y-auto pb-4">
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selected]}
          items={toMenu(items)}
          onClick={() => setDrawer(false)}
          className="!border-0 !bg-transparent"
        />
      </div>
      {/* Foydalanuvchi va «Chiqish» — yuqoridagi profil menyusida; sidebar pastida takrorlanmaydi */}
    </div>
  );

  return (
    <Layout className="min-h-screen">
      {!isMobile && (
        <Layout.Sider width={SIDER_WIDTH} className="!fixed inset-y-0 left-0 z-30 shadow-[8px_0_40px_-20px_rgba(11,21,48,0.6)]">
          {sider}
        </Layout.Sider>
      )}
      <Drawer open={drawer} onClose={() => setDrawer(false)} placement="left" width={290} styles={{ body: { padding: 0 } }} closable={false}>
        {sider}
      </Drawer>
      <Layout style={{ marginLeft: isMobile ? 0 : SIDER_WIDTH }}>
        <Layout.Header className="glass sticky top-0 z-20 flex items-center gap-3 border-b border-line/80 !px-4 md:!px-8">
          {isMobile && <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawer(true)} aria-label={i18n.t('nav.openMenu')} />}
          <Input.Search
            placeholder={i18n.t('staffNav.searchPh')}
            allowClear
            enterButton={<SearchOutlined />}
            className="max-w-md"
            onSearch={(q) => q.trim().length >= 2 && navigate(`/app/search?q=${encodeURIComponent(q.trim())}`)}
          />
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            {/* Ochiq saytni yangi tabda koʻrish — qoʻshilgan/oʻzgartirilgan narsalarni tekshirish uchun */}
            <Tooltip title={isMobile ? i18n.t('staffNav.viewSite') : undefined}>
              <a
                href="/"
                target="_blank"
                rel="noopener"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-solid border-line bg-white px-4 text-sm font-medium text-ink no-underline transition-colors hover:border-primary hover:text-primary"
                aria-label={i18n.t('staffNav.viewSiteAria')}
              >
                <ExportOutlined />
                {!isMobile && i18n.t('staffNav.viewSite')}
              </a>
            </Tooltip>
            <Dropdown
              menu={{
                items: [
                  { key: 'profile', icon: <UserOutlined />, label: <Link to="/app/profile">{i18n.t('staffNav.profileSettings')}</Link> },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogoutOutlined />, label: i18n.t('account.logout'), onClick: () => void logout() },
                ],
              }}
            >
              <Button type="text" className="flex !h-10 items-center gap-2 !rounded-full !pl-1 !pr-3" aria-label={i18n.t('account.userMenu')}>
                <Avatar size={32} className="!text-accent-light" style={{ background: "linear-gradient(135deg, #284b8a, #0b1530)" }}>{initials(user?.fullName)}</Avatar>
                {!isMobile && <span className="max-w-[160px] truncate font-medium">{user?.fullName}</span>}
              </Button>
            </Dropdown>
          </div>
        </Layout.Header>
        <Layout.Content className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
          {breadcrumb.length >= 3 && <Breadcrumb items={breadcrumb} className="mb-5" />}
          <ErrorBoundary resetKey={location.pathname}>
            <Suspense fallback={<PageLoader />}>
              <div key={location.pathname} className="page-enter">
                <Outlet />
              </div>
            </Suspense>
          </ErrorBoundary>
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

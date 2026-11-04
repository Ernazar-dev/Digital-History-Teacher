import { Layout } from 'antd';
import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { PageLoader } from '@/components/feedback/PageLoader';
import { useAuthStore } from '@/features/auth/auth.store';
import { useSiteViewStore } from '@/features/auth/siteView.store';
import { SiteFooter } from './SiteFooter';
import { TopNavbar } from './TopNavbar';

/** Landing, "Platforma haqida" va kirish sahifalari — platforma bilan bir xil navbar (TopNavbar) */
export const PublicLayout = () => {
  const location = useLocation();
  const staff = useAuthStore((s) => s.user?.role === 'ADMIN' || s.user?.role === 'TEACHER');
  const setSiteView = useSiteViewStore((s) => s.setSiteView);
  const isLanding = location.pathname === '/';
  // Kirish/ro'yxat/parol tiklash — forma ekran markazida, 100vh ichida
  const isAuth = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Xodim ochiq saytga o'tdi — shu tabda navbar havolalari ham talaba ko'rinishida ochiladi.
  // Kirish sahifalari hisobga olinmaydi: tizimga kirgan xodim boshqaruv paneliga tushishi kerak.
  useEffect(() => {
    if (staff && !isAuth) setSiteView(true);
  }, [staff, isAuth, setSiteView]);

  return (
    <Layout className="min-h-screen bg-canvas">
      <TopNavbar />
      <Layout.Content
        className={
          isLanding
            ? ''
            : isAuth
              ? 'flex min-h-[calc(100dvh-64px)] w-full items-center justify-center px-4 py-6'
              : 'mx-auto w-full max-w-7xl px-4 py-5 md:px-8 md:py-6'
        }
      >
        <ErrorBoundary resetKey={location.pathname}>
          <Suspense fallback={<PageLoader />}>
            <div key={location.pathname} className={isLanding ? '' : isAuth ? 'page-enter w-full' : 'page-enter'}>
              <Outlet />
            </div>
          </Suspense>
        </ErrorBoundary>
      </Layout.Content>
      <SiteFooter />
    </Layout>
  );
};

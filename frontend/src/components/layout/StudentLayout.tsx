import { Breadcrumb } from 'antd';
import { Suspense, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { PageLoader } from '@/components/feedback/PageLoader';
import { SEGMENT_LABELS } from './navigation';
import { SiteFooter } from './SiteFooter';
import { TopNavbar } from './TopNavbar';

/** Talaba va mehmon uchun platforma layouti — landing bilan bir xil yuqori navbar (sidebar faqat o'qituvchi/administrator uchun) */
export const StudentLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const crumbs = location.pathname.split('/').filter(Boolean);
  const showCrumbs = crumbs.length >= 3;

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <TopNavbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-8 md:py-10">
        {showCrumbs && (
          <Breadcrumb
            className="no-print mb-5"
            items={crumbs.map((seg, i) => {
              const path = `/${crumbs.slice(0, i + 1).join('/')}`;
              const label = SEGMENT_LABELS[seg] ?? 'Batafsil';
              return { title: i < crumbs.length - 1 ? <Link to={path}>{label}</Link> : label };
            })}
          />
        )}
        <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<PageLoader />}>
            <div key={location.pathname} className="page-enter">
              <Outlet />
            </div>
          </Suspense>
        </ErrorBoundary>
      </main>

      <SiteFooter />
    </div>
  );
};

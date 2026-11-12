import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthBootstrap } from '@/features/auth/AuthBootstrap';
import { appRoutes } from './appRoutes';
import { GuestOnly } from './guards';
import { P } from './pages';

/** Eski ochiq katalog havolalari (/catalog/...) endi platformaning oʻzida ochiladi */
const CatalogRedirect = () => {
  const { pathname, search } = useLocation();
  return <Navigate to={pathname.replace(/^\/catalog/, '/app') + search} replace />;
};

export const router = createBrowserRouter([
  {
    element: <AuthBootstrap />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <P.Landing /> },
          { path: '/about', element: <P.About /> },
          { path: '/author', element: <P.Author /> },
          { path: '/catalog/*', element: <CatalogRedirect /> },
          { path: '/login', element: <GuestOnly><P.Login /></GuestOnly> },
          { path: '/register', element: <GuestOnly><P.Register /></GuestOnly> },
          { path: '/forgot-password', element: <P.Forgot /> },
          { path: '*', element: <P.NotFound /> },
        ],
      },
      { path: '/app', element: <AppShell />, children: appRoutes },
    ],
  },
], { future: { v7_relativeSplatPath: true } });

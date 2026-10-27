import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, useLocation, type RouteObject } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthBootstrap } from '@/features/auth/AuthBootstrap';
import type { Role } from '@/types/api';
import { GuestOnly, RequireAuth, RequireRole } from './guards';
import { P } from './pages';

const STAFF: Role[] = ['ADMIN', 'TEACHER'];
const ADMIN: Role[] = ['ADMIN'];
const role = (roles: Role[], el: ReactNode) => <RequireRole roles={roles}>{el}</RequireRole>;
/** Shaxsiy bo'lim — mehmonga sahifa o'rnida kirish taklifi ko'rinadi */
const auth = (el: ReactNode) => <RequireAuth>{el}</RequireAuth>;

/**
 * /app — mehmonlar uchun ham ochiq: bosh sahifa, qidiruv, manbalar, muzey, xarita va vaqt chizig'i.
 * Qolgan bo'limlar navbarda ko'rinadi, lekin kirishni talab qiladi.
 */
const appRoutes: RouteObject[] = [
  { index: true, element: <P.Dashboard /> },
  { path: 'profile', element: auth(<P.Profile />) },
  { path: 'search', element: <P.Search /> },
  { path: 'guide', element: role(STAFF, <P.Guide />) },
  { path: 'sources', element: <P.Sources /> },
  { path: 'sources/:id', element: <P.SourceDetail /> },
  { path: 'analysis', element: auth(<P.Analysis />) },
  { path: 'analysis/comparisons/:id', element: auth(<P.ComparisonEditor />) },
  { path: 'analysis/:id', element: auth(<P.AnalysisEditor />) },
  { path: 'museum', element: <P.Museum /> },
  { path: 'museum/responses/:id', element: role(STAFF, <P.ResponseReview />) },
  { path: 'museum/:id', element: <P.Object /> },
  { path: 'explore', element: <P.Explore /> },
  { path: 'lessons', element: auth(<P.Lessons />) },
  { path: 'lessons/new', element: auth(<P.LessonConstructor />) },
  { path: 'lessons/:id/edit', element: auth(<P.LessonConstructor />) },
  { path: 'lessons/:id', element: auth(<P.LessonView />) },
  { path: 'assignments', element: auth(<P.Assignments />) },
  { path: 'assignments/new', element: role(STAFF, <P.AssignmentForm />) },
  { path: 'assignments/:id/edit', element: role(STAFF, <P.AssignmentForm />) },
  { path: 'assignments/:id', element: auth(<P.AssignmentDetail />) },
  { path: 'submissions/:id', element: role(STAFF, <P.SubmissionReview />) },
  { path: 'review', element: role(STAFF, <P.ReviewQueue />) },
  { path: 'rubrics', element: role(STAFF, <P.Rubrics />) },
  { path: 'diagnostics', element: auth(<P.Diagnostics />) },
  { path: 'diagnostics/new', element: role(STAFF, <P.DiagnosticForm />) },
  { path: 'diagnostics/:id/edit', element: role(STAFF, <P.DiagnosticForm />) },
  { path: 'diagnostics/:id/take', element: role(['STUDENT'], <P.DiagnosticTake />) },
  { path: 'diagnostics/attempts/:attemptId', element: auth(<P.Attempt />) },
  { path: 'competence', element: role(['STUDENT'], <P.Competence />) },
  { path: 'competence/students/:studentId', element: role(STAFF, <P.Competence />) },
  { path: 'experiment', element: role(STAFF, <P.Experiment />) },
  // «Mening o'quv yo'lim» talaba kabineti ichida (tab)
  { path: 'progress', element: <Navigate to="/app?tab=yol" replace /> },
  { path: 'progress/students/:studentId', element: role(STAFF, <P.Progress />) },
  // Talabaning elektron portfoliosi profil sahifasiga birlashtirilgan
  { path: 'portfolio', element: <Navigate to="/app/profile" replace /> },
  { path: 'portfolio/students/:studentId', element: role(STAFF, <P.Portfolio />) },
  { path: 'portfolio/items/:id', element: auth(<P.PortfolioItem />) },
  { path: 'groups', element: role(STAFF, <P.Groups />) },
  { path: 'groups/:id', element: role(STAFF, <P.GroupDetail />) },
  { path: 'admin/users', element: role(ADMIN, <P.Users />) },
  { path: 'admin/roles', element: role(ADMIN, <P.Roles />) },
  { path: 'admin/sources', element: role(STAFF, <P.AdminSources />) },
  { path: 'admin/sources/new', element: role(STAFF, <P.SourceForm />) },
  { path: 'admin/sources/:id/edit', element: role(STAFF, <P.SourceForm />) },
  { path: 'admin/objects', element: role(ADMIN, <P.AdminObjects />) },
  { path: 'admin/objects/new', element: role(ADMIN, <P.ObjectForm />) },
  { path: 'admin/objects/:id/edit', element: role(ADMIN, <P.ObjectForm />) },
  { path: 'admin/taxonomy', element: role(ADMIN, <P.Taxonomy />) },
  { path: 'admin/assessment', element: role(ADMIN, <P.AssessmentConfig />) },
  { path: 'admin/settings', element: role(ADMIN, <P.Settings />) },
  { path: 'admin/audit', element: role(ADMIN, <P.Audit />) },
  { path: '*', element: <P.NotFound /> },
];

/** Eski ochiq katalog havolalari (/catalog/...) endi platformaning o'zida ochiladi */
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

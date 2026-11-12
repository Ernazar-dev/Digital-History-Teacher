import { lazy } from 'react';

/** Barcha sahifalar kerak bölganda yuklanadi (code splitting) */
export const P = {
  Landing: lazy(() => import('@/features/public/pages/LandingPage')),
  About: lazy(() => import('@/features/public/pages/AboutPage')),
  Author: lazy(() => import('@/features/author/pages/AuthorPage')),
  Messages: lazy(() => import('@/features/administration/pages/MessagesPage')),
  NotFound: lazy(() => import('@/features/public/pages/NotFoundPage')),
  Login: lazy(() => import('@/features/auth/pages/LoginPage')),
  Register: lazy(() => import('@/features/auth/pages/RegisterPage')),
  Forgot: lazy(() => import('@/features/auth/pages/ForgotPasswordPage')),
  Profile: lazy(() => import('@/features/auth/pages/ProfilePage')),
  Dashboard: lazy(() => import('@/features/dashboard/pages/DashboardPage')),
  Guide: lazy(() => import('@/features/guide/pages/GuidePage')),
  Sources: lazy(() => import('@/features/source-library/pages/SourcesPage')),
  SourceDetail: lazy(() => import('@/features/source-library/pages/SourceDetailPage')),
  SourceForm: lazy(() => import('@/features/source-library/pages/SourceFormPage')),
  Tests: lazy(() => import('@/features/tests/pages/TestsPage')),
  TestPage: lazy(() => import('@/features/tests/pages/TestPage')),
  TestForm: lazy(() => import('@/features/tests/pages/TestFormPage')),
  Methodology: lazy(() => import('@/features/methodology/pages/MethodologyPage')),
  Method: lazy(() => import('@/features/methodology/pages/MethodPage')),
  Museum: lazy(() => import('@/features/virtual-museum/pages/MuseumPage')),
  Object: lazy(() => import('@/features/virtual-museum/pages/ObjectPage')),
  ResponseReview: lazy(() => import('@/features/virtual-museum/pages/ResponseReviewPage')),
  ObjectForm: lazy(() => import('@/features/virtual-museum/pages/ObjectFormPage')),
  Explore: lazy(() => import('@/features/explore/pages/ExplorePage')),
  Search: lazy(() => import('@/features/explore/pages/SearchPage')),
  Lessons: lazy(() => import('@/features/lesson-constructor/pages/LessonsPage')),
  LessonConstructor: lazy(() => import('@/features/lesson-constructor/pages/LessonConstructorPage')),
  LessonView: lazy(() => import('@/features/lesson-constructor/pages/LessonViewPage')),
  Portfolio: lazy(() => import('@/features/portfolio/pages/PortfolioPage')),
  Progress: lazy(() => import('@/features/progress/pages/ProgressPage')),
  PortfolioItem: lazy(() => import('@/features/portfolio/pages/PortfolioItemPage')),
  Users: lazy(() => import('@/features/administration/pages/UsersPage')),
  Groups: lazy(() => import('@/features/administration/pages/GroupsPage')),
  GroupDetail: lazy(() => import('@/features/administration/pages/GroupDetailPage')),
  Taxonomy: lazy(() => import('@/features/administration/pages/TaxonomyPage')),
  Settings: lazy(() => import('@/features/administration/pages/SettingsPage')),
};

/**
 * Eng köp oçiladigan sahifalar kodi — sayt oçilib bölgaç, brauzer böş turganda oldindan yuklanadi.
 * Şunda menyudan bosilganda «Yuklanmoqda...» kutilmaydi (import() bir xil modulni qayta yuklamaydi).
 */
const COMMON_PAGES = [
  () => import('@/features/dashboard/pages/DashboardPage'),
  () => import('@/features/source-library/pages/SourcesPage'),
  () => import('@/features/source-library/pages/SourceDetailPage'),
  () => import('@/features/virtual-museum/pages/MuseumPage'),
  () => import('@/features/virtual-museum/pages/ObjectPage'),
  () => import('@/features/tests/pages/TestsPage'),
  () => import('@/features/tests/pages/TestPage'),
  () => import('@/features/lesson-constructor/pages/LessonsPage'),
  () => import('@/features/methodology/pages/MethodologyPage'),
  () => import('@/features/auth/pages/LoginPage'),
];

export const prefetchCommonPages = () => {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  // Trafikni tejaş rejimida yoki juda sekin (2G) tarmoqda oldindan yuklanmaydi
  if (conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? '')) return;
  const run = () => {
    // Birma-bir yuklanadi — asosiy sahifa sörovlari bilan raqobat qilmasligi uçun
    COMMON_PAGES.reduce((p, load) => p.then(() => load().then(() => undefined, () => undefined)), Promise.resolve());
  };
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (idle) idle(run, { timeout: 4000 });
  else setTimeout(run, 2000);
};

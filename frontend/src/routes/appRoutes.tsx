import type { ReactNode } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import type { Role } from '@/types/api';
import { RequireAuth, RequireRole } from './guards';
import { P } from './pages';

const STAFF: Role[] = ['ADMIN', 'TEACHER'];
const ADMIN: Role[] = ['ADMIN'];
const role = (roles: Role[], el: ReactNode) => <RequireRole roles={roles}>{el}</RequireRole>;
/** Şaxsiy bölim — mehmonga sahifa örnida kiriş taklifi körinadi */
const auth = (el: ReactNode) => <RequireAuth>{el}</RequireAuth>;

/**
 * /app — mehmonlar uçun ham oçiq: boş sahifa, qidiruv, manbalar, muzey, xarita, vaqt çiziği va metodika.
 * Qolgan bölimlar navbarda körinadi, lekin kirişni talab qiladi.
 */
export const appRoutes: RouteObject[] = [
  { index: true, element: <P.Dashboard /> },
  { path: 'profile', element: auth(<P.Profile />) },
  { path: 'search', element: <P.Search /> },
  { path: 'guide', element: role(STAFF, <P.Guide />) },
  { path: 'sources', element: <P.Sources /> },
  { path: 'sources/:id', element: <P.SourceDetail /> },
  { path: 'museum', element: <P.Museum /> },
  { path: 'museum/responses/:id', element: role(STAFF, <P.ResponseReview />) },
  { path: 'museum/:id', element: <P.Object /> },
  { path: 'explore', element: <P.Explore /> },
  { path: 'methodology', element: <P.Methodology /> },
  { path: 'methodology/:slug', element: <P.Method /> },
  { path: 'lessons', element: auth(<P.Lessons />) },
  { path: 'lessons/new', element: auth(<P.LessonConstructor />) },
  { path: 'lessons/:id/edit', element: auth(<P.LessonConstructor />) },
  { path: 'lessons/:id', element: auth(<P.LessonView />) },
  // Topşiriqlar — fayl asosidagi testlar
  { path: 'assignments', element: auth(<P.Tests />) },
  { path: 'assignments/new', element: role(STAFF, <P.TestForm />) },
  { path: 'assignments/:id/edit', element: role(STAFF, <P.TestForm />) },
  { path: 'assignments/:id', element: auth(<P.TestPage />) },
  // «Mening öquv yölim» talaba kabineti içida (tab)
  { path: 'progress', element: <Navigate to="/app?tab=yol" replace /> },
  { path: 'progress/students/:studentId', element: role(STAFF, <P.Progress />) },
  // Talabaning elektron portfoliosi profil sahifasiga birlaştirilgan
  { path: 'portfolio', element: <Navigate to="/app/profile" replace /> },
  { path: 'portfolio/students/:studentId', element: role(STAFF, <P.Portfolio />) },
  { path: 'portfolio/items/:id', element: auth(<P.PortfolioItem />) },
  { path: 'groups', element: role(STAFF, <P.Groups />) },
  { path: 'groups/:id', element: role(STAFF, <P.GroupDetail />) },
  { path: 'admin/users', element: role(ADMIN, <P.Users />) },
  { path: 'admin/sources/new', element: role(STAFF, <P.SourceForm />) },
  { path: 'admin/sources/:id/edit', element: role(STAFF, <P.SourceForm />) },
  { path: 'admin/objects/new', element: role(ADMIN, <P.ObjectForm />) },
  { path: 'admin/objects/:id/edit', element: role(ADMIN, <P.ObjectForm />) },
  { path: 'admin/taxonomy', element: role(ADMIN, <P.Taxonomy />) },
  { path: 'admin/messages', element: role(ADMIN, <P.Messages />) },
  { path: 'admin/settings', element: role(ADMIN, <P.Settings />) },
  { path: '*', element: <P.NotFound /> },
];

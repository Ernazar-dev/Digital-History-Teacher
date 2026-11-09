import { Link, matchRoutes } from 'react-router-dom';
import { appRoutes } from '@/routes/appRoutes';
import { segmentLabel } from './navigation';

const APP_TREE = [{ path: '/app', children: appRoutes }];

/**
 * Boshqaruv bo'limidagi oraliq yo'llarning o'z sahifasi yo'q — ular ochiq sahifaga ko'rsatiladi:
 * /app/admin/sources/<id>/edit → «Manbalar» = /app/sources, «Batafsil» = /app/sources/<id>
 */
const ALIASES: [RegExp, string][] = [
  [/^\/app\/admin\/sources(?=\/|$)/, '/app/sources'],
  [/^\/app\/admin\/objects(?=\/|$)/, '/app/museum'],
];

/** Yo'l haqiqiy sahifaga olib boradimi (404 emas) */
const exists = (path: string) => {
  const matches = matchRoutes(APP_TREE, path);
  return Boolean(matches && matches[matches.length - 1].route.path !== '*');
};

/**
 * URL segmentlaridan breadcrumb. Havola faqat mavjud sahifaga qo'yiladi —
 * sahifasi yo'q oraliq bo'g'in (masalan «Administrator») oddiy matn bo'lib qoladi.
 */
export const breadcrumbItems = (pathname: string) => {
  const crumbs = pathname.split('/').filter(Boolean);
  return crumbs.map((seg, i) => {
    const label = segmentLabel(seg);
    if (i === crumbs.length - 1) return { title: label };
    const path = ALIASES.reduce((p, [re, to]) => p.replace(re, to), `/${crumbs.slice(0, i + 1).join('/')}`);
    return { title: exists(path) ? <Link to={path}>{label}</Link> : label };
  });
};

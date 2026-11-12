import { Link, matchRoutes } from 'react-router-dom';
import { appRoutes } from '@/routes/appRoutes';
import { segmentLabel } from './navigation';

const APP_TREE = [{ path: '/app', children: appRoutes }];

/**
 * Boşqaruv bölimidagi oraliq yöllarning öz sahifasi yöq — ular oçiq sahifaga körsatiladi:
 * /app/admin/sources/<id>/edit → «Manbalar» = /app/sources, «Batafsil» = /app/sources/<id>
 */
const ALIASES: [RegExp, string][] = [
  [/^\/app\/admin\/sources(?=\/|$)/, '/app/sources'],
  [/^\/app\/admin\/objects(?=\/|$)/, '/app/museum'],
];

/** Yöl haqiqiy sahifaga olib boradimi (404 emas) */
const exists = (path: string) => {
  const matches = matchRoutes(APP_TREE, path);
  return Boolean(matches && matches[matches.length - 1].route.path !== '*');
};

/**
 * URL segmentlaridan breadcrumb. Havola faqat mavjud sahifaga qöyiladi —
 * sahifasi yöq oraliq bög'in (masalan «Administrator») oddiy matn bölib qoladi.
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

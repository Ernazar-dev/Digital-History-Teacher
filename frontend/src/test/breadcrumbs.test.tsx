import { isValidElement, type ReactElement } from 'react';
import { matchRoutes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { breadcrumbItems } from '@/components/layout/breadcrumbs';
import { appRoutes } from '@/routes/appRoutes';

const APP_TREE = [{ path: '/app', children: appRoutes }];
const opens = (path: string) => {
  const m = matchRoutes(APP_TREE, path);
  return Boolean(m && m[m.length - 1].route.path !== '*');
};

/** Har bir sahifa yo'li — :param o'rniga namunaviy qiymat */
const samplePaths = appRoutes
  .map((r) => r.path)
  .filter((p): p is string => Boolean(p) && p !== '*')
  .map((p) => `/app/${p.replace(/:\w+/g, '3f1c2b9e-0000-4000-8000-000000000001')}`);

describe('Breadcrumb', () => {
  it('hech bir breadcrumb havolasi 404 sahifaga olib bormaydi', () => {
    expect(samplePaths.length).toBeGreaterThan(20);
    for (const path of samplePaths) {
      for (const { title } of breadcrumbItems(path)) {
        if (!isValidElement(title)) continue;
        const to = (title as ReactElement<{ to: string }>).props.to;
        expect(opens(to), `${path} → ${to}`).toBe(true);
      }
    }
  });

  it('manbani tahrirlash: «Manbalar» ro‘yxatga, «Batafsil» mavzu sahifasiga olib boradi', () => {
    const items = breadcrumbItems('/app/admin/sources/abc/edit');
    const links = items.map(({ title }) => (isValidElement(title) ? (title as ReactElement<{ to: string }>).props.to : null));
    expect(links).toEqual(['/app', null, '/app/sources', '/app/sources/abc', null]);
  });
});

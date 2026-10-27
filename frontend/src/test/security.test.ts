import { describe, expect, it } from 'vitest';
import { safeNext } from '@/lib/safeNext';
import { sanitizeDom } from '@/lib/sanitizeDom';

describe('Ochiq yo‘naltirishga qarshi (safeNext)', () => {
  it('faqat /app ichidagi manzillarga ruxsat', () => {
    expect(safeNext('/app/sources/abc?tab=1')).toBe('/app/sources/abc?tab=1');
    expect(safeNext('/app')).toBe('/app');
    expect(safeNext(null)).toBe('/app');
    for (const bad of ['https://evil.com', '//evil.com', '/\\evil.com', '/app\\evil.com', '/app//evil.com', '/application', 'javascript:alert(1)', '/app/x\u0000', '/app/a:b']) {
      expect(safeNext(bad)).toBe('/app');
    }
  });
});

describe('Hujjatdan yasalgan HTML tozalanadi (XSS)', () => {
  it('skript, hodisa atributlari va javascript: havolalari olib tashlanadi', () => {
    const el = document.createElement('div');
    el.innerHTML = `
      <p onclick="alert(1)">Matn</p>
      <script>alert(1)</script>
      <iframe src="https://evil.com"></iframe>
      <a id="bad" href="javascript:alert(1)">x</a>
      <a id="good" href="https://uz.wikipedia.org">y</a>
      <img id="img" src="data:image/png;base64,AAA" onerror="alert(1)">
      <img id="svg" src="data:image/svg+xml,<svg onload=alert(1)>">`;
    sanitizeDom(el);
    expect(el.querySelector('script')).toBeNull();
    expect(el.querySelector('iframe')).toBeNull();
    expect(el.querySelector('p')!.hasAttribute('onclick')).toBe(false);
    expect(el.querySelector('#bad')!.hasAttribute('href')).toBe(false);
    expect(el.querySelector('#good')!.getAttribute('rel')).toBe('noopener noreferrer');
    expect(el.querySelector('#img')!.hasAttribute('onerror')).toBe(false);
    expect(el.querySelector('#img')!.getAttribute('src')).toContain('data:image/png');
    expect(el.querySelector('#svg')!.hasAttribute('src')).toBe(false);
  });
});

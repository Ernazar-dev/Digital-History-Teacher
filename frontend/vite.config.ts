/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/**
 * Production build uchun Content-Security-Policy (XSS ta'sirini cheklaydi).
 * Dev serverda qo'yilmaydi — Vite HMR inline skriptlardan foydalanadi.
 * Iframe — faqat https (embed hostlari serverda alohida tekshiriladi).
 */
const cspPlugin = (apiOrigin: string): Plugin => {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob: https:",
    `connect-src 'self' blob:${apiOrigin ? ` ${apiOrigin}` : ''}`,
    "frame-src 'self' blob: https:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  return {
    name: 'dht-csp',
    apply: 'build',
    transformIndexHtml: (html) => html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${csp}" />`),
  };
};

const originOf = (url?: string) => {
  try {
    return url && /^https?:\/\//.test(url) ? new URL(url).origin : '';
  } catch {
    return '';
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), cspPlugin(originOf(env.VITE_API_BASE_URL))],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    server: {
      port: 5173,
      // API so'rovlari bir xil origin orqali — refresh cookie (SameSite=Strict) ishlaydi
      proxy: { '/api': { target: env.VITE_API_PROXY_TARGET || 'http://localhost:4000', changeOrigin: false } },
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          // Faqat React yadrosi alohida (uzoq keshlanadi). Grafiklar, xarita, pptx/docx ko'ruvchilar
          // o'zlari kerak bo'lgan sahifa bilan avtomatik yuklanadi — dastlabki ochilishga qo'shilmaydi.
          // (Oldingi obyekt ko'rinishidagi manualChunks umumiy kichik paketlarni «charts» bo'lagiga
          // tortib, 386 KB grafik kutubxonasini har bir sahifada yuklatayotgan edi.)
          manualChunks: (id) => {
            if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react';
            return undefined;
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['src/test/setup.ts'],
      css: false,
      // antd/icons oldindan bundle qilinadi — jsdom'da modul yig'ish tezlashadi
      deps: { optimizer: { web: { enabled: true, include: ['antd'] } } },
    },
  };
});

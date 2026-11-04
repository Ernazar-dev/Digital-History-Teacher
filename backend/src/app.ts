import fs from 'node:fs';
import path from 'node:path';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { openApiDocument } from './docs/openapi';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';
import { apiLimiter, writeLimiter } from './shared/security/limiters';
import { logger } from './shared/logger';

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');
  // Reverse proxy (nginx / Render) ortida to'g'ri IP aniqlash uchun — proxy'lar soni env'dan
  app.set('trust proxy', env.TRUST_PROXY_HOPS);

  // API javoblari uchun qat'iy CSP. Frontend sahifalari (backend ularni bersa) o'zining <meta> CSP'si bilan
  // ishlaydi (Google Fonts, https iframe, blob: worker kerak) — shuning uchun ularga helmet CSP qo'yilmaydi.
  const apiHelmet = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Swagger UI uchun inline stil/skriptlar
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
  });
  const pageHelmet = helmet({ contentSecurityPolicy: false });
  app.use((req, res, next) => (req.path.startsWith('/api') ? apiHelmet : pageHelmet)(req, res, next));
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
    }),
  );
  // JSON javoblarni gzip bilan siqish (ma'ruza matnlari 4–6 barobar kichrayadi).
  // Video/zip kabi siqilmaydigan fayllar va Range so'rovlari o'zgarishsiz uzatiladi.
  app.use(compression({ filter: (req, res) => !req.headers.range && compression.filter(req, res) }));
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());
  if (!env.isTest) {
    app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/api/v1/health' } }));
  }
  // Kirgan foydalanuvchi — hisob bo'yicha, mehmon — IP bo'yicha (bitta IP ortidagi guruh bloklanmaydi)
  app.use('/api', apiLimiter, writeLimiter);

  // API hujjati — faqat API_DOCS_ENABLED=true bo'lganda (productionda standart holatda yopiq)
  if (env.apiDocsEnabled) {
    app.get('/api/docs.json', (_req, res) => res.json(openApiDocument));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, { customSiteTitle: 'Digital History Teacher API' }));
  }
  app.use('/api/v1', apiRouter);

  // Yig'ilgan frontend (Vite dist) — bitta servis, bitta origin: alohida proxy hop'i va CORS kerak emas
  const distDir = env.FRONTEND_DIST_DIR ? path.resolve(env.FRONTEND_DIST_DIR) : null;
  if (distDir && fs.existsSync(path.join(distDir, 'index.html'))) {
    const WEEK = 7 * 24 * 3600;
    app.use(
      express.static(distDir, {
        index: false,
        setHeaders: (res, filePath) => {
          // Vite fayl nomiga hash qo'shadi — /assets abadiy keshlanadi; qolgan statiklar 7 kun
          if (/[\\/]assets[\\/]/.test(filePath)) res.setHeader('Cache-Control', `public, max-age=${365 * 24 * 3600}, immutable`);
          else res.setHeader('Cache-Control', `public, max-age=${WEEK}`);
        },
      }),
    );
    // SPA: /api dan tashqari barcha GET yo'llar index.html ga (har deployda yangi — keshlanmaydi)
    app.get(/^\/(?!api(\/|$)).*/, (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

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

  app.use(
    helmet({
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
    }),
  );
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
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

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};

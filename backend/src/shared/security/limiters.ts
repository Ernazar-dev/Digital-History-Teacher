import type { Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

const message = (text: string) => ({ error: { code: 'TOO_MANY_REQUESTS', message: text } });
const base = { standardHeaders: 'draft-7' as const, legacyHeaders: false };
/** Testlarda limitlar amalda o'chiq (minglab so'rov yuboriladi) */
const cap = (n: number) => (env.isTest ? 100_000 : n);

const ipKey = (req: Request) => `ip:${ipKeyGenerator(req.ip ?? '')}`;

/**
 * Limit kaliti: tizimga kirgan foydalanuvchi — hisob bo'yicha (token imzosi tekshiriladi),
 * mehmon — IP bo'yicha. Shunda bitta maktab/universitet IP manzili ortidagi butun guruh
 * bir-birining limitini "yeb qo'ymaydi", hujumchi esa soxta token bilan limitni chetlab o'ta olmaydi.
 */
export const clientKey = (req: Request) => {
  if (req.user) return `u:${req.user.id}`;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const { sub } = jwt.verify(header.slice(7).trim(), env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }) as { sub: string };
      if (sub) return `u:${sub}`;
    } catch {
      // yaroqsiz token — IP bo'yicha hisoblanadi
    }
  }
  return ipKey(req);
};

/** Umumiy API limiti — DoS va skreyping (ma'lumotni ommaviy yig'ish) ga qarshi */
export const apiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: cap(300),
  keyGenerator: clientKey,
  message: message('Juda ko‘p so‘rov. Birozdan so‘ng urinib ko‘ring.'),
});

/** Ma'lumot o'zgartiruvchi so'rovlar (POST/PUT/PATCH/DELETE) — spam va avtomatlashtirilgan hujumlarga qarshi */
export const writeLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: cap(120),
  keyGenerator: clientKey,
  skip: (req) => req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS',
  message: message('Juda ko‘p o‘zgartirish so‘rovi. Bir daqiqadan so‘ng urinib ko‘ring.'),
});

/** Sessiyani yangilash (har sahifa ochilganda chaqiriladi) — faqat ommaviy suiiste'molga qarshi */
export const refreshLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: cap(1000),
  keyGenerator: ipKey,
  message: message('Juda ko‘p so‘rov. Birozdan so‘ng qayta kiring.'),
});

/** Fayl yuklash — diskni to'ldirishga urinishlarga qarshi (authenticate dan keyin qo'yiladi) */
export const uploadLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: cap(100),
  keyGenerator: clientKey,
  message: message('Bir soat ichida juda ko‘p fayl yuklandi. Keyinroq urinib ko‘ring.'),
});

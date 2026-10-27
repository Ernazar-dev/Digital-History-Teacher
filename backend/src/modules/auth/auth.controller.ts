import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { audit } from '../../shared/utils/audit';
import { created, currentUser, noContent, ok } from '../../shared/utils/http';
import { authService } from './auth.service';

export const REFRESH_COOKIE = 'dht_refresh';

const cookieOptions = (expires?: Date): CookieOptions => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'strict',
  path: '/api/v1/auth',
  expires,
});

/** CSRF himoyasi: cookie bilan ishlaydigan endpointlar maxsus header talab qiladi */
const assertCsrfHeader = (req: Request) => {
  if (req.get('X-Requested-With') !== 'dht') throw AppError.forbidden('CSRF tekshiruvi o‘tmadi');
};

export const authController = {
  async register(req: Request, res: Response) {
    const { user, session } = await authService.register(req.body, req.get('user-agent'));
    if (session) res.cookie(REFRESH_COOKIE, session.refresh.token, cookieOptions(session.refresh.expiresAt));
    created(res, {
      user,
      accessToken: session?.accessToken ?? null,
      message: session
        ? 'Ro‘yxatdan o‘tish muvaffaqiyatli. Xush kelibsiz!'
        : 'Ariza qabul qilindi. Administrator tasdiqlagandan so‘ng tizimga kira olasiz.',
    });
  },

  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    const result = await authService.login(username, password, req.get('user-agent'));
    res.cookie(REFRESH_COOKIE, result.refresh.token, cookieOptions(result.refresh.expiresAt));
    ok(res, { user: result.user, accessToken: result.accessToken });
  },

  async refresh(req: Request, res: Response) {
    assertCsrfHeader(req);
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    // Cookie yo'q — bu xato emas, shunchaki faol sessiya yo'q (mehmon)
    if (!token) {
      noContent(res);
      return;
    }
    try {
      const result = await authService.refresh(token, req.get('user-agent'));
      res.cookie(REFRESH_COOKIE, result.refresh.token, cookieOptions(result.refresh.expiresAt));
      ok(res, { user: result.user, accessToken: result.accessToken });
    } catch (err) {
      res.clearCookie(REFRESH_COOKIE, cookieOptions());
      throw err;
    }
  },

  async logout(req: Request, res: Response) {
    assertCsrfHeader(req);
    await authService.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, cookieOptions());
    noContent(res);
  },

  async me(req: Request, res: Response) {
    ok(res, await authService.me(currentUser(req).id));
  },

  async updateProfile(req: Request, res: Response) {
    ok(res, await authService.updateProfile(currentUser(req).id, req.body));
  },

  async changePassword(req: Request, res: Response) {
    const user = currentUser(req);
    await authService.changePassword(user.id, req.body.currentPassword, req.body.newPassword);
    await audit(req, 'auth.password_changed', 'User', user.id);
    res.clearCookie(REFRESH_COOKIE, cookieOptions());
    noContent(res);
  },

  async forgotPassword(req: Request, res: Response) {
    const token = await authService.forgotPassword(req.body.username);
    // Email mavjudligini oshkor qilmaslik uchun javob har doim bir xil
    ok(res, {
      message: 'Agar bu login ro‘yxatdan o‘tgan bo‘lsa, tiklash bo‘yicha ko‘rsatma yuboriladi.',
      ...(env.exposeResetToken && token ? { devResetToken: token } : {}),
    });
  },

  async resetPassword(req: Request, res: Response) {
    await authService.resetPassword(req.body.token, req.body.password);
    ok(res, { message: 'Parol yangilandi. Tizimga qayta kiring.' });
  },
};

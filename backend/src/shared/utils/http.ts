import type { Request, Response } from 'express';
import { AppError } from '../errors/AppError';
import { translateDeep } from '../i18n/translateResponse';

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** GET javoblarida (o'zbekcha bo'lmagan tilda) bazadagi tanish matnlar tarjimasi bilan almashtiriladi */
export const ok = <T>(res: Response, data: T, meta?: PageMeta) => {
  const dict = res.req?.i18nDict;
  const body = dict ? translateDeep(data, dict) : data;
  return res.status(200).json(meta ? { data: body, meta } : { data: body });
};

export const created = <T>(res: Response, data: T) => res.status(201).json({ data });

export const noContent = (res: Response) => res.status(204).send();

/** Autentifikatsiyadan o'tgan foydalanuvchini qaytaradi (aks holda 401) */
export const currentUser = (req: Request): Express.AuthUser => {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
};

export const buildMeta = (page: number, pageSize: number, total: number): PageMeta => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
});

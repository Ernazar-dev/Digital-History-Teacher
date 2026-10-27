import type { Request, Response } from 'express';
import { AppError } from '../errors/AppError';

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const ok = <T>(res: Response, data: T, meta?: PageMeta) =>
  res.status(200).json(meta ? { data, meta } : { data });

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

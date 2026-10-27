import { Router } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ok } from '../../shared/utils/http';
import { settingsService } from './settings.service';

/** Ochiq sozlamalar: platforma nomi, logotip, tavsif */
export const settingsRouter = Router();
settingsRouter.get('/public', asyncHandler(async (_req, res) => ok(res, await settingsService.getPublic())));

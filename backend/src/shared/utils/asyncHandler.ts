import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Async controllerlardagi xatolarni markaziy error handlerga uzatadi */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

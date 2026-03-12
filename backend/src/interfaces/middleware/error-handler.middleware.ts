import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
};

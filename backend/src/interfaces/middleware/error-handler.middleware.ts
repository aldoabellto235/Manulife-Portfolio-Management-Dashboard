import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../../shared/api-response';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('[Unhandled Error]', err);
  res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', 500));
};

import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../../shared/api-response';
import { logger } from '../../shared/logger';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error('Unhandled error', {
    method: req.method,
    url: req.originalUrl,
    requestId: req.requestId,
    error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
  });
  res.status(500).json(errorResponse('INTERNAL_SERVER_ERROR', 500));
};

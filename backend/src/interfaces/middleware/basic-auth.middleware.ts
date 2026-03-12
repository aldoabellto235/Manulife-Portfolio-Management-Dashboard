import { Request, Response, NextFunction } from 'express';
import { env } from '../../infrastructure/config/env';
import { errorResponse } from '../../shared/api-response';

export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="portfolio-api"');
    res.status(401).json(errorResponse('MISSING_BASIC_AUTH', 401));
    return;
  }

  const base64 = authHeader.slice(6);
  const decoded = Buffer.from(base64, 'base64').toString('utf-8');
  const colonIndex = decoded.indexOf(':');

  if (colonIndex === -1) {
    res.status(401).json(errorResponse('INVALID_BASIC_AUTH', 401));
    return;
  }

  const username = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);

  if (username !== env.BASIC_AUTH_USER || password !== env.BASIC_AUTH_PASSWORD) {
    res.status(401).json(errorResponse('INVALID_BASIC_AUTH', 401));
    return;
  }

  next();
};

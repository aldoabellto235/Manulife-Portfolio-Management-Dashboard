import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ITokenService } from '../../application/ports/token-service.port';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'MISSING_TOKEN' });
    return;
  }

  const token = authHeader.slice(7);
  const tokenService = container.resolve<ITokenService>('ITokenService');
  const payload = tokenService.verify(token);

  if (!payload) {
    res.status(401).json({ error: 'INVALID_TOKEN' });
    return;
  }

  req.userId = payload.userId;
  next();
};

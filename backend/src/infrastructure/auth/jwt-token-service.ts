import { injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../application/ports/token-service.port';
import { env } from '../config/env';

@injectable()
export class JwtTokenService implements ITokenService {
  sign(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  verify(token: string): TokenPayload | null {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      return { userId: decoded.userId };
    } catch {
      return null;
    }
  }
}

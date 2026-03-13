import rateLimit from 'express-rate-limit';
import { errorResponse } from '../../shared/api-response';

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse('TOO_MANY_REQUESTS', 429));
  },
});

export const globalRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json(errorResponse('TOO_MANY_REQUESTS', 429));
  },
});

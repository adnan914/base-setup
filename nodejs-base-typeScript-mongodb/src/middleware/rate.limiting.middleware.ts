import rateLimit from 'express-rate-limit';
import { MessageUtil } from '@/utils';

const createRateLimiter = (
  windowMs: number,
  max: number,
  message = MessageUtil.TOO_MANY_REQUEST
) =>
  rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
  });


// Global soft limiter
const globalLimiter = createRateLimiter(15 * 60 * 1000, 1000);

// Route-specific strict limiters
const authLimiter = createRateLimiter(15 * 60 * 1000, 1000);

export { globalLimiter, authLimiter };
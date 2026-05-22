import rateLimit, { Options } from 'express-rate-limit';
import { MessageUtil } from '@/utils';
import { NextFunction, Request, Response } from 'express';
// import RedisStore from 'rate-limit-redis';
// import { createClient } from 'redis';

// In a typical Express rate limiter, the request count is stored in memory. So we can use redis.
// Redis is used with rate limiting when you have multiple servers or need persistence.
// In-memory data is lost when the server restarts.
// Redis stores rate-limiting data separately, surviving restarts and deployments.

// const redisClient = createClient({
//   socket: {
//     host: process.env.HOST,
//     port: 6379
//   }
// });
// redisClient.connect();

// Set up rate limiter: maximum of 100 requests per 15 minutes per IP

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
    handler: (_req: Request, res: Response, next: NextFunction, options: Options) => {
      return {
        success: false,
        message: MessageUtil.TOO_MANY_REQUEST,
        code: 'RATE_LIMIT_EXCEEDED',
      };
    }
    // store: new RedisStore({
    //   sendCommand: (...args) => redisClient.sendCommand(args),
    // }),
  });


// Global soft limiter
const globalLimiter = createRateLimiter(15 * 60 * 1000, 1000);




// Route-specific strict limiters
const authLimiter = createRateLimiter(15 * 60 * 1000, 2);
// export { redisClient, limiter };
export { globalLimiter, authLimiter };
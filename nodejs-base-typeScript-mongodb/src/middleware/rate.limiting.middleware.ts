import rateLimit from 'express-rate-limit';
import { ResMessageUtil } from '../utils';
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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: ResMessageUtil.TOO_MANY_REQUEST,
  standardHeaders: true,
  // store: new RedisStore({
  //   sendCommand: (...args) => redisClient.sendCommand(args),
  // }),
});

// export { redisClient, limiter };
export { limiter };
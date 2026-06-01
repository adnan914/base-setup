import { Request, Response, NextFunction } from 'express';
import { RES_MESSAGES } from '../messages';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

type RequestWithId = Request & { requestId?: string };

const rateLimitStore = new Map<string, RateLimitEntry>();

export function createRateLimitMiddleware(
  serviceName: string,
  config: RateLimitConfig,
  authConfig?: RateLimitConfig,
) {
  return (req: RequestWithId, res: Response, next: NextFunction) => {
    if (req.method.toUpperCase() == 'OPTIONS') {
      next();
      return;
    }

    const effectiveConfig = getEffectiveConfig(
      serviceName,
      req.path,
      config,
      authConfig,
    );

    if (!effectiveConfig) {
      next();
      return;
    }

    const now = Date.now();
    const key = getRateLimitKey(serviceName, req, effectiveConfig.windowMs);
    const existingEntry = rateLimitStore.get(key);

    if (!existingEntry || existingEntry.resetAt <= now) {
      rateLimitStore.set(key, {
        count: 1,
        resetAt: now + effectiveConfig.windowMs,
      });
      setRateLimitHeaders(res, effectiveConfig, 1, now + effectiveConfig.windowMs);
      next();
      return;
    }

    existingEntry.count += 1;
    setRateLimitHeaders(
      res,
      effectiveConfig,
      existingEntry.count,
      existingEntry.resetAt,
    );

    if (existingEntry.count > effectiveConfig.maxRequests) {
      res.status(429).json({
        success: false,
        message: RES_MESSAGES.TOO_MANY_REQUESTS,
        error: 'Too Many Requests',
        requestId: req.requestId,
        statusCode: 429,
      });
      return;
    }

    next();
  };
}

function getEffectiveConfig(
  serviceName: string,
  path: string,
  defaultConfig: RateLimitConfig,
  authConfig?: RateLimitConfig,
) {
  if (
    serviceName === 'auth-service' &&
    authConfig &&
    path.includes('/auth/login')
  ) {
    return authConfig;
  }

  return defaultConfig.maxRequests > 0 ? defaultConfig : null;
}

function getRateLimitKey(
  serviceName: string,
  req: Request,
  windowMs: number,
) {
  const forwardedForHeader = req.headers['x-forwarded-for'];
  const forwardedFor = Array.isArray(forwardedForHeader)
    ? forwardedForHeader[0]
    : forwardedForHeader;
  const clientIp =
    forwardedFor?.split(',')[0]?.trim() || req.ip || 'unknown';
  const windowBucket = Math.floor(Date.now() / windowMs);

  return `${serviceName}:${clientIp}:${req.path}:${windowBucket}`;
}

function setRateLimitHeaders(
  res: Response,
  config: RateLimitConfig,
  currentCount: number,
  resetAt: number,
) {
  const remaining = Math.max(config.maxRequests - currentCount, 0);
  res.setHeader('X-RateLimit-Limit', String(config.maxRequests));
  res.setHeader('X-RateLimit-Remaining', String(remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
}

import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { createStructuredLogger } from '../logging/structured-logger';

type RequestWithId = Request & { requestId?: string };

export function createRequestContextMiddleware(service: string) {
  const logger = createStructuredLogger(service, `${service}-http`);

  return (req: RequestWithId, res: Response, next: NextFunction) => {
    const requestId =
      getHeaderValue(req.headers['x-request-id']) || randomUUID();
    const startedAt = Date.now();

    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    res.on('finish', () => {
      logger.log({
        event: 'http_request',
        requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
      });
    });

    next();
  };
}

function getHeaderValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

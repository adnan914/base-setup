import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { requestContext } from './request-context';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incoming = req.header(REQUEST_ID_HEADER);
    const requestId = incoming && incoming.length <= 128 ? incoming : randomUUID();
    res.setHeader(REQUEST_ID_HEADER, requestId);
    requestContext.run({ requestId }, next);
  }
}

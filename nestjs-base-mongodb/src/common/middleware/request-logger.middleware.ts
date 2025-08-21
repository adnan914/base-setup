import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void) {
        // No express types -> platform-agnostic friendly
        req.startTime = Date.now();
        next();
    }
}

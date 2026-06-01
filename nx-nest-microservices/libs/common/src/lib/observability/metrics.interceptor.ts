import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    const now = process.hrtime.bigint();
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      tap({
        next: () => this.record(req, res, now),
        error: () => this.record(req, res, now)
      })
    );
  }

  private record(req: Request, res: Response, start: bigint) {
    const duration = Number(process.hrtime.bigint() - start) / 1_000_000_000;
    const route = req.route?.path ?? req.path ?? 'unknown';
    const labels = { method: req.method, route, status: String(res.statusCode) };
    this.metrics.httpRequests.inc(labels);
    this.metrics.httpDuration.observe(labels, duration);
  }
}

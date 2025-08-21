import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const payload = exception instanceof HttpException ? exception.getResponse() : { message: (exception as any)?.message || 'Internal error' };

        this.logger.error(`[${req.method}] ${req.url}`, (exception as any)?.stack);
        res.status(status).json({
            success: false,
            ... (typeof payload === 'object' ? payload : { message: payload }),
            path: req.url,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || undefined,
        });
    }
}

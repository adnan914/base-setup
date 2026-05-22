import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';
import { ResponseInterceptor } from '@/shared/interceptors/response.interceptor';
import { TimeoutInterceptor } from '@/shared/interceptors/timeout.interceptor';

export function configureApp(app: INestApplication) {
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = req.header('x-request-id') || randomUUID();
    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  });

  app.enableCors({
    origin: configService
      .getOrThrow<string>('CORS_ORIGIN')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });
  app.setGlobalPrefix(configService.getOrThrow<string>('API_PREFIX'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ResponseInterceptor(app.get(Reflector)),
    new TimeoutInterceptor(30000),
  );
}

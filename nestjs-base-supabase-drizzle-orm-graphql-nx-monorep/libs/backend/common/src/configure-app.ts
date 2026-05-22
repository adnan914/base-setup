import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';
import { ResponseInterceptor } from '@/shared/interceptors/response.interceptor';
import { TimeoutInterceptor } from '@/shared/interceptors/timeout.interceptor';
import { MESSAGES } from '@/shared/constants';

export function configureApp(app: INestApplication): void {
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

  configureSwagger(app, configService);

  app.getHttpAdapter().get('/', (_req: Request, res: Response) => {
    res.json({
      status: MESSAGES.APP_RUNNING,
    });
  });
}

function configureSwagger(
  app: INestApplication,
  configService: ConfigService,
): void {
  if (!configService.get<boolean>('SWAGGER_ENABLED')) {
    return;
  }

  const config = new DocumentBuilder()
    .setTitle('NestJS Supabase Drizzle API')
    .setDescription(
      'REST API contract for authentication, health checks, and user management.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

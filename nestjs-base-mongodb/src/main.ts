import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { CustomValidationPipe } from '@/shared/pipes/validation.pipe';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';
import { ResponseInterceptor } from '@/shared/interceptors/response.interceptor';
import { TimeoutInterceptor } from '@/shared/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN'),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix(configService.get('API_PREFIX'));

  // Global pipes
  app.useGlobalPipes(
    new CustomValidationPipe(),
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new TimeoutInterceptor(30000), // 30 seconds timeout
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('NestJS Production API')
    .setDescription('Production-ready NestJS application with MongoDB and JWT auth')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
}

bootstrap();

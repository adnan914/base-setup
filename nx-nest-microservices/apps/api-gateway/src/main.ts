import { GlobalHttpExceptionFilter } from '@ecommerce/common';
import { AppLogger } from '@ecommerce/logger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ApiGatewayModule } from './app/api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  app.use(helmet());
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.enableShutdownHooks();

  const swagger = new DocumentBuilder()
    .setTitle('E-Commerce API Gateway')
    .setDescription('REST facade over gRPC microservices')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));

  const config = app.get(ConfigService);
  const port = config.get<number>('gateway.port') ?? 3000;
  await app.listen(port);
  logger.log(`API Gateway listening on port ${port}`);
}

void bootstrap();

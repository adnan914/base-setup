import { GlobalGrpcExceptionFilter, GlobalHttpExceptionFilter, ObservabilityModule, RequestIdMiddleware } from '@ecommerce/common';
import { AppConfigModule } from '@ecommerce/config';
import { GRPC_PACKAGES } from '@ecommerce/contracts';
import { LoggerModule } from '@ecommerce/logger';
import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TerminusModule } from '@nestjs/terminus';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AppConfigModule, LoggerModule, ObservabilityModule, TerminusModule, AuthModule],
  controllers: [HealthController]
})
class AuthServiceAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceAppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: GRPC_PACKAGES.auth,
      protoPath: join(process.cwd(), 'proto/auth.proto'),
      url: process.env.AUTH_GRPC_BIND_URL ?? '0.0.0.0:50051'
    }
  });
  app.useGlobalFilters(new GlobalHttpExceptionFilter(), new GlobalGrpcExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(process.env.AUTH_HTTP_PORT ?? 3001);
}

void bootstrap();

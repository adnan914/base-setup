import { AppConfigModule } from '@ecommerce/config';
import { GlobalGrpcExceptionFilter, GlobalHttpExceptionFilter, ObservabilityModule, RequestIdMiddleware } from '@ecommerce/common';
import { GRPC_PACKAGES } from '@ecommerce/contracts';
import { LoggerModule } from '@ecommerce/logger';
import { MiddlewareConsumer, Module, NestModule, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { TerminusModule } from '@nestjs/terminus';
import { join } from 'path';
import { HealthController } from './health.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [AppConfigModule, LoggerModule, ObservabilityModule, TerminusModule, UserModule],
  controllers: [HealthController]
})
class UserServiceAppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(UserServiceAppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: GRPC_PACKAGES.user,
      protoPath: join(process.cwd(), 'proto/user.proto'),
      url: process.env.USER_GRPC_BIND_URL ?? '0.0.0.0:50052'
    }
  });
  app.useGlobalFilters(new GlobalHttpExceptionFilter(), new GlobalGrpcExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
  app.enableShutdownHooks();
  await app.startAllMicroservices();
  await app.listen(process.env.USER_HTTP_PORT ?? 3002);
}

void bootstrap();

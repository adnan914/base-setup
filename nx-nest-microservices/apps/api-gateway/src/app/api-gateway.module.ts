import { ObservabilityModule, RedisThrottlerGuard, RequestIdMiddleware } from '@ecommerce/common';
import { AppConfigModule } from '@ecommerce/config';
import { GRPC_PACKAGES } from '@ecommerce/contracts';
import { LoggerModule } from '@ecommerce/logger';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { TerminusModule } from '@nestjs/terminus';
import { join } from 'path';
import { AuthController } from '../auth/auth.controller';
import { HealthController } from '../health/health.controller';
import { UsersController } from '../users/users.controller';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    ObservabilityModule,
    TerminusModule,
    JwtModule.register({}),
    ClientsModule.registerAsync([
      {
        name: 'AUTH_PACKAGE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGES.auth,
            protoPath: join(process.cwd(), 'proto/auth.proto'),
            url: config.getOrThrow<string>('grpc.authUrl')
          }
        })
      },
      {
        name: 'USER_PACKAGE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: GRPC_PACKAGES.user,
            protoPath: join(process.cwd(), 'proto/user.proto'),
            url: config.getOrThrow<string>('grpc.userUrl')
          }
        })
      }
    ])
  ],
  controllers: [AuthController, UsersController, HealthController],
  providers: [{ provide: APP_GUARD, useClass: RedisThrottlerGuard }]
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}

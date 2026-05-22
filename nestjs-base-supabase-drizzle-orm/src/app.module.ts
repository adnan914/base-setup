import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthModule } from '@/features/auth/auth.module';
import { UsersModule } from '@/features/users/users.module';
import { SharedModule } from '@/shared/shared.module';
import { AppController } from '@/app.controller';
import { DatabaseModule, DatabaseThrottlerStorage } from '@/database';

import { APP_GUARD } from '@nestjs/core';
import { validateEnvironment } from '@/config/env.validation';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { RolesGuard } from '@/shared/guards/roles.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
      validate: validateEnvironment,
    }),

    // Authentication
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ThrottlerModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [DatabaseThrottlerStorage],
      useFactory: (storage: DatabaseThrottlerStorage) => ({
        storage,
        throttlers: [{ ttl: 60000, limit: 100 }],
      }),
    }),
    DatabaseModule,
    // Feature modules
    AuthModule,
    UsersModule,
    SharedModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

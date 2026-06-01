import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createAppConfigModuleOptions } from '@lib/core/config';
import { DatabaseModule } from '@lib/core/database';
import { AuthModule } from '@lib/auth/feature-auth';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot(createAppConfigModuleOptions('auth')),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

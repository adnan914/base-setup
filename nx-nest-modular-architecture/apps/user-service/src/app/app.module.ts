import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createAppConfigModuleOptions } from '@lib/core/config';
import { DatabaseModule } from '@lib/core/database';
import { UsersModule } from '@lib/users/feature-users';
import { StorageModule } from '@lib/core/common';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot(createAppConfigModuleOptions('user')),
    DatabaseModule,
    UsersModule,
    StorageModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

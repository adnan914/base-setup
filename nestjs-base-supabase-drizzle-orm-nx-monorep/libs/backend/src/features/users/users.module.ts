import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersServiceModule } from './users-service.module';

@Module({
  imports: [UsersServiceModule],
  controllers: [UsersController],
  exports: [UsersServiceModule],
})
export class UsersModule {}

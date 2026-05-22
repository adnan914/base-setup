import { Module } from '@nestjs/common';
import { UsersResolver } from './graphql/users.resolver';
import { UsersController } from './users.controller';
import { UsersModule } from './users.module';

@Module({
  imports: [UsersModule],
  controllers: [UsersController],
  providers: [UsersResolver],
})
export class AdminUsersModule {}

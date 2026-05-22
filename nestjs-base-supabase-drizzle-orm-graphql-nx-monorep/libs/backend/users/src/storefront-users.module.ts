import { Module } from '@nestjs/common';
import { StorefrontUsersResolver } from './graphql/storefront-users.resolver';
import { StorefrontProfileController } from './storefront-profile.controller';
import { UsersModule } from './users.module';

@Module({
  imports: [UsersModule],
  controllers: [StorefrontProfileController],
  providers: [StorefrontUsersResolver],
})
export class StorefrontUsersModule {}

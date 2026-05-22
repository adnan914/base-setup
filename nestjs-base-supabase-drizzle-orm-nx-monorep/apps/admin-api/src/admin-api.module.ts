import { Module } from '@nestjs/common';
import { ApiFoundationModule } from '@/api-foundation.module';
import { AdminAuthModule } from '@/features/auth/admin-auth.module';
import { UsersModule } from '@/features/users/users.module';

@Module({
  imports: [ApiFoundationModule, AdminAuthModule, UsersModule],
})
export class AdminApiModule {}

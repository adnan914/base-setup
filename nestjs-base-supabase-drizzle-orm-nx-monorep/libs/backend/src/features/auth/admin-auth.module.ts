import { Module } from '@nestjs/common';
import { AdminLoginController } from './admin-login.controller';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminLoginController],
})
export class AdminAuthModule {}

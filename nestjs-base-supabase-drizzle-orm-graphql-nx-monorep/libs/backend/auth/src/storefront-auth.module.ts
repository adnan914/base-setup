import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthModule } from './auth.module';
import { RegisterController } from './register.controller';

@Module({
  imports: [AuthModule],
  controllers: [AuthController, RegisterController],
})
export class StorefrontAuthModule {}

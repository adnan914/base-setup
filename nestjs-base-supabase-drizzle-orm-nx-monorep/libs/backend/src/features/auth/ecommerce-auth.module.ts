import { Module } from '@nestjs/common';
import { AuthModule } from './auth.module';
import { EcommerceLoginController } from './ecommerce-login.controller';
import { EcommerceRegistrationController } from './ecommerce-registration.controller';

@Module({
  imports: [AuthModule],
  controllers: [EcommerceLoginController, EcommerceRegistrationController],
})
export class EcommerceAuthModule {}

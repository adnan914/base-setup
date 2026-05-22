import { Module } from '@nestjs/common';
import { ApiFoundationModule } from '@/api-foundation.module';
import { EcommerceAuthModule } from '@/features/auth/ecommerce-auth.module';

@Module({
  imports: [ApiFoundationModule, EcommerceAuthModule],
})
export class EcommerceApiModule {}

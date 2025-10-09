/* eslint-disable prettier/prettier */
import { forwardRef,Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CustomerController } from './customer/customer.controller';
import { CardController } from './card/card.controller';
import { ProductController } from './product/product.controller';
import { PlanController } from './plan/plan.controller';
import { SubscriptionController } from './subscription/subscription.controller';
import { CouponController } from './coupon/coupon.controller';
import { UsersModule } from 'src/module/users/users.module';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Module({
  imports: [forwardRef(() => UsersModule)],
   providers: [StripeService, ConstantConfig],
  controllers: [CustomerController, CardController, ProductController, PlanController, SubscriptionController, CouponController]
})
export class StripeModule {}

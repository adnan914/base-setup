/* eslint-disable prettier/prettier */
// coupon.controller.ts
import { Controller, Post, Body, Get, Param, NotFoundException } from '@nestjs/common';
import { StripeService } from '../stripe.service';
import Stripe from 'stripe';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Controller('coupon')
export class CouponController {
  constructor(private readonly stripeService: StripeService, private constant: ConstantConfig) {}

  @Post()
  async createCoupon(@Body() body: Stripe.CouponCreateParams) {
    try {
      const stripeCoupon = await this.stripeService.createCoupon(body);

      if (stripeCoupon instanceof Error) {
        throw stripeCoupon; 
      }

      if (stripeCoupon && stripeCoupon.id) {
        return { stripeCoupon: stripeCoupon };
      } else {
        throw new Error(this.constant.error.stripe.couponError);
      }
    } catch (error) {
      throw new Error(`Internal Server Error: ${error.message}`);
    }
  }

  @Get('list')
  async listCoupons() {
    try {
      const coupons = await this.stripeService.listCoupons();

      if (coupons instanceof Error) {
        throw coupons;
      }
      return { coupons: coupons.data };
    } catch (error) {
      throw new Error(`Internal Server Error: ${error.message}`);
    }
  }

  @Get(':id')
  async getCoupon(@Param('id') stripeCouponId: string) {
    try {
      const couponDetail = await this.stripeService.getCoupon(stripeCouponId);

      if ((couponDetail as Stripe.Coupon)?.id) {
        return { couponDetail };
      } else {
        throw new NotFoundException(this.constant.error.stripe.CouponNotFoundError);
      }
    } catch (error) {
      throw new Error(`Internal Server Error: ${error.message}`);
    }
  }
}

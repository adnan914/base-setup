/* eslint-disable prettier/prettier */
import { Controller, Post, Get, Param, Body, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from '../stripe.service';
import Stripe from 'stripe';
import { ConstantConfig } from 'src/lib/constant/constant.config';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly stripeService: StripeService, private constant: ConstantConfig) {}

  @Post('create')
  async createSubscription(@Body() subscriptionParams: Stripe.SubscriptionCreateParams) {
    try {
      const subscription = await this.stripeService.createSubscription(subscriptionParams);
      console.log(subscription);
      return subscription;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message || this.constant.error.stripe.createSubscriptionError,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('list')
  async listSubscriptions() {
    try {
      const subscriptions = await this.stripeService.listSubscriptions();
      return subscriptions;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: this.constant.error.stripe.listingSubscriptionError,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':subscriptionId')
  async getSubscription(@Param('subscriptionId') subscriptionId: string) {
    try {
      const subscription = await this.stripeService.getSubscription(subscriptionId);
      return subscription;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: this.constant.error.stripe.subscriptionNotFoundError,
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete(':subId')
  async cancelSubscription(@Param('subId') subId: string) {
    try {
      const canceledSubscription = await this.stripeService.cancelSubscription(subId);
      return canceledSubscription;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: this.constant.error.stripe.cancelSubscriptionError,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { StripeService } from '../stripe.service';
import Stripe from 'stripe';

@Controller('plan')
export class PlanController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create')
async createPlan(@Body() planDetails: Stripe.PlanCreateParams) {
  try {
    const plan = await this.stripeService.createPlan(planDetails);
    return plan;
  } catch (error) {
    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}

  @Get()
  async listPlans() {
    try {
      const plans = await this.stripeService.listPlans();
      return plans;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':planId')
  async getPlan(@Param('planId') planId: string) {
    try {
      const plan = await this.stripeService.getPlan(planId);
      return plan;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }
}


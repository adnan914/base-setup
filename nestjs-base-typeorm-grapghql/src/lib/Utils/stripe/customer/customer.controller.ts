/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Put, NotFoundException } from '@nestjs/common';
import { StripeService } from '../stripe.service';
import Stripe from 'stripe';
@Controller('')
export class CustomerController {
  constructor(
    private readonly stripeService: StripeService
    ) {}

  @Post('createCustomer')
  async createCustomer(@Body() body: { email: string }): Promise<Stripe.Customer | Error> {
    try {
      const { email } = body;
      const customer = await this.stripeService.createCustomer(email);
      if (customer instanceof Error) {
        throw customer;
      }
      return customer;
    } catch (error) {
      throw new NotFoundException(error.message); 
    }
  }

  @Get('getCustomer/:stripe_cust_id')
  async getCustomer(@Param('stripe_cust_id') customerId: string): Promise<Stripe.Customer | NotFoundException> {
    try {
      const customer = await this.stripeService.getCustomer(customerId);
      if (customer instanceof NotFoundException) {
        throw customer;
      }
      return customer;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Put('updateCustomer/:stripe_cust_id')
  async updateCustomer(
    @Param('stripe_cust_id') stripeCustomerId: string,
    @Body() updateBody: { description: string }
  ): Promise<Stripe.Customer | Error> {
    try {
      const customer = await this.stripeService.updateCustomer(stripeCustomerId, updateBody);
      if (customer instanceof Error) {
        throw customer;
      }
      return customer;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}

/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Param, Get, NotFoundException } from '@nestjs/common';
import { StripeService } from '../stripe.service';
import Stripe from 'stripe';

@Controller('card')
export class CardController {
  constructor(private readonly stripeService: StripeService) {}
  @Post('add/:customerId')
  async addCard(
    @Param('customerId') customerId: string,
    @Body() body: { cardToken: string }
  ): Promise<Stripe.Card | string> {
    try {
      const { cardToken } = body;
      const card = await this.stripeService.addCard(customerId, cardToken);
      if (typeof card === 'string') {
        throw new NotFoundException(card);
      }
     return card;
    } catch (error) {
      throw new NotFoundException(error.message || 'Unknown error');
    }
  }

  @Get('get/:customerId/:cardId')
  async getCard(
    @Param('customerId') customerId: string,
    @Param('cardId') cardId: string
  ): Promise<Stripe.Card | NotFoundException> {
    try {
      const card = await this.stripeService.getCard(customerId, cardId);
      if (card instanceof NotFoundException) {
        throw card;
      }
      return card;
    } catch (error) {
      throw new NotFoundException(error.message || 'Unknown error');
    }
  }

  // @Post('createtoken')
  // async createCardToken(): Promise<{ tokenId: string } | { error: string }> {
  //   const cardToken = await this.stripeService.createCardToken();

  //   if (cardToken instanceof Error) {
  //     return { error: cardToken.message || 'Unknown error' };
  //   }

  //   return { tokenId: cardToken.id };
  // }
}


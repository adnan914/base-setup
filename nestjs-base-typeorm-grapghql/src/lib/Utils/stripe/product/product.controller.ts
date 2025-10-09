/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StripeService } from '../stripe.service';

@Controller('product')
export class ProductController {
  constructor(private readonly stripeService: StripeService ) {}

  @Post('create')
    async create(@Body('name') productName: string, @Body('defaultPrice') defaultPrice: number) {
        try {
            // Create a product with the given name and default price
            const price = await this.stripeService.createProduct(productName, defaultPrice);
            return price;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}

/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe'; // Import Stripe as a namespace
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../../module/users/users.service';
import { ConstantConfig } from 'src/lib/constant/constant.config';
@Injectable()
export class StripeService {
  private stripeClient: Stripe;

  constructor(private readonly configService: ConfigService,
    private userService: UsersService,
    private constant: ConstantConfig) {
    this.stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(email: string): Promise<Stripe.Customer | Error> {
    try {
      const user = await this.userService.findUserByEmail(email);

      if (!user) {
        throw new NotFoundException(this.constant.error.stripe.userNotFoundError);
      } else if (user.cust_id) {
        throw new ConflictException(this.constant.error.stripe.customerIdAvailableError);
      }
      const customer = await this.stripeClient.customers.create({
        email: email,
      });
      if (customer instanceof Error) {
        throw new Error(this.constant.error.stripe.customerAvailabelError);
      }
      await this.userService.updateUserCustId(user.id, customer.id);
      return customer;
    } catch (error) {
      throw new NotFoundException(error.message || 'Unknown error');
    }
  }

  async getCustomer(
    customerId: string,
  ): Promise<Stripe.Customer | NotFoundException> {
    try {
      const customer = await this.stripeClient.customers.retrieve(customerId);
      if (customer.deleted) {
        return new NotFoundException(this.constant.error.stripe.userNotFoundError);
      }
      return customer as Stripe.Customer;
    } catch (error) {
      return new NotFoundException(this.constant.error.stripe.userNotFoundError);
    }
  }

  async updateCustomer(
    stripeCustomerId: string,
    updateBody: { description: string },
  ): Promise<Stripe.Customer | Error> {
    try {
      const customer = await this.stripeClient.customers.update(
        stripeCustomerId,
        {
          description: updateBody.description,
        },
      );
      return customer;
    } catch (error) {
      return error;
    }
  }

  async addCard(
    customerId: string,
    cardToken: string,
  ): Promise<Stripe.Card | string> {
    try {
      const userId = await this.userService.getUserIDByCustomerId(customerId);
      if (userId == null) {
        throw new NotFoundException(this.constant.error.stripe.userNotFoundByIdError);
      }
      const cardResponse = await this.stripeClient.customers.createSource(
        customerId,
        {
          source: cardToken,
        },
      );
      if (cardResponse.id) {
        await this.userService.updateUserCustCardId(userId, cardResponse.id);
        return cardResponse as Stripe.Card;
      } else {
        return 'Unknown error';
      }
    } catch (error) {
      if (error.type === 'StripeCardError') {
        return error.raw.message || 'Unknown error';
      }
      return error.message || 'Unknown error';
    }
  }

  async getCard(
    stripeCustomerId: string,
    cardId: string,
  ): Promise<Stripe.Card | NotFoundException> {
    try {
      const card = await this.stripeClient.customers.retrieveSource(
        stripeCustomerId,
        cardId,
      );
      return card as Stripe.Card;
    } catch (error) {
      if (
        error.type === 'StripeInvalidRequestError' &&
        error.code === 'resource_missing'
      ) {
        throw new NotFoundException(this.constant.error.stripe.cardNotFoundError);
      }
      return error;
    }
  }

  async createProduct(
    name: string,
    defaultPrice: number,
  ): Promise<Stripe.Product | Stripe.Price | Error> {
    try {
      const product = await this.stripeClient.products.create({
        name: name,
      });
      const price = await this.stripeClient.prices.create({
        unit_amount: defaultPrice,
        currency: 'usd',
        product: product.id,
      });
      return price;
    } catch (error) {
      return error;
    }
  }

  async createPlan(body: Stripe.PlanCreateParams): Promise<Stripe.Plan | Error> {
    try {
      const plan = await this.stripeClient.plans.create(body);
      return plan;
    } catch (error) {
      return error;
    }
  }

  async listPlans(): Promise<Stripe.ApiList<Stripe.Plan> | Error> {
    try {
      const plans = await this.stripeClient.plans.list({ limit: 10 });
      return plans;
    } catch (error) {
      return error;
    }
  }

  async getPlan(planId: string): Promise<Stripe.Plan | Error> {
    try {
      const plan = await this.stripeClient.plans.retrieve(planId);
      return plan;
    } catch (error) {
      return error;
    }
  }

  async createCoupon(body: Stripe.CouponCreateParams): Promise<Stripe.Coupon | Error> {
    try {
      const coupon = await this.stripeClient.coupons.create(body);
      return coupon;
    } catch (error) {
      return error;
    }
  }

  async listCoupons(): Promise<Stripe.ApiList<Stripe.Coupon> | Error> {
    try {
      const coupons = await this.stripeClient.coupons.list({ limit: 10 });
      return coupons;
    } catch (error) {
      return error;
    }
  }

  async getCoupon(couponId: string): Promise<Stripe.Coupon | NotFoundException | Error> {
    try {
      const coupon = await this.stripeClient.coupons.retrieve(couponId);

      if (!coupon || !coupon.id) {
        throw new NotFoundException(this.constant.error.stripe.CouponNotFoundError);
      }

      return coupon;
    } catch (error) {
      if (error.code === 'resource_missing') {
        throw new NotFoundException(this.constant.error.stripe.CouponNotFoundError);
      }
      return error;
    }
  }

  async createSubscription(subscriptionParams: Stripe.SubscriptionCreateParams) {
    try {
      const createSub = await this.stripeClient.subscriptions.create(subscriptionParams);

      return createSub;
    } catch (error) {
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error(this.constant.error.stripe.createSubscriptionError);
      }
    }
  }


  async listSubscriptions() {
    try {
      const subscriptions = await this.stripeClient.subscriptions.list({ limit: 10 });
      return subscriptions;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      const subscription = await this.stripeClient.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      throw new Error(error);
    }
  }

  async cancelSubscription(subId: string) {
    try {
      const cancelSub = await this.stripeClient.subscriptions.cancel(subId);
      return cancelSub;
    } catch (error) {
      if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error(this.constant.error.stripe.cancelSubscriptionError);
      }
    }
  }

  async createCardToken(): Promise<Stripe.Token | Error> {
    try {
      const cardToken = await this.stripeClient.tokens.create({
        card: {
          number: '4242424242424242',
          exp_month: '11',
          exp_year: '2022',
          cvc: '314',
        },
      } as Stripe.TokenCreateParams);
      return cardToken;
    } catch (error) {
      return error;
    }
  }
}

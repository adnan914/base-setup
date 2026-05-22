import { Resolver, Query } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { Order } from './order.entity';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Query(() => [Order])
  async orders() {
    return this.orderService.findAll();
  }
}

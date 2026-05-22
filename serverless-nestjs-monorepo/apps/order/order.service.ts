import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(OrderService) private repo: Repository<Order>) {}

  async findAll() {
    return this.repo.find();
  }
}

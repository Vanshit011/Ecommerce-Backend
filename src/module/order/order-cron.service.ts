import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Order } from './entity/order.entity';
import { Status } from '../../shared/constants/enum';

@Injectable()
export class OrderCronService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
  ) {}

  // Cancel unpaid orders older than 5 min
  @Cron('*/5 * * * *')
  async expirePendingOrders() {
    const limit = new Date(Date.now() - 5 * 60 * 1000);

    const orders = await this.orderRepo.find({
      where: {
        status: Status.PENDING,
        created_at: LessThan(limit),
      },
    });

    for (const order of orders) {
      order.status = Status.CANCELLED;
      await this.orderRepo.save(order);
    }
  }
}

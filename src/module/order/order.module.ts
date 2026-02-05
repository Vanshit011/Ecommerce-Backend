import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../order/entity/order.entity';
import { OrderItem } from '../order/entity/order-item.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from '../auth/auth.module';
import { CartModule } from '../cart/cart.module';
import { AddressModule } from '../address/address.module';
import { Address } from '../address/entity/address.entity';
import { StripeModule } from '../../core/stripe/stripe.module';
import { OrderCronService } from './order-cron.service';
import { Payment } from '../payments/entity/payments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Address, Payment]),
    CartModule,
    AddressModule,
    AuthModule,
    StripeModule,
  ],
  providers: [OrderService, OrderCronService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}

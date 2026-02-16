import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payments.entity';
import { PaymentsService } from './payments.service';
import { Order } from '../order/entity/order.entity';
import { AuthModule } from '../auth/auth.module';
import { StripeModule } from '../../core/stripe/stripe.module';
import { PaymentsController } from './payments.controller';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    AuthModule,
    StripeModule,
    OrderModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

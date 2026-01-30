import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entity/payments.entity';
import { PaymentsService } from './payments.service';
import { Order } from '../order/entity/order.entity';
import { AuthModule } from '../auth/auth.module';
import { StripeModule } from 'src/core/stripe/stripe.module';
import { PaymentsController } from './payments.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Order]),
    AuthModule,
    StripeModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}

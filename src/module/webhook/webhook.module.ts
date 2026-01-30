import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { StripeModule } from '../../core/stripe/stripe.module';
import { OrderModule } from '../order/order.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [StripeModule, OrderModule, PaymentsModule],
  controllers: [WebhookController],
})
export class WebhookModule {}

import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { StripeModule } from '../../core/stripe/stripe.module';
import { OrderModule } from '../order/order.module';


@Module({
  imports: [StripeModule, OrderModule],
  controllers: [WebhookController],
})
export class WebhookModule {}

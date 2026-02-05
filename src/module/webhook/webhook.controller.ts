import * as common from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { StripeService } from '../../core/stripe/stripe.service';
import { OrderService } from '../order/order.service';
import { PaymentsService } from '../payments/payments.service';

@common.Controller('webhook')
export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly orderService: OrderService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @common.Post('stripe')
  @common.HttpCode(200)
  async handleStripe(@common.Req() req: common.RawBodyRequest<Request>) {
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      throw new common.BadRequestException('Missing stripe-signature header');
    }
    const stripe = this.stripeService.getClient();

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody!,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      const error = err as Error;
      console.error('❌ STRIPE SIGNATURE ERROR:', error.message);
      throw err;
    }

    const intent = event.data.object as Stripe.PaymentIntent;

    const getOrderIdFromStripe = (obj: Stripe.PaymentIntent) =>
      obj?.metadata?.orderId || null;

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const intentId = intent.id;
          const orderId = getOrderIdFromStripe(intent);

          if (orderId) {
            await this.orderService.handlePaymentSuccess(orderId, intentId);
          }

          break;
        }

        case 'payment_intent.payment_failed':
        case 'payment_intent.canceled': {
          const intentId = intent.id;
          const orderId = getOrderIdFromStripe(intent);

          if (orderId) {
            await this.orderService.markFailedByOrderId(orderId);
          }

          await this.paymentsService.markFailed(intentId);
          break;
        }

        default:
      }
    } catch {
      // ignore
    }

    return { received: true };
  }
}

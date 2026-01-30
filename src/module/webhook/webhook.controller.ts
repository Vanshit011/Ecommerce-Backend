import { Controller, Post, Req, Res, HttpCode } from '@nestjs/common';
import { StripeService } from '../../core/stripe/stripe.service';
import { OrderService } from '../order/order.service';
import { PaymentsService } from '../payments/payments.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly orderService: OrderService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripe(@Req() req: any) {
    const sig = req.headers['stripe-signature'];
    const stripe = this.stripeService.getClient();

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      console.error('❌ STRIPE SIGNATURE ERROR:', err.message);
      throw err;
    }

    const intent = event.data.object as any;

    const getOrderIdFromStripe = (obj: any) =>
      obj?.metadata?.orderId || obj?.payment_intent?.metadata?.orderId || null;

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          const intentId = intent.id;
          const orderId = getOrderIdFromStripe(intent);

          if (orderId) {
            await this.orderService.markPaidByOrderId(orderId);
          }

          await this.paymentsService.markSucceeded(intentId);
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
    } catch (err) {}

    return { received: true };
  }
}

import { Controller, Post, Req, Res, HttpCode } from '@nestjs/common';
import { StripeService } from '../../core/stripe/stripe.service';
import { OrderService } from '../order/order.service';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly orderService: OrderService,
  ) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripe(@Req() req: any, @Res() res: any) {
    const sig = req.headers['stripe-signature'] as string;

    const stripe = this.stripeService.getClient();

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // RAW BUFFER
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      console.error('❌ SIGNATURE ERROR:', err.message);
      return res.status(400).send('Webhook Error');
    }

    const intent = event.data.object as any;

    console.log('🔥 STRIPE EVENT:', event.type, intent?.id);

    switch (event.type) {
      case 'payment_intent.succeeded':
      case 'charge.succeeded': {
        const obj: any = event.data.object;

        const orderId =
          obj.metadata?.orderId || obj.payment_intent?.metadata?.orderId;

        console.log('🎯 ORDER ID FROM STRIPE:', orderId);

        if (!orderId) {
          console.log('❌ NO ORDER ID FOUND IN STRIPE METADATA');
          break;
        }

        await this.orderService.markPaidByOrderId(orderId);
        break;
      }

      case 'payment_intent.payment_failed': {
        console.log('❌ PAYMENT FAILED:', intent.id);

        await this.orderService.handlePaymentFailed(intent.id);
        break;
      }

      default:
        console.log('⚠️ UNHANDLED EVENT TYPE:', event.type);
    }

    return res.json({ received: true });
  }
}

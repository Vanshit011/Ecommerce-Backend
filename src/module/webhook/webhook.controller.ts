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
        console.log('✅ PAYMENT SUCCEEDED:', intent.id);
        await this.orderService.handlePaymentSuccess(intent.id);
        break;

      case 'payment_intent.payment_failed':
        console.log('❌ PAYMENT FAILED:', intent.id);
        await this.orderService.handlePaymentFailed(intent.id);
        break;

      case 'payment_intent.created':
        console.log('ℹ️ PAYMENT INTENT CREATED:', intent.id);
        break;

      default:
        console.log('⚠️ UNHANDLED EVENT TYPE:', event.type);
    }

    return res.json({ received: true });
  }
}

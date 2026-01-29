import {
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
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
    const sig = req.headers['stripe-signature'];

    const stripe = this.stripeService.getClient();

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // RAW buffer is required!
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err: any) {
      console.error('❌ STRIPE SIGNATURE ERROR:', err.message);
      return res.status(400).send('Webhook Error');
    }

    const intent = event.data.object as any;

    console.log('🔥 STRIPE EVENT:', event.type);

    // 🔑 Helper to extract orderId
    const getOrderIdFromStripe = (obj: any) => {
      return (
        obj?.metadata?.orderId ||
        obj?.payment_intent?.metadata?.orderId ||
        null
      );
    };

    try {
      switch (event.type) {
        // ✅ PAYMENT SUCCESS
        case 'payment_intent.succeeded': {
          const orderId = getOrderIdFromStripe(intent);

          console.log('🎯 SUCCESS ORDER:', orderId);

          if (orderId) {
            await this.orderService.markPaidByOrderId(orderId);
          }

          break;
        }

        // ❌ PAYMENT FAILED
        case 'payment_intent.payment_failed':
        case 'payment_intent.canceled': {
          const orderId = getOrderIdFromStripe(intent);

          console.log('🎯 FAILED ORDER:', orderId);

          if (orderId) {
            await this.orderService.markFailedByOrderId(orderId);
          }

          break;
        }

        default:
          console.log('⚠️ UNHANDLED EVENT:', event.type);
      }
    } catch (err) {
      console.error('❌ WEBHOOK PROCESS ERROR:', err);
      // still return 200 to Stripe to avoid retries storm
    }

    return res.json({ received: true });
  }
}

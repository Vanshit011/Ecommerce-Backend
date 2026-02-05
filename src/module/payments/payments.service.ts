import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment } from './entity/payments.entity';
import { Order } from '../order/entity/order.entity';
import { StripeService } from '../../core/stripe/stripe.service';
import { Status } from '../../shared/constants/enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    private stripeService: StripeService,
  ) {}

  // CREATE STRIPE INTENT + SAVE PAYMENT
  async createPaymentIntent(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== Status.PENDING) {
      throw new BadRequestException('Order cannot be paid');
    }

    // CHECK IF INTENT EXISTS
    if (order.stripe_payment_intent_id) {
      try {
        const stripe = this.stripeService.getClient();
        const existingIntent = await stripe.paymentIntents.retrieve(
          order.stripe_payment_intent_id,
        );

        if (
          existingIntent.status === 'requires_payment_method' ||
          existingIntent.status === 'requires_confirmation'
        ) {
          return {
            clientSecret: existingIntent.client_secret,
            payment_intent_id: existingIntent.id,
          };
        }
      } catch (e) {
        console.warn('Could not retrieve existing intent, creating new one', e);
      }
    }

    const stripe = this.stripeService.getClient();

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.total_amount) * 100),
      currency: 'inr',
      automatic_payment_methods: { enabled: true, allow_redirects: 'always' },
      metadata: {
        order_id: order.id,
        user_id: userId,
      },
      description: `Order #${order.id}`,
    });

    //  SAVE PAYMENT
    await this.paymentRepo.save({
      user_id: userId,
      order_id: order.id,
      stripe_payment_intent_id: intent.id,
      amount: Number(order.total_amount),
      currency: 'inr',
      status: 'processing',
    });

    // save on order too
    order.stripe_payment_intent_id = intent.id;
    await this.orderRepo.save(order);

    return {
      clientSecret: intent.client_secret,
      payment_intent_id: intent.id,
    };
  }

  // USER PAYMENTS
  getUserPayments(userId: string) {
    return this.paymentRepo.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  // WEBHOOK HELPERS
  async markSucceeded(intentId: string) {
    await this.paymentRepo.update(
      { stripe_payment_intent_id: intentId },
      { status: 'succeeded', method: 'card' },
    );
  }

  async markFailed(intentId: string) {
    await this.paymentRepo.update(
      { stripe_payment_intent_id: intentId },
      { status: 'failed' },
    );
  }
}

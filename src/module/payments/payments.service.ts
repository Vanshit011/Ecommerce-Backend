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
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== Status.PENDING) {
      throw new BadRequestException('Order cannot be paid');
    }

    const stripe = this.stripeService.getClient();

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: 'inr',
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata: {
        orderId: order.id,
        userId,
      },
    });

    //  SAVE PAYMENT
    await this.paymentRepo.save({
      userId,
      orderId: order.id,
      stripePaymentIntentId: intent.id,
      amount: Number(order.totalAmount),
      currency: 'inr',
      status: 'processing',
    });

    // save on order too
    order.stripePaymentIntentId = intent.id;
    await this.orderRepo.save(order);

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  // USER PAYMENTS
  getUserPayments(userId: string) {
    return this.paymentRepo.find({
      where: { userId },
      order: { created_at: 'DESC' },
    });
  }

  // WEBHOOK HELPERS
  async markSucceeded(intentId: string) {
    await this.paymentRepo.update(
      { stripePaymentIntentId: intentId },
      { status: 'succeeded', method: 'card' },
    );
  }

  async markFailed(intentId: string) {
    await this.paymentRepo.update(
      { stripePaymentIntentId: intentId },
      { status: 'failed' },
    );
  }
}

import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY not defined');
    }

    this.stripe = new Stripe(secretKey);
  }

  getClient(): Stripe {
    return this.stripe;
  }
}

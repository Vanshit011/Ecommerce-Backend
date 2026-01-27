import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { OrderStatus } from '../../shared/constants/enum';
import { Address } from '../address/entity/address.entity';
import { StripeService } from './../../core/stripe/stripe.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,

    @InjectRepository(Address)
    private addressRepo: Repository<Address>,

    private cartService: CartService,

    private stripeService: StripeService,
  ) {}

  async createFromCart(userId: string) {
    // Get cart
    const cart = await this.cartService.getMyCart(userId);

    if (!cart.items.length) {
      throw new NotFoundException('Cart is empty');
    }

    //  Get default address
    const address = await this.addressRepo.findOne({
      where: {
        user: { id: userId },
        isdefault: true,
      },
    });

    if (!address) {
      throw new NotFoundException('No default address found');
    }

    // Calculate total
    let total = 0;

    for (const item of cart.items) {
      total += Number(item.product.price) * item.quantity;
    }

    //  Create order
    const order = await this.orderRepo.save({
      userId,
      addressId: address.id,
      totalAmount: total,
      status: OrderStatus.PENDING,
    });

    // Create order items
    const orderItems = cart.items.map((item) =>
      this.orderItemRepo.create({
        order: order,
        product: item.product,
        price: item.product.price,
        quantity: item.quantity,
      }),
    );

    await this.orderItemRepo.save(orderItems);

    return order;
  }

  async payOrder(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order already paid or cancelled');
    }

    // create stripe payment intent
    const stripe = this.stripeService.getClient();

    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: 'inr',
      metadata: {
        orderId: order.id,
        userId,
      },
    });

    // save intent id
    order.stripePaymentIntentId = intent.id;
    await this.orderRepo.save(order);

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  async handlePaymentSuccess(paymentIntentId: string) {
    console.log('HANDLE PAYMENT SUCCESS:', paymentIntentId);

    const order = await this.orderRepo.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    console.log('ORDER FOUND:', order?.id);

    if (!order) return;

    order.status = OrderStatus.PAID;
    await this.orderRepo.save(order);

    await this.cartService.clearCart(order.userId);
  }

  async handlePaymentFailed(paymentIntentId: string) {
    const order = await this.orderRepo.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!order) return;

    order.status = OrderStatus.FAILED;
    await this.orderRepo.save(order);
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: {
        id: orderId,
        user: { id: userId },
      },
      relations: ['address','user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }
}

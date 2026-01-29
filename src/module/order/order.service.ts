import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { CartService } from '../cart/cart.service';
import { Status } from '../../shared/constants/enum';
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

  // CREATE ORDER FROM CART
  async createFromCart(userId: string) {
    const cart = await this.cartService.getMyCart(userId);

    if (!cart.items.length) {
      throw new NotFoundException('Cart is empty');
    }

    const address = await this.addressRepo.findOne({
      where: {
        user: { id: userId },
        isdefault: true,
      },
    });

    if (!address) {
      throw new NotFoundException('No default address found');
    }

    let total = 0;
    for (const item of cart.items) {
      total += Number(item.product.price) * item.quantity;
    }

    const order = await this.orderRepo.save({
      userId,
      addressId: address.id,
      totalAmount: total,
      status: Status.PENDING,
    });

    const orderItems = cart.items.map((item) =>
      this.orderItemRepo.create({
        order,
        product: item.product,
        price: item.product.price,
        quantity: item.quantity,
      }),
    );

    await this.orderItemRepo.save(orderItems);

    return order;
  }

  // PAY ORDER (STRIPE INTENT)
  async payOrder(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // already paid
    if (order.status !== Status.PENDING) {
      throw new BadRequestException('Order cannot be paid');
    }

    const stripe = this.stripeService.getClient();

    //  Always create NEW intent if old one exists
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalAmount) * 100),
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId: order.id,
        userId,
      },
    });

    order.stripePaymentIntentId = intent.id;
    await this.orderRepo.save(order);

    return {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    };
  }

  // USER ORDERS
  async getUserOrders(userId: string) {
    return this.orderRepo.find({
      where: { userId },
      relations: ['items', 'items.product', 'address'],
      order: {
        created_at: 'DESC',
      },
    });
  }

  // SINGLE ORDER
  async getOrderById(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: {
        id: orderId,
        user: { id: userId },
      },
      relations: ['address', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // PAYMENT FAILED / EXPIRED
  async markFailedByOrderId(orderId: string) {
    if (!orderId) return;

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!order) return;

    order.status = Status.FAILED;
    await this.orderRepo.save(order);
  }

  // PAYMENT SUCCESS
  async markPaidByOrderId(orderId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
    });

    if (!order) return;

    order.status = Status.CONFIRMED;
    await this.orderRepo.save(order);

    await this.cartService.clearCart(order.userId);
  }

  // ADMIN ORDER LIST
  async getOrdersForAdmin(
    adminId: string,
    status?: Status,
    page = 1,
    limit = 10,
  ) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('order.address', 'address')
      .where('product.userId = :adminId', { adminId });

    if (status) {
      qb.andWhere('order.status = :status', { status });
    }

    qb.orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await qb.getManyAndCount();

    return {
      data: orders,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  // ADMIN UPDATE STATUS
  async updateOrderStatusByAdmin(
    orderId: string,
    adminId: string,
    status: Status,
  ) {
    const order = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.items', 'item')
      .leftJoin('item.product', 'product')
      .where('order.id = :orderId', { orderId })
      .andWhere('product.userId = :adminId', { adminId })
      .getOne();

    if (!order) {
      throw new ForbiddenException('Not allowed');
    }

    // transition rules
    if (status === Status.CONFIRMED) {
      throw new BadRequestException('Admin cannot confirm payment');
    }

    if (order.status === Status.CONFIRMED && status !== Status.SHIPPED) {
      throw new BadRequestException('Only SHIPPED allowed');
    }

    if (order.status === Status.SHIPPED && status !== Status.DELIVERED) {
      throw new BadRequestException('Only DELIVERED allowed');
    }

    order.status = status;

    return this.orderRepo.save(order);
  }
}

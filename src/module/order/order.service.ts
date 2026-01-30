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
import { AdminOrderQueryParams } from '../../shared/constants/types';
import { Payment } from '../payments/entity/payments.entity';
import { StripeService } from '../../core/stripe/stripe.service';
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
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,

    private stripeService: StripeService,
  ) {}

  //USER SIDE

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

  // USER CANCEL HIS ORDER
  async cancelOrderByUser(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // already cancelled
    if (order.status === Status.CANCELLED) {
      throw new BadRequestException('Order already cancelled');
    }

    // cannot cancel after shipped
    if (order.status === Status.SHIPPED || order.status === Status.DELIVERED) {
      throw new BadRequestException('Order cannot be cancelled after shipment');
    }

    // unpaid order → just cancel
    if (order.status === Status.PENDING) {
      order.status = Status.CANCELLED;
      return this.orderRepo.save(order);
    }

    // failed payment → just cancel
    if (order.status === Status.FAILED) {
      order.status = Status.CANCELLED;
      return this.orderRepo.save(order);
    }

    //  PAID ORDER → REFUND
    if (order.status === Status.CONFIRMED) {
      const payment = await this.paymentRepo.findOne({
        where: {
          orderId: order.id,
          status: 'succeeded',
        },
        order: { created_at: 'DESC' },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found for refund');
      }

      const stripe = this.stripeService.getClient();

      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
      });

      // update payment
      payment.status = 'refunded';
      payment.refundId = refund.id;
      await this.paymentRepo.save(payment);

      // update order
      order.status = Status.CANCELLED;
      await this.orderRepo.save(order);

      return {
        message: 'Order cancelled and refunded',
        refundId: refund.id,
      };
    }

    throw new BadRequestException('Order cannot be cancelled');
  }

  //ADMIN SIDE

  // ADMIN ORDER LIST
  async getOrdersForAdmin(adminId: string, params: AdminOrderQueryParams) {
    let { page, limit, status } = params;

    // defaults
    page = page || 1;
    limit = limit || 10;

    // clamp
    page = Math.max(1, page);
    limit = Math.min(100, Math.max(1, limit));

    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('item.product', 'product')
      .leftJoinAndSelect('order.address', 'address')
      .where('product.userId = :adminId', { adminId });

    //  STATUS FILTER
    if (status?.length) {
      qb.andWhere('order.status IN (:...status)', { status });
    }

    qb.orderBy('order.created_at', 'DESC').take(limit);

    const [orders, total] = await qb.getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data: orders,
      total,
      page,
      limit,
      lastPage,
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

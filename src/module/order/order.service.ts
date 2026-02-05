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
        is_default: true,
      },
    });

    if (!address) {
      throw new NotFoundException('No default address found');
    }

    //  calculate from SNAPSHOT price
    let total = 0;
    for (const item of cart.items) {
      total += Number(item.price_snapshot) * item.quantity;
    }

    const order = await this.orderRepo.save({
      user_id: userId,
      address_id: address.id,
      total_amount: total,
      status: Status.PENDING,
    });

    const orderItems = cart.items.map((item) =>
      this.orderItemRepo.create({
        order,
        product: item.product,
        price: item.price_snapshot,
        quantity: item.quantity,

        //  variant info
        size: item.size,
        color: item.color,
        variant_id: item.variant_id,

        //  product snapshot
        product_snapshot: {
          name: item.product.name,
          sku: item.product.sku,
          image: item.product.images?.[0]?.url,
        },
      }),
    );

    await this.orderItemRepo.save(orderItems);

    //  clear cart after order
    await this.cartService.clearCart(userId);

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
  async handlePaymentSuccess(orderId: string, intentId: string) {
    await this.orderRepo.manager.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const paymentRepo = manager.getRepository(Payment);

      const order = await orderRepo.findOne({
        where: { id: orderId },
        relations: {
          items: {
            product: true,
          },
        },
      });

      if (!order) throw new NotFoundException('Order not found');

      const payment = await paymentRepo.findOne({
        where: { stripe_payment_intent_id: intentId },
      });

      if (!payment) throw new NotFoundException('Payment not found');

      if (payment.status === 'succeeded') return;

      //  update payment
      payment.status = 'succeeded';
      payment.method = 'card';
      await paymentRepo.save(payment);

      //  update order
      order.status = Status.CONFIRMED;
      await orderRepo.save(order);

      //  reduce stock
      for (const item of order.items) {
        if (item.product.stock_qty < item.quantity) {
          throw new Error(`Stock mismatch for product ${item.product.id}`);
        }

        await manager
          .getRepository(item.product.constructor.name)
          .decrement({ id: item.product.id }, 'stock_qty', item.quantity);
      }
    });
  }

  // USER ORDERS
  async getUserOrders(userId: string) {
    return this.orderRepo.find({
      where: { user: { id: userId } },
      relations: [
        'items',
        'items.product',
        'items.product.images',
        'items.product.category',
        'address',
      ],
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
      relations: [
        'address',
        'user',
        'items',
        'items.product',
        'items.product.images',
        'items.product.category',
      ],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // POLLING FALLBACK: If Pending but looks paid, check Stripe
    if (order.status === Status.PENDING && order.stripe_payment_intent_id) {
      try {
        const stripe = this.stripeService.getClient();
        const intent = await stripe.paymentIntents.retrieve(
          order.stripe_payment_intent_id,
        );

        if (intent.status === 'succeeded') {
          await this.handlePaymentSuccess(order.id, intent.id);

          // Return updated status
          order.status = Status.CONFIRMED;
        }
      } catch (err) {
        console.error('Error polling Stripe status:', err);
      }
    }

    return order;
  }

  // USER CANCEL HIS ORDER
  async cancelOrderByUser(orderId: string, userId: string) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
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
          order: { id: order.id },
          status: 'succeeded',
        },
        order: { created_at: 'DESC' },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found for refund');
      }

      const stripe = this.stripeService.getClient();

      const refund = await stripe.refunds.create({
        payment_intent: payment.stripe_payment_intent_id,
      });

      // update payment
      payment.status = 'refunded';
      payment.refund_id = refund.id;
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
    let { page, limit } = params;
    const { status, paymentStatus } = params;

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
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.payments', 'payment')
      .where('product.user_id = :adminId', { adminId });

    // Order status filter
    if (status?.length) {
      qb.andWhere('order.status IN (:...status)', { status });
    }

    // Payment status filter
    if (paymentStatus?.length) {
      qb.andWhere('payment.status IN (:...paymentStatus)', {
        paymentStatus,
      });
    }

    // Pagination
    qb.orderBy('order.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

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
      .andWhere('product.user_id = :adminId', { adminId })
      .getOne();

    if (!order) {
      throw new ForbiddenException('Not allowed');
    }

    order.status = status;

    return this.orderRepo.save(order);
  }
}

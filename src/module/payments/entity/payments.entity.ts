import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Order } from '../../order/entity/order.entity';
import { User } from '../../user/entity/user.entity';

@Entity({ name: 'payments' })
export class Payment extends BaseEntity {
  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column()
  stripePaymentIntentId: string;

  @Column()
  status: string;

  @Column('decimal')
  amount: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  method: string;

  @Column({ nullable: true })
  refundId: string;
}

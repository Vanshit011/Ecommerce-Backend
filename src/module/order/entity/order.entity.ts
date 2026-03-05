import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Status } from '../../../shared/constants/enum';
import { User } from '../../user/entity/user.entity';
import { Address } from '../../address/entity/address.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entity/payments.entity';
import { Coupon } from '../../coupon/entity/coupon.entity';

@Entity('orders')
@Index('idx_orders_created_at', ['created_at'])
@Index('idx_orders_user_created', ['user', 'created_at'])
@Index('idx_orders_status', ['status'])
export class Order extends BaseEntity {
  @Index('idx_orders_user_id')
  @ManyToOne(() => User, (user) => user.order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index('idx_orders_address_id')
  @ManyToOne(() => Address, (address) => address.order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  status: Status;

  @Index('idx_orders_stripe_payment_intent_id')
  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_payment_intent_id: string;

  @ManyToOne(() => Coupon, { nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}

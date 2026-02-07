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

@Entity('orders')
@Index(['created_at'])
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Address, (address) => address.order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'address_id' })
  address: Address;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Index()
  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  status: Status;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  stripe_payment_intent_id: string;

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}

import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Status } from '../../../shared/constants/enum';
import { User } from '../../user/entity/user.entity';
import { Address } from '../../address/entity/address.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User, (user) => user.order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Address, (address) => address.order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'address_id' })
  address: Address;
  @Column({ name: 'address_id', type: 'uuid' })
  addressId: string;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.PENDING,
  })
  status: Status;

  @Column({ nullable: true })
  stripePaymentIntentId: string;
}

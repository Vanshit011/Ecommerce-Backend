import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../user/entity/user.entity';
import { Order } from './../../order/entity/order.entity';

@Entity({ name: 'addresses' })
export class Address extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 255 })
  address_line_1: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address_line_2?: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 20 })
  postal_code: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @Index('idx_addresses_user_id')
  @ManyToOne(() => User, (user) => user.address, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Order, (order) => order.address)
  order: Order[];
}

import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../user/entity/user.entity';
import { Order } from './../../order/entity/order.entity';

@Entity({ name: 'addresses' })
export class Address extends BaseEntity {
  @Column({ length: 255 })
  full_name: string;

  @Column({ length: 255 })
  address_line_1: string;

  @Column({ length: 255, nullable: true })
  address_line_2?: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 20 })
  postal_code: string;

  @Column({ length: 100 })
  country: string;

  @Column({ default: false })
  is_default: boolean;

  @ManyToOne(() => User, (user) => user.address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: string;

  @OneToMany(() => Order, (order) => order.address)
  order: Order[];
}

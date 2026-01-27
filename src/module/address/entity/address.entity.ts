import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../user/entity/user.entity';
import { Order } from './../../order/entity/order.entity';

@Entity({ name: 'addresses' })
export class Address extends BaseEntity {
  @Column({ length: 255 })
  fullname: string;

  @Column({ length: 255 })
  addressline1: string;

  @Column({ length: 255, nullable: true })
  addressline2?: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 20 })
  postalcode: string;

  @Column({ length: 100 })
  country: string;

  @Column({ default: true })
  isdefault: boolean;

  @ManyToOne(() => User, (user) => user.address, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Order, (order) => order.address)
  order: Order[];
}

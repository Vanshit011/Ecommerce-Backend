import { Column, OneToMany, Entity, Index } from 'typeorm';
import { Token } from '../../../module/token/entity/token.entity';
import { Otp } from '../../auth/entity/otp.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { UserRole } from '../../../shared/constants/enum';
import { Product } from '../../../module/product/entity/product.entity';
import { Favorite } from '../../../module/favorite/entity/favorite.entity';
import { CartItem } from '../../../module/cart/entity/cart.entity';
import { Address } from '../../address/entity/address.entity';
import { Order } from '../../order/entity/order.entity';
import { Payment } from '../../payments/entity/payments.entity';

@Entity('users')
export class User extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  name: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  mobile: string;

  @Index()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(() => Otp, (otp) => otp.user)
  otps: Otp[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cart_items: CartItem[];

  @OneToMany(() => Address, (address) => address.user)
  address: Address[];

  @OneToMany(() => Order, (order) => order.user)
  order: Order[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];
}
export { UserRole };

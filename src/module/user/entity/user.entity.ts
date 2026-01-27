import { Column, OneToMany, Entity } from 'typeorm';
import { Token } from '../../../module/auth/entity/auth.entity';
import { PasswordResetOtp } from '../../../module/auth/entity/password-reset-otp.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { UserRole } from '../../../shared/constants/enum';
import { Product } from '../../../module/product/entity/product.entity';
import { Favorite } from '../../../module/favorite/entity/favorite.entity';
import { CartItem } from '../../../module/cart/entity/cart.entity';
import { Address } from '../../address/entity/address.entity';
import { Order } from '../../order/entity/order.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true, nullable: true })
  mobile: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToMany(
    () => PasswordResetOtp,
    (passwordResetOtp) => passwordResetOtp.user,
  )
  PasswordResetOtps: PasswordResetOtp[];

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems: CartItem[];

  @OneToMany(() => Address, (address) => address.user)
  address: Address[];

  @OneToMany(() => Order, (order) => order.user)
  order: Order[];
}
export { UserRole };

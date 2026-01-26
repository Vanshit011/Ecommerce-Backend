import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Product } from '../../product/entity/product.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column({ default: 1 })
  quantity: number;
}

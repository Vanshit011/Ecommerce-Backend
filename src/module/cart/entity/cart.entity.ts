import { Entity, Column, ManyToOne } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Product } from '../../product/entity/product.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @ManyToOne(() => User, (user) => user.cart_items, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column({ default: 1 })
  quantity: number;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  variant_id: string;

  @Column({ type: 'numeric' })
  price_snapshot: number;
}

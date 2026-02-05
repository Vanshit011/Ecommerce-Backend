import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Product } from '../../product/entity/product.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @ManyToOne(() => User, (user) => user.cart_items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ name: 'user_id', type: 'uuid' })
  user_id: string;

  @ManyToOne(() => Product, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
  @Column({ name: 'product_id', type: 'uuid' })
  product_id: string;

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

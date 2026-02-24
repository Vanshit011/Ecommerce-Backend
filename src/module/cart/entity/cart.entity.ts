import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Product } from '../../product/entity/product.entity';
import { ProductVariant } from '../../product/entity/product-variant.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('cart_items')
@Index(['user', 'product', 'variant_id'])
export class CartItem extends BaseEntity {
  @Index()
  @ManyToOne(() => User, (user) => user.cart_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductVariant, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ name: 'variant_id', nullable: true })
  variant_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price_snapshot: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  active_cart_coupon: string | null;
}

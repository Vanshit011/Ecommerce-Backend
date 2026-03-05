import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../../module/user/entity/user.entity';
import { Category } from '../../categories/entity/category.entity';
import { Favorite } from '../../favorite/entity/favorite.entity';
import { CartItem } from '../../cart/entity/cart.entity';
import { ProductStatus } from '../../../shared/constants/enum';
import { ProductImage } from './product_images.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from '../../review/entity/review.entity';

@Entity('products')
@Index('idx_products_created_at', ['created_at'])
@Index('idx_products_category_is_active', ['category', 'is_active'])
@Index('idx_products_category_availability_isActive', [
  'category',
  'availability',
  'is_active',
])
@Index('idx_products_brand_is_active', ['brand', 'is_active'])
@Index('idx_products_is_active_created_at', ['is_active', 'created_at'])
export class Product extends BaseEntity {
  @Index('idx_products_name')
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @Index('idx_products_is_active')
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Index('idx_products_brand')
  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Index('idx_products_availability')
  @Column({
    type: 'enum',
    enum: ProductStatus,
  })
  availability: ProductStatus;

  @Column({ type: 'tsvector', nullable: true, select: false })
  search_vector: any;

  // RELATIONS
  @Index('idx_products_category_id')
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Index('idx_products_user_id')
  @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cart_items: CartItem[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}

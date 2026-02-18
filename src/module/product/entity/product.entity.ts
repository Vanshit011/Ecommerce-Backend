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

@Entity('products')
@Index(['created_at'])
@Index(['category', 'is_active'])
@Index(['category', 'availability', 'is_active'])
@Index(['brand', 'is_active'])
export class Product extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @Index()
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ProductStatus,
  })
  availability: ProductStatus;
  //  RELATIONS

  @Index()
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Index()
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
}

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

@Entity('products')
@Index('idx_products_user', ['user_id'])
@Index('idx_products_category', ['category_id'])
@Index('idx_products_price', ['price'])
@Index('idx_products_active', ['is_active'])
@Index('idx_products_availability', ['availability'])
@Index('idx_products_sku', ['sku'], { unique: true })
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric' })
  price: number;

  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ unique: true, nullable: true })
  sku: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ type: 'int', default: 0 })
  stock_qty: number;

  @Column({ type: 'numeric', nullable: true })
  sale_price: number;

  @Column({
    type: 'enum',
    enum: ProductStatus,
  })
  availability: ProductStatus;

  @Column('simple-array', { nullable: true })
  sizes: string[];

  @Column('simple-array', { nullable: true })
  colors: string[];

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  @Column({ nullable: true })
  weight: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: {
    length: number;
    width: number;
    height: number;
  };

  @Column({ nullable: true })
  meta_title: string;

  @Column({ nullable: true })
  meta_description: string;

  //  RELATIONS

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ nullable: true })
  category_id: string;

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column()
  user_id: string;

  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cart_items: CartItem[];
}

import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../../module/user/entity/user.entity';
import { Category } from '../../categories/entity/category.entity';
import { Favorite } from '../../favorite/entity/favorite.entity';
import { CartItem } from '../../cart/entity/cart.entity';
import { ProductStatus } from '../../../shared/constants/enum';
import { ProductImage } from './product_images.entity';

@Entity('products')
@Index('idx_products_user', ['userId'])
@Index('idx_products_category', ['categoryId'])
@Index('idx_products_price', ['price'])
@Index('idx_products_active', ['isActive'])
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
  isActive: boolean;

  @Column({ unique: true, nullable: true })
  sku: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ type: 'int', default: 0 })
  stockQty: number;

  @Column({ type: 'numeric', nullable: true })
  salePrice: number;

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
  metaTitle: string;

  @Column({ nullable: true })
  metaDescription: string;

  //  RELATIONS

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => User, (user) => user.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;
  @Column()
  userId: string;

  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];
}

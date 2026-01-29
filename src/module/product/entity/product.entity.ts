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
@Entity('products')
@Index('idx_products_category', ['categoryId'])
@Index('idx_products_price', ['price'])
@Index('idx_products_active', ['isActive'])
@Index('idx_products_user', ['userId'])
@Index('idx_products_created', ['created_at'])
@Index('idx_products_name', ['name'])
export class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'numeric' })
  price: number;

  @Column({ type: 'varchar' })
  image: string;

  @Column({ type: 'varchar', nullable: true })
  imagePublicId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ nullable: true })
  categoryId: string;

  @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @OneToMany(() => Favorite, (favorite) => favorite.product)
  favorites: Favorite[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];
}

import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../user/entity/user.entity';
import { Product } from '../../product/entity/product.entity';

@Entity('reviews')
@Index('idx_reviews_product_created_at', ['product', 'created_at'], {
  where: 'deleted_at IS NULL',
})
@Index('idx_reviews_user_product', ['user', 'product'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
@Index('idx_reviews_user', ['user'], { where: 'deleted_at IS NULL' })
@Index('idx_reviews_product_rating', ['product', 'rating'], {
  where: 'deleted_at IS NULL',
})
export class Review extends BaseEntity {
  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.reviews, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

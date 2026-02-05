import { Entity, ManyToOne, Column, JoinColumn, Index } from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('product_images')
@Index('idx_product_images_product', ['product_id'])
@Index('idx_product_images_main', ['product_id', 'is_main'])
export class ProductImage extends BaseEntity {
  @ManyToOne(() => Product, (p) => p.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
  @Column()
  product_id: string;

  @Column()
  url: string;

  @Column({ type: 'varchar', nullable: true })
  image_public_id: string;

  @Column({ default: false })
  is_main: boolean;
}

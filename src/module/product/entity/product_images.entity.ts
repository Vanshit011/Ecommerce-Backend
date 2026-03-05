import { Entity, ManyToOne, Column, JoinColumn, Index } from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('product_images')
@Index('idx_product_images_product_is_main', ['product', 'is_main'])
export class ProductImage extends BaseEntity {
  @Index('idx_product_images_product_id')
  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  image_public_id: string;

  @Column({ type: 'boolean', default: false })
  is_main: boolean;
}

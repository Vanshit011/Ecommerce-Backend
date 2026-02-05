import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('product_images')
export class ProductImage extends BaseEntity {
  @ManyToOne(() => Product, (p) => p.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  url: string;

  @Column()
  image_public_id: string;

  @Column({ type: 'boolean', default: false })
  is_main: boolean;
}

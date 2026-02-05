import { Entity, ManyToOne, Column, JoinColumn, Index } from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('product_images')
@Index('idx_product_images_product', ['productId'])
@Index('idx_product_images_main', ['productId', 'isMain'])
export class ProductImage extends BaseEntity {
  @ManyToOne(() => Product, (p) => p.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;
  @Column()
  productId: string;

  @Column()
  url: string;

  @Column({ type: 'varchar', nullable: true })
  imagePublicId: string;

  @Column({ default: false })
  isMain: boolean;
}

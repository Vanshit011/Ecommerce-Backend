import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Order } from './order.entity';
import { Product } from '../../product/entity/product.entity';
import { ProductVariant } from '../../product/entity/product-variant.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductVariant, { nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string;

  @Column({ name: 'variant_id', nullable: true })
  variant_id: string;

  // optional but highly recommended
  @Column({ type: 'json', nullable: true })
  product_snapshot: {
    name: string;
    sku: string;
    image: string;
  };
}

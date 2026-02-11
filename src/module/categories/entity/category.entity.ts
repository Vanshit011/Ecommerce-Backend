import {
  Entity,
  Column,
  OneToMany,
  TreeParent,
  TreeChildren,
  Tree,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Product } from '../../product/entity/product.entity';

@Entity({ name: 'categories' })
@Tree('nested-set')
export class Category extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @TreeParent()
  parent: Category;

  @TreeChildren()
  children: Category[];
}

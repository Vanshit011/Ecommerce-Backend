import {
  Entity,
  Column,
  OneToMany,
  TreeParent,
  TreeChildren,
  Tree,
  TreeLevelColumn,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Product } from '../../product/entity/product.entity';

@Entity({ name: 'categories' })
@Tree('nested-set')
export class Category extends BaseEntity {
  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @TreeParent()
  parent: Category;

  @TreeChildren()
  children: Category[];
}

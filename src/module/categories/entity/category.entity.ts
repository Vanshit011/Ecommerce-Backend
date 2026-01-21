import { Entity, Column, OneToMany } from 'typeorm';
import { Product } from '../../product/entity/product.entity'; 
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity({ name: 'categories' })
export class Category extends BaseEntity {
  
  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Product, product => product.category) 
  products: Product[]; 
}
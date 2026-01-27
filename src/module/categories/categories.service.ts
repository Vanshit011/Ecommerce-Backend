import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  create(category: Partial<Category>) {
    return this.categoryRepository.save(category);
  }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async update(id: string, dto: Partial<Category>) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async delete(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.deleted_at) {
      return {
        message: 'Category already deleted',
      };
    }

    await this.categoryRepository.softDelete(id);

    return {
      message: 'Category deleted successfully',
    };
  }
}

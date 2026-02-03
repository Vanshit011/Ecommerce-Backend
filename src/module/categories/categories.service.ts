import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { DataSource, TreeRepository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: TreeRepository<Category>,
    private dataSource: DataSource,
  ) {
    this.categoryRepository = this.dataSource.getTreeRepository(Category);
  }

  async create(dto: CreateCategoryDto) {
    const category = this.categoryRepository.create({
      name: dto.name,
      description: dto.description,
    });

    // if parentId provided attach to parent
    if (dto.parentId) {
      const parent = await this.categoryRepository.findOneBy({
        id: dto.parentId,
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      category.parent = parent;
    }

    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.findTrees();
  }

  async update(id: string, dto: Partial<Category>) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    Object.assign(category, dto);

    return this.categoryRepository.save(category);
  }

  async delete(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const repo = manager.getTreeRepository(Category);

      const category = await repo.findOne({
        where: { id },
        relations: ['parent', 'children'],
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
      //if parent id not there in this called
      const parent = category.parent ?? null;

      // move children up
      if (category.children?.length) {
        for (const child of category.children) {
          await repo.update(child.id, { parent });
        }
      }

      // delete node
      await repo.delete(category.id);

      return {
        message: 'Category deleted and children moved safely',
      };
    });
  }
}

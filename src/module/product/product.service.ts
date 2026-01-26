import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { deleteImage, uploadImage } from '../../core/utils/cloudinary.helper';
import { Category } from '../categories/entity/category.entity';
import type { ProductQueryParams } from '../../shared/constants/types';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly category: Repository<Category>,
  ) {}

  async create(
    dto: CreateProductDto,
    imageUrl: string,
    publicId: string,
    userId: string,
  ) {
    return this.productRepo.save({
      ...dto,
      image: imageUrl,
      imagePublicId: publicId,
      userId: userId,
    });
  }

  // USER see all products
  async findAllForUsers(query: ProductQueryParams) {
    const { page, limit, skip, search, categories } = query;

    const qb = this.productRepo
      .createQueryBuilder('products')
      .leftJoinAndSelect('products.category', 'category')
      .where('products.isActive = :active', { active: true });

    if (search) {
      qb.andWhere(
        '(LOWER(products.name) LIKE :search OR LOWER(products.description) LIKE :search OR LOWER(category.name) LIKE :search)',
        {
          search: `%${search.toLowerCase()}%`,
        },
      );
    }

    // Category filter
    if (categories?.length) {
      qb.andWhere('LOWER(category.name) IN (:...categories)', {
        categories: categories.map((c) => c.toLowerCase()),
      });
    }

    //min price filter
    if (query.minPrice !== undefined) {
      qb.andWhere('products.price >= :minPrice', {
        minPrice: query.minPrice,
      });
    }
    //max price filter
    if (query.maxPrice !== undefined) {
      qb.andWhere('products.price <= :maxPrice', {
        maxPrice: query.maxPrice,
      });
    }

    // Sorting
    if (query.sort === 'price_asc') {
      qb.orderBy('products.price', 'ASC');
    } else if (query.sort === 'price_desc') {
      qb.orderBy('products.price', 'DESC');
    } else {
      qb.orderBy('products.created_at', 'DESC');
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        categories: categories || [],
        minPrice: query.minPrice,
        maxPrice: query.maxPrice,
        sort: query.sort || null,
      },
    };
  }

  // ADMIN see only own products
  findAllForAdmin(userId: string) {
    return this.productRepo.find({
      where: { isActive: true, userId },
      relations: ['category'],
    });
  }

  // admin update own product
  async update(
    id: string,
    dto: Partial<CreateProductDto>,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const product = await this.productRepo.findOne({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    if (file) {
      if (product.imagePublicId) {
        await deleteImage(product.imagePublicId);
      }

      const uploaded = await uploadImage(file.buffer, 'ecommerce/products');
      product.image = uploaded.url;
      product.imagePublicId = uploaded.publicId;
    }

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }

  // admin delete own product (soft delete)
  async delete(id: string, userId: string) {
    const product = await this.productRepo.findOne({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    await this.productRepo.softDelete(id);

    return {
      message: 'Product moved to trash successfully',
    };
  }

  //product details for users
  async getProductDetails(id: string) {
    const product = await this.productRepo.findOne({
      where: { id, isActive: true },
      relations: ['category'],
    });
    return product;
  }
}

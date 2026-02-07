import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from '../categories/entity/category.entity';
import { ProductImage } from './entity/product_images.entity';
import { ProductStatus } from '../../shared/constants/enum';
import type { ProductQueryParams } from '../../shared/constants/types';
import { deleteImage, uploadImage } from 'src/core/utils/cloudinary.helper';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
  ) {}

  //--------------ADMIN-------------//

  //Admin create product
  async create(
    dto: CreateProductDto,
    files: Express.Multer.File[],
    userId: string,
  ) {
    const { category_id, main_image_index = 0, ...rest } = dto;

    const category = await this.categoryRepo.findOneBy({ id: category_id });

    if (!category) {
      throw new BadRequestException('Invalid category selected');
    }

    return this.productRepo.manager
      .transaction(async (manager) => {
        const productRepo = manager.getRepository(Product);
        const imageRepo = manager.getRepository(ProductImage);

        const product = productRepo.create({
          ...rest,
          user: { id: userId },
          category,
        });

        const savedProduct = await productRepo.save(product);

        if (files?.length) {
          const uploadResults = await Promise.all(
            files.map((file) => uploadImage(file.buffer, 'ecommerce/products')),
          );

          const images = uploadResults.map((result, index) =>
            imageRepo.create({
              product: { id: savedProduct.id },
              url: result.url,
              image_public_id: result.publicId,
              is_main: index === Number(main_image_index),
            }),
          );

          await imageRepo.save(images);
        }

        return productRepo.findOne({
          where: { id: savedProduct.id },
          relations: ['images', 'category'],
        });
      })
      .finally(() => {
        console.timeEnd('TOTAL_CREATE_PRODUCT');
      });
  }

  // admin see only own products
  async findAllForAdmin(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.productRepo.findAndCount({
      where: {
        user: { id: userId },
      },
      relations: ['category', 'images'],
      order: {
        created_at: 'DESC',
      },
      take: limit,
      skip,
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // admin update own product
  async update(
    id: string,
    dto: Partial<CreateProductDto>,
    files: Express.Multer.File[],
    userId: string,
  ) {
    const product = await this.productRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    if (dto.price !== undefined) dto.price = Number(dto.price);
    if (dto.sale_price !== undefined) dto.sale_price = Number(dto.sale_price);
    if (dto.stock_qty !== undefined) dto.stock_qty = Number(dto.stock_qty);

    if (dto.is_active !== undefined) {
      const raw: unknown = dto.is_active;

      dto.is_active =
        raw === true || raw === 'true' || raw === 1 || raw === '1';
    }
    if (typeof dto.availability === 'string') {
      dto.availability = dto.availability.toUpperCase() as ProductStatus;
    }

    Object.assign(product, dto);

    // ---------- auto availability ----------
    if (dto.stock_qty !== undefined) {
      product.availability =
        dto.stock_qty === 0 ? ProductStatus.OUTOFSTOCK : ProductStatus.INSTOCK;
    }

    await this.productRepo.save(product);

    // ---------- replace images if new uploaded ----------
    if (files?.length) {
      for (const img of product.images ?? []) {
        if (img.image_public_id) {
          await deleteImage(img.image_public_id);
        }
      }

      await this.imageRepo.delete({ product: { id } });

      const uploadResults = await Promise.all(
        files.map((file) => uploadImage(file.buffer, 'ecommerce/products')),
      );

      const images = uploadResults.map((result, index) =>
        this.imageRepo.create({
          product: { id },
          url: result.url,
          image_public_id: result.publicId,
          is_main: index === 0,
        }),
      );

      await this.imageRepo.save(images);
    }

    return this.productRepo.findOne({
      where: { id },
      relations: ['images', 'category'],
    });
  }

  // admin delete own product
  async delete(id: string, userId: string) {
    const product = await this.productRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    //  delete images from cloud
    for (const img of product.images ?? []) {
      if (img.image_public_id) {
        await deleteImage(img.image_public_id);
      }
    }

    // delete image records
    await this.imageRepo.delete({ product: { id } });

    // soft delete product
    await this.productRepo.softDelete(id);

    return {
      message: 'Product and images moved to trash successfully',
    };
  }

  //------------------USER-----------------//

  // USER see all products
  async findAllForUsers(query: ProductQueryParams) {
    let { page, limit, skip } = query;
    const { search, categories, minPrice, maxPrice, sort } = query;

    page = page || 1;
    limit = limit || 10;

    skip = (page - 1) * limit;

    const qb = this.productRepo
      .createQueryBuilder('products')
      .leftJoinAndSelect('products.category', 'category')
      .leftJoinAndSelect('products.images', 'images')
      .where('products.is_active = :active', { active: true });

    //  SEARCH
    if (search) {
      qb.andWhere(
        `(
        LOWER(products.name) LIKE :search
        OR LOWER(products.description) LIKE :search
        OR LOWER(category.name) LIKE :search
      )`,
        {
          search: `%${search.toLowerCase()}%`,
        },
      );
    }

    //  CATEGORY FILTER
    if (categories?.length) {
      qb.andWhere('category.id IN (:...categories)', {
        categories,
      });
    }

    //  PRICE RANGE
    if (minPrice !== undefined) {
      qb.andWhere('products.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('products.price <= :maxPrice', { maxPrice });
    }

    //  SORTING
    switch (sort) {
      case 'price_asc':
        qb.orderBy('products.price', 'ASC');
        break;

      case 'price_desc':
        qb.orderBy('products.price', 'DESC');
        break;

      case 'newest':
        qb.orderBy('products.created_at', 'DESC');
        break;

      default:
        qb.orderBy('products.created_at', 'DESC');
    }

    //  prevent duplicates from images join
    qb.distinct(true);

    // pagination
    qb.skip(skip).take(limit);

    const [products, total] = await qb.getManyAndCount();

    const lastPage = Math.ceil(total / limit);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: lastPage,
        hasNextPage: page < lastPage,
        hasPrevPage: page > 1,
      },
    };
  }

  //product details for users
  async getProductDetails(id: string) {
    const product = await this.productRepo.findOne({
      where: { id, is_active: true },
      relations: ['category', 'images'],
    });
    return product;
  }
}

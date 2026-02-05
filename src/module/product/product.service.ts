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
import { deleteImage } from 'src/core/utils/cloudinary.helper';

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
    const { categoryId, mainImageIndex = 0, ...rest } = dto;

    const category = await this.categoryRepo.findOneBy({ id: categoryId });

    if (!category) {
      throw new BadRequestException('Invalid category selected');
    }

    return this.productRepo.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const imageRepo = manager.getRepository(ProductImage);

      const product = productRepo.create({
        ...rest,
        userId,
        category,
      });

      const savedProduct = await productRepo.save(product);

      // STORE images
      if (files?.length) {
        const images = files.map((file, index) =>
          imageRepo.create({
            productId: savedProduct.id,
            url: file.path,
            imagePublicId: file.filename,
            isMain: index === Number(mainImageIndex),
          }),
        );

        await imageRepo.save(images);
      }

      return productRepo.findOne({
        where: { id: savedProduct.id },
        relations: ['images', 'category'],
      });
    });
  }

  // admin see only own products
  async findAllForAdmin(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.productRepo.findAndCount({
      where: {
        userId,
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
      where: { id, userId },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    if (dto.price !== undefined) dto.price = Number(dto.price);
    if (dto.salePrice !== undefined) dto.salePrice = Number(dto.salePrice);
    if (dto.stockQty !== undefined) dto.stockQty = Number(dto.stockQty);

    if (dto.isActive !== undefined) {
      const raw = dto.isActive as any;

      dto.isActive = raw === true || raw === 'true' || raw === 1 || raw === '1';
    }

    if (typeof dto.availability === 'string') {
      dto.availability = dto.availability.toUpperCase() as any;
    }

    if (dto.sizes && typeof dto.sizes === 'string') {
      dto.sizes = (dto.sizes as unknown as string)
        .split(',')
        .map((v) => v.trim());
    }

    if (dto.colors && typeof dto.colors === 'string') {
      dto.colors = (dto.colors as unknown as string)
        .split(',')
        .map((v) => v.trim());
    }

    if (dto.tags && typeof dto.tags === 'string') {
      dto.tags = (dto.tags as unknown as string)
        .split(',')
        .map((v) => v.trim());
    }

    Object.assign(product, dto);

    // ---------- auto availability ----------
    if (dto.stockQty !== undefined) {
      product.availability =
        dto.stockQty === 0 ? ProductStatus.OUTOFSTOCK : ProductStatus.INSTOCK;
    }

    await this.productRepo.save(product);

    // ---------- replace images if new uploaded ----------
    if (files?.length) {
      for (const img of product.images ?? []) {
        if (img.imagePublicId) {
          await deleteImage(img.imagePublicId);
        }
      }

      await this.imageRepo.delete({ productId: id });

      const images = files.map((file, index) =>
        this.imageRepo.create({
          productId: id,
          url: file.path,
          imagePublicId: file.filename,
          isMain: index === 0,
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
      where: { id, userId },
      relations: ['images'],
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    //  delete images from cloud
    for (const img of product.images ?? []) {
      if (img.imagePublicId) {
        await deleteImage(img.imagePublicId);
      }
    }

    // delete image records
    await this.imageRepo.delete({ productId: id });

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
      .where('products.isActive = :active', { active: true });

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
      where: { id, isActive: true },
      relations: ['category', 'images'],
    });
    return product;
  }
}

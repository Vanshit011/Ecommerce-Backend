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
import { deleteImage, uploadImage } from '../../core/utils/cloudinary.helper';
import { ProductVariant } from './entity/product-variant.entity';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(ProductImage)
    private readonly imageRepo: Repository<ProductImage>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  //--------------ADMIN-------------//

  //Admin create product
  async create(
    dto: CreateProductDto,
    files: Express.Multer.File[],
    userId: string,
  ) {
    const { category_id, main_image_index = 0, variants, ...rest } = dto;

    const category = await this.categoryRepo.findOneBy({ id: category_id });
    if (!category) {
      throw new BadRequestException('Invalid category selected');
    }

    return this.productRepo.manager
      .transaction(async (manager) => {
        const productRepo = manager.getRepository(Product);
        const imageRepo = manager.getRepository(ProductImage);
        const variantRepo = manager.getRepository(ProductVariant);

        const product = productRepo.create({
          ...rest,
          user: { id: userId },
          category,
        });

        const savedProduct = await productRepo.save(product);

        //  Save images
        if (files?.length) {
          const uploadResults = await Promise.all(
            files.map((file) => uploadImage(file.buffer, 'ecommerce/products')),
          );

          const images = uploadResults.map((result, index) =>
            imageRepo.create({
              product: savedProduct,
              url: result.url,
              image_public_id: result.publicId,
              is_main: index === Number(main_image_index),
            }),
          );

          await imageRepo.save(images);
        }

        //  Save variants
        if (variants && variants.length > 0) {
          const productVariants = variants.map((v) =>
            variantRepo.create({
              color: v.color,
              size: v.size,
              price: v.price,
              stock_qty: v.stock_qty,
              sku: v.sku,
              product: savedProduct,
            }),
          );

          await variantRepo.save(productVariants);
        }

        //  Return product WITH variants
        return productRepo.findOne({
          where: { id: savedProduct.id },
          relations: ['images', 'category', 'variants'],
        });
      })
      .finally(() => {
        console.timeEnd('TOTAL_CREATE_PRODUCT');
      });
  }

  // admin see only own products
  async findAllForAdmin(userId: string, page = 1, limit = 10) {
    // 1. Force values to numbers (in case they come as strings from query)
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    // 2. Validate input to prevent 500 errors
    if (
      isNaN(pageNumber) ||
      pageNumber < 1 ||
      isNaN(limitNumber) ||
      limitNumber < 1
    ) {
      throw new BadRequestException('Page and limit must be positive integers');
    }
    const skip = (pageNumber - 1) * limitNumber;

    try {
      const [data, total] = await this.productRepo.findAndCount({
        where: {
          user: { id: userId },
        },
        relations: ['category', 'images', 'variants'],
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
    } catch {
      throw new BadRequestException('Invalid page or limit');
    }
  }

  // admin update own product
  async update(
    id: string,
    dto: Partial<CreateProductDto>,
    files: Express.Multer.File[],
    userId: string,
  ) {
    return this.productRepo.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const variantRepo = manager.getRepository(ProductVariant);
      const imageRepo = manager.getRepository(ProductImage);

      const product = await productRepo.findOne({
        where: { id, user: { id: userId } },
        relations: ['images', 'variants', 'category'],
      });

      if (!product) {
        throw new NotFoundException('Product not found or access denied');
      }

      const { variants, ...rest } = dto;

      // ---------- normalize ----------
      if (rest.price !== undefined) rest.price = Number(rest.price);
      if (rest.sale_price !== undefined)
        rest.sale_price = Number(rest.sale_price);
      if (rest.stock_qty !== undefined) rest.stock_qty = Number(rest.stock_qty);

      if (rest.is_active !== undefined) {
        rest.is_active = rest.is_active === true;
      }

      if (typeof rest.availability === 'string') {
        rest.availability = rest.availability.toUpperCase() as ProductStatus;
      }

      Object.assign(product, rest);

      // ---------- auto availability ----------
      if (rest.stock_qty !== undefined) {
        product.availability =
          rest.stock_qty === 0
            ? ProductStatus.OUTOFSTOCK
            : ProductStatus.INSTOCK;
      }

      await productRepo.save(product);

      // ---------- VARIANTS ----------
      // STRICT ID MATCHING (MERGE STRATEGY)
      if (variants) {
        const createVariantDto = variants;

        for (const v of createVariantDto) {
          // Handle sparse array (undefined/null items)
          if (!v) continue;

          if (v.id) {
            // UPDATE existing variant by ID
            const variantUpdate: Partial<ProductVariant> = {};
            if (v.color !== undefined) variantUpdate.color = v.color;
            if (v.size !== undefined) variantUpdate.size = v.size;
            if (v.price !== undefined) variantUpdate.price = v.price;
            if (v.stock_qty !== undefined)
              variantUpdate.stock_qty = v.stock_qty;
            if (v.sku !== undefined) variantUpdate.sku = v.sku;

            // We use update here, assuming the ID belongs to this product.
            await variantRepo.update(v.id, variantUpdate as any);
          } else {
            // CREATE new variant
            const price = v.price !== undefined ? v.price : 0;
            const stock_qty = v.stock_qty !== undefined ? v.stock_qty : 0;
            const sku =
              v.sku ||
              `SKU-${Math.random()
                .toString(36)
                .substring(2, 10)
                .toUpperCase()}`;

            await variantRepo.save(
              variantRepo.create({
                ...v,
                price,
                stock_qty,
                sku,
                product,
              }),
            );
          }
        }
      }

      // ---------- IMAGES ----------
      if (files?.length) {
        for (const img of product.images) {
          if (img.image_public_id) {
            await deleteImage(img.image_public_id);
          }
        }

        await imageRepo.delete({ product: { id } });

        const uploadResults = await Promise.all(
          files.map((file) => uploadImage(file.buffer, 'ecommerce/products')),
        );

        const images = uploadResults.map((result, index) =>
          imageRepo.create({
            product,
            url: result.url,
            image_public_id: result.publicId,
            is_main: index === 0,
          }),
        );

        await imageRepo.save(images);
      }

      return productRepo.findOne({
        where: { id },
        relations: ['images', 'category', 'variants'],
      });
    });
  }

  // admin update specific variant
  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
    userId: string,
  ) {
    // 1. Verify product ownership
    const product = await this.productRepo.findOne({
      where: { id: productId, user: { id: userId } },
    });

    if (!product) {
      throw new NotFoundException(
        'Product not found or access denied (ownership check failed)',
      );
    }

    // 2. Verify variant belongs to product
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, product: { id: productId } },
    });

    if (!variant) {
      throw new NotFoundException(
        'Variant not found or does not belong to this product',
      );
    }

    // 3. Update fields
    if (dto.color !== undefined) variant.color = dto.color;
    if (dto.size !== undefined) variant.size = dto.size;
    if (dto.price !== undefined) variant.price = dto.price;
    if (dto.stock_qty !== undefined) variant.stock_qty = dto.stock_qty;
    if (dto.sku !== undefined) variant.sku = dto.sku;

    return this.variantRepo.save(variant);
  }

  // admin delete specific variant
  async deleteVariant(productId: string, variantId: string, userId: string) {
    // 1. Verify product ownership
    const product = await this.productRepo.findOne({
      where: { id: productId, user: { id: userId } },
    });

    if (!product) {
      throw new NotFoundException(
        'Product not found or access denied (ownership check failed)',
      );
    }

    // 2. Verify variant belongs to product
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, product: { id: productId } },
    });

    if (!variant) {
      throw new NotFoundException(
        'Variant not found or does not belong to this product',
      );
    }

    await this.variantRepo.softDelete(variantId);

    return {
      message: 'Variant deleted successfully',
    };
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
    const { search, categories, sort } = query;

    page = page || 1;
    limit = limit || 10;

    skip = (page - 1) * limit;

    const qb = this.productRepo
      .createQueryBuilder('products')
      .leftJoinAndSelect('products.category', 'category')
      .leftJoinAndSelect('products.images', 'images')
      .leftJoinAndSelect('products.variants', 'variants')
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

    //  PRICE RANGE - Filter by variant prices
    // Temporarily disabled - needs proper subquery implementation
    // if (minPrice !== undefined) {
    //   qb.andWhere('variants.price >= :minPrice', { minPrice });
    // }

    // if (maxPrice !== undefined) {
    //   qb.andWhere('variants.price <= :maxPrice', { maxPrice });
    // }

    //  SORTING
    switch (sort) {
      case 'price_asc':
      case 'price_desc':
        // Price sorting requires complex subqueries with variants
        // For now, fall back to newest
        qb.orderBy('products.created_at', 'DESC');
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
      relations: ['category', 'images', 'variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from '../product/entity/product.entity';
import { CreateProductDto } from './dto/product/create-product.dto';
import { Category } from '../categories/entity/category.entity';
import { ProductImage } from './entity/product_images.entity';
import type { ProductQueryParams } from '../../shared/constants/types';
import { deleteImage, uploadImage } from '../../core/utils/cloudinary.helper';
import { ProductVariant } from './entity/product-variant.entity';
import { UpdateVariantDto } from './dto/variant/update-variant.dto';
import { BulkUpdateVariantItemDto } from './dto/variant/bulk-update-variant.dto';
import { UpdateProductDto } from './dto/product/update-product.dto';
import { CreateVariantDto } from './dto/variant/create-variant.dto';
import sharp from 'sharp';

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
  async updateProduct(
    id: string,
    dto: Partial<UpdateProductDto>,
    files: Express.Multer.File[],
    userId: string,
  ) {
    const product = await this.productRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['category', 'images', 'variants'],
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    let hasChanges = false;

    // Normalize
    if (dto.availability) {
      dto.availability = dto.availability.toUpperCase() as any;
    }

    const fieldsToUpdate: (keyof UpdateProductDto)[] = [
      'name',
      'description',
      'brand',
      'is_active',
      'availability',
    ];

    for (const field of fieldsToUpdate) {
      if (dto[field] !== undefined && dto[field] !== product[field]) {
        (product as any)[field] = dto[field];
        hasChanges = true;
      }
    }

    // Category diff
    if (dto.category_id && dto.category_id !== product.category?.id) {
      const category = await this.categoryRepo.findOneBy({
        id: dto.category_id,
      });
      if (!category) throw new BadRequestException('Invalid category');
      product.category = category;
      hasChanges = true;
    }

    // Image diff (intentional)
    const hasNewImages = files && files.length > 0;
    if (hasNewImages) hasChanges = true;

    //  NO CHANGE → EXIT
    if (!hasChanges) {
      return { message: 'No changes detected', product };
    }

    // Save product
    await this.productRepo.save(product);

    // Images (WAIT here)
    if (hasNewImages) {
      const imageRepo = this.productRepo.manager.getRepository(ProductImage);

      const oldImages = await imageRepo.find({
        where: { product: { id } },
      });

      await Promise.all(
        oldImages.map((img) =>
          img.image_public_id
            ? deleteImage(img.image_public_id)
            : Promise.resolve(),
        ),
      );

      await imageRepo.delete({ product: { id } });

      const uploads = await Promise.all(
        files.map(async (file) => {
          const compressed = await sharp(file.buffer)
            .resize(1200)
            .jpeg({ quality: 75 })
            .toBuffer();
          return uploadImage(compressed, 'ecommerce/products');
        }),
      );

      const mainIdx = Number(dto.main_image_index || 0);
      await imageRepo.save(
        uploads.map((u, i) =>
          imageRepo.create({
            product,
            url: u.url,
            image_public_id: u.publicId,
            is_main: i === mainIdx,
          }),
        ),
      );
    }

    // FETCH UPDATED PRODUCT
    const updatedProduct = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'images', 'variants'],
    });

    return {
      message: 'Product updated successfully',
      product: updatedProduct,
    };
  }

  //admin create variants
  async createVariant(
    productId: string,
    dto: CreateVariantDto,
    userId: string,
  ) {
    //  Check product ownership
    const product = await this.productRepo.findOne({
      where: { id: productId, user: { id: userId } },
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    //  Create variant
    const variant = this.variantRepo.create({
      product,
      ...dto,
    });

    //  Save variant
    await this.variantRepo.save(variant);

    return {
      message: 'Variant created successfully',
      variant,
    };
  }

  // admin update specific variant
  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
    userId: string,
  ) {
    //  Check product ownership
    const product = await this.productRepo.findOne({
      where: { id: productId, user: { id: userId } },
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    //  Fetch variant
    const variant = await this.variantRepo.findOne({
      where: { id: variantId, product: { id: productId } },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found for this product');
    }

    let hasChanges = false;

    //  Update ONLY if value is different
    if (dto.color !== undefined && dto.color !== variant.color) {
      variant.color = dto.color;
      hasChanges = true;
    }

    if (dto.size !== undefined && dto.size !== variant.size) {
      variant.size = dto.size;
      hasChanges = true;
    }

    if (dto.price !== undefined && dto.price !== variant.price) {
      variant.price = dto.price;
      hasChanges = true;
    }

    if (dto.stock_qty !== undefined && dto.stock_qty !== variant.stock_qty) {
      variant.stock_qty = dto.stock_qty;
      hasChanges = true;
    }

    if (dto.sku !== undefined && dto.sku !== variant.sku) {
      variant.sku = dto.sku;
      hasChanges = true;
    }

    //  NO CHANGE → RETURN EARLY (IMPORTANT)
    if (!hasChanges) {
      return {
        message: 'No changes detected',
        variant,
      };
    }

    // Save ONLY when changed
    const updatedVariant = await this.variantRepo.save(variant);

    return {
      message: 'Variant updated successfully',
      variant: updatedVariant,
    };
  }

  //bulk update variants
  async bulkUpdateVariants(
    productId: string,
    variants: BulkUpdateVariantItemDto[],
    userId: string,
  ) {
    return this.variantRepo.manager.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const variantRepo = manager.getRepository(ProductVariant);

      // Verify product ownership
      const product = await productRepo.findOne({
        where: { id: productId, user: { id: userId } },
      });

      if (!product) {
        throw new NotFoundException('Product not found or access denied');
      }

      // Fetch all existing variants
      const variantIds = variants.map((v) => v.id);

      const existingVariants = await variantRepo.find({
        where: {
          id: In(variantIds),
          product: { id: productId },
        },
      });

      if (existingVariants.length !== variants.length) {
        throw new BadRequestException(
          'Some variants do not belong to this product',
        );
      }

      // Map for fast lookup
      const variantMap = new Map(existingVariants.map((v) => [v.id, v]));

      let totalChanges = 0;

      // Diff check per variant
      for (const incoming of variants) {
        const existing = variantMap.get(incoming.id);
        if (!existing) continue;

        let hasChanges = false;

        if (incoming.color !== undefined && incoming.color !== existing.color) {
          existing.color = incoming.color;
          hasChanges = true;
        }

        if (incoming.size !== undefined && incoming.size !== existing.size) {
          existing.size = incoming.size;
          hasChanges = true;
        }

        if (incoming.price !== undefined && incoming.price !== existing.price) {
          existing.price = incoming.price;
          hasChanges = true;
        }

        if (
          incoming.stock_qty !== undefined &&
          incoming.stock_qty !== existing.stock_qty
        ) {
          existing.stock_qty = incoming.stock_qty;
          hasChanges = true;
        }

        if (incoming.sku !== undefined && incoming.sku !== existing.sku) {
          existing.sku = incoming.sku;
          hasChanges = true;
        }

        // Save ONLY if this variant changed
        if (hasChanges) {
          await variantRepo.save(existing);
          totalChanges++;
        }
      }

      //  NOTHING CHANGED → EXIT EARLY
      if (totalChanges === 0) {
        return {
          message: 'No changes detected',
          variants: existingVariants,
        };
      }

      // Return updated variants
      const updatedVariants = await variantRepo.find({
        where: { product: { id: productId } },
      });

      return {
        message: 'Variants updated successfully',
        updatedCount: totalChanges,
        variants: updatedVariants,
      };
    });
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

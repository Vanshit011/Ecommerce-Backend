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
import { GenerateMetadataDto } from './dto/product/generate-metadata.dto';
import { GeminiService } from '../ai/gemini.service';

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
    private readonly geminiService: GeminiService,
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

    return this.productRepo.manager.transaction(async (manager) => {
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
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const { search, categories, sort, minPrice, maxPrice } = query;

    const needsVariantJoin =
      minPrice !== undefined ||
      maxPrice !== undefined ||
      sort === 'price_asc' ||
      sort === 'price_desc';

    // ─── PHASE 1: Get all matching IDs (lightweight) ──────────────────
    const idQb = this.productRepo
      .createQueryBuilder('products')
      .where('products.is_active = :active', { active: true });

    // FIX: always include ORDER BY columns inside SELECT to satisfy PostgreSQL DISTINCT rule
    if (needsVariantJoin) {
      // Price sort/filter path — join variants, group by product id
      idQb.leftJoin('products.variants', 'variants');
      idQb.select([
        'products.id          AS id',
        'MIN(variants.price)  AS min_price',
        'products.created_at  AS created_at',
      ]);
      idQb.groupBy('products.id');
    } else {
      // Default path — no variants join needed
      idQb.select([
        'products.id          AS id',
        'products.created_at  AS created_at',
      ]);
    }

    // Full-text search using GIN index (replaces slow LIKE)
    if (search) {
      idQb.andWhere(
        `products.search_vector @@ plainto_tsquery('english', :search)`,
        { search },
      );
    }

    // Category filter — join only when needed
    if (categories?.length) {
      idQb
        .leftJoin('products.category', 'category')
        .andWhere('category.id IN (:...categories)', { categories });
    }

    // Price filter (variants already joined above via needsVariantJoin)
    if (minPrice !== undefined) {
      idQb.andWhere('variants.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      idQb.andWhere('variants.price <= :maxPrice', { maxPrice });
    }

    // Sorting — ORDER BY column must exist in SELECT (PostgreSQL rule)
    switch (sort) {
      case 'price_asc':
        idQb.orderBy('min_price', 'ASC');
        break;
      case 'price_desc':
        idQb.orderBy('min_price', 'DESC');
        break;
      case 'newest':
      default:
        idQb.orderBy('products.created_at', 'DESC');
        break;
    }

    // Fetch ALL matching IDs first (for accurate total count)
    // then slice in memory for pagination — avoids a second COUNT query
    const allIds = await idQb.getRawMany();
    const total = allIds.length;

    const pageIds = allIds.slice(skip, skip + limit);
    const ids: string[] = pageIds.map((r) => r.id);

    // Early return — no results found
    if (!ids.length) {
      return {
        data: [],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasNextPage: false,
          hasPrevPage: page > 1,
        },
      };
    }

    // ─── PHASE 2: Hydrate only the paginated IDs with full relations ───
    // JOINs here only run on `limit` rows (e.g. 10) — never the full table
    const hydrateQb = this.productRepo
      .createQueryBuilder('products')
      .leftJoinAndSelect('products.category', 'category')
      .leftJoinAndSelect('products.images', 'images')
      .leftJoinAndSelect('products.variants', 'variants')
      .where('products.id IN (:...ids)', { ids });

    // Re-apply sort on final result
    switch (sort) {
      case 'price_asc':
        hydrateQb.orderBy('variants.price', 'ASC');
        break;
      case 'price_desc':
        hydrateQb.orderBy('variants.price', 'DESC');
        break;
      case 'newest':
      default:
        hydrateQb.orderBy('products.created_at', 'DESC');
        break;
    }

    const products = await hydrateQb.getMany();

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
    // Use QueryBuilder for better control + select only needed fields
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.id = :id', { id })
      .andWhere('product.is_active = :isActive', { isActive: true })
      .cache(`product_${id}`, 30000)
      .getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async generateMetadata(dto: GenerateMetadataDto) {
    const { name, brand, category, base_description } = dto;

    if (!this.geminiService.isConfigured()) {
      return {
        name,
        description: `High-quality ${brand} ${name} in the ${category || 'general'} section.`,
        tags: [brand, category || 'product', 'new-arrival'],
      };
    }

    const prompt = `
      Product Name: ${name}
      Brand: ${brand}
      Category: ${category || 'General'}
      Current Description: ${base_description || 'None provided'}

      Generate a compelling, SEO-friendly product description (approx 150 words) and a list of 5-8 relevant tags.
      Take the Brand and Category into account for maximum relevance.
      Return the response strictly as a JSON object with keys "description" (string) and "tags" (array of strings).
    `;

    try {
      return await this.geminiService.generateJsonResponse<{
        description: string;
        tags: string[];
      }>(prompt);
    } catch (error) {
      console.error('Metadata Generation Error:', error);
      return {
        name,
        description: `Excellent ${name} by ${brand} in the ${category} category.`,
        tags: [brand, category || 'product'],
      };
    }
  }

  // recommendation logic for users (Rule-based: Improved relevance)
  async getRecommendations(id: string) {
    // Cache the entire recommendation result — same product = same result
    const cacheKey = `recommendations_${id}`;

    // 1. Fetch base product (cached)
    const product = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id })
      .andWhere('product.is_active = true')
      .cache(`product_${id}`, 60000)
      .getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // 2. Try AI path
    if (this.geminiService.isConfigured()) {
      try {
        // Fetch candidates WITHOUT heavy relations — only need id/name/category for AI prompt
        const candidates = await this.productRepo
          .createQueryBuilder('product')
          .select(['product.id', 'product.name'])
          .leftJoin('product.category', 'category')
          .addSelect('category.name')
          .where('product.is_active = true')
          .andWhere('product.id != :id', { id })
          .cache(`candidates_${product.category?.id}`, 60000) // cache by category
          .limit(20)
          .getMany();

        const candidateInfo = candidates.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category?.name,
        }));

        const prompt = `
        Target Product: ${product.name} (Category: ${product.category?.name})
        Candidates: ${JSON.stringify(candidateInfo)}
        Select the top 4 most relevant or complementary product IDs from the candidates.
        Return ONLY a JSON array of strings.
      `;

        const recommendedIds =
          await this.geminiService.generateJsonResponse<string[]>(prompt);

        if (Array.isArray(recommendedIds) && recommendedIds.length > 0) {
          return await this.productRepo
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.images', 'images')
            .leftJoinAndSelect('product.variants', 'variants')
            .where('product.id IN (:...ids)', { ids: recommendedIds })
            .andWhere('product.is_active = true')
            .cache(cacheKey, 60000)
            .getMany();
        }
      } catch (error) {
        console.warn('AI Recommendation failed, falling back to rules:', error);
      }
    }

    // 3. FALLBACK: Single optimized query instead of 5+ queries
    // Collect all candidates in ONE query using CASE for priority scoring
    const categoryId = product.category?.id;
    const brand = product.brand;
    const nameKeywords = product.name
      .split(' ')
      .filter((k) => k.length > 2)
      .slice(0, 3); // limit to 3 keywords max

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.variants', 'variants')
      .where('product.id != :id', { id })
      .andWhere('product.is_active = true');

    // Build priority score in a single SQL CASE expression
    let scoreExpr = `(
    CASE WHEN product.category_id = :categoryId AND product.brand = :brand THEN 40 ELSE 0 END
    + CASE WHEN product.category_id = :categoryId THEN 20 ELSE 0 END
    + CASE WHEN product.brand = :brand THEN 10 ELSE 0 END
  `;

    const params: Record<string, any> = { id, categoryId, brand };

    // Add keyword scoring
    nameKeywords.forEach((kw, i) => {
      scoreExpr += ` + CASE WHEN product.name ILIKE :kw${i} THEN 5 ELSE 0 END`;
      params[`kw${i}`] = `%${kw}%`;
    });

    scoreExpr += `)`;

    const results = await qb
      .addSelect(scoreExpr, 'score')
      .setParameters(params)
      .orderBy('score', 'DESC')
      .addOrderBy('product.created_at', 'DESC')
      .limit(4)
      .cache(cacheKey, 60000)
      .getMany();

    return results;
  }
}

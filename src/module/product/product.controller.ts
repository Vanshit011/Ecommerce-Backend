import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  Body,
  Put,
  Param,
  Delete,
  UploadedFiles,
  Query,
  UsePipes,
  UseFilters,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/product/create-product.dto';
import { UpdateVariantDto } from './dto/variant/update-variant.dto';
import { BulkUpdateVariantDto } from './dto/variant/bulk-update-variant.dto';
import { UpdateProductDto } from './dto/product/update-product.dto';
import { JoiValidationPipe } from '../../shared/pipes/joi-validation.pipe';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { UserRole } from '../../shared/constants/enum';
import { GetUser } from '../../core/decorator/get-user.decorator';
import { ProductQuery } from '../../core/decorator/product-query.decorator';
import { FileSizeExceptionFilter } from '../../shared/exception/file-size-exception.filter';
import type {
  AdminProductQueryParams,
  ProductQueryParams,
} from '../../shared/constants/types';
import {
  createProductSchema,
  updateProductSchema,
  updateVariantSchema,
  bulkUpdateVariantSchema,
  addVariantSchema,
} from './joi/product.validation';
import { CreateVariantDto } from './dto/variant/create-variant.dto';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  // ----------------ADMIN------------------//
  @UsePipes(new JoiValidationPipe(createProductSchema))
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseFilters(FileSizeExceptionFilter)
  @UseInterceptors(
    FilesInterceptor('images', 8, {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser('id') userId: string,
  ) {
    return this.productService.create(dto, files, userId);
  }

  //admin product
  @Get('/my-products')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findMyProducts(
    @GetUser('id') userId: string,
    @Query() query: AdminProductQueryParams,
  ) {
    return this.productService.findAllForAdmin(userId, query.page, query.limit);
  }

  //UPDATE PRODUCT
  @UsePipes(new JoiValidationPipe(updateProductSchema))
  @Put(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(
    FilesInterceptor('images', 8, {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only images allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser('id') userId: string,
  ) {
    return this.productService.updateProduct(id, dto, files, userId);
  }

  //Add product varients
  @UsePipes(new JoiValidationPipe(addVariantSchema))
  @Post(':productId/variants')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  addVariant(
    @Param('productId') productId: string,
    @Body() dto: CreateVariantDto,
    @GetUser('id') userId: string,
  ) {
    return this.productService.createVariant(productId, dto, userId);
  }

  // UPDATE SINGLE VARIANT
  @UsePipes(new JoiValidationPipe(updateVariantSchema))
  @Put(':productId/variants/:variantId')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  updateVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
    @GetUser('id') userId: string,
  ) {
    return this.productService.updateVariant(productId, variantId, dto, userId);
  }

  // BULK UPDATE VARIANTS
  @UsePipes(new JoiValidationPipe(bulkUpdateVariantSchema))
  @Patch(':productId/variants')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  bulkUpdateVariants(
    @Param('productId') productId: string,
    @Body() dto: BulkUpdateVariantDto,
    @GetUser('id') userId: string,
  ) {
    return this.productService.bulkUpdateVariants(
      productId,
      dto.variants,
      userId,
    );
  }

  //admin delete specific variant
  @Delete(':productId/variants/:variantId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @GetUser('id') userId: string,
  ) {
    return this.productService.deleteVariant(productId, variantId, userId);
  }

  //admin delete product
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.productService.delete(id, userId);
  }

  // ----------------USER------------------//

  //user Prodcuts with pagination
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300) // 5 minutes
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  findAll(@ProductQuery() query: ProductQueryParams) {
    return this.productService.findAllForUsers(query);
  }

  // get single product details for users
  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  getProductDetails(@Param('id') id: string) {
    return this.productService.getProductDetails(id);
  }
}

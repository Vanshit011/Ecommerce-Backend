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
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
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
} from './joi/product.validation';

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

  //admin update product
  @UsePipes(new JoiValidationPipe(updateProductSchema))
  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FilesInterceptor('images', 8, {
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser('id') userId: string,
  ) {
    return this.productService.update(id, dto, files, userId);
  }

  //admin update specific variant
  @UsePipes(new JoiValidationPipe(updateVariantSchema))
  @Put(':productId/:variantId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
    @GetUser('id') userId: string,
  ) {
    return this.productService.updateVariant(productId, variantId, dto, userId);
  }

  //admin delete specific variant
  @Delete(':productId/:variantId')
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

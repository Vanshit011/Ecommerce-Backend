import {
  Controller,
  Post,
  Get,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { UserRole } from '../../shared/constants/enum';
import { cloudinaryStorage } from '../../core/utils/cloudinary-storage';
import { GetUser } from '../../core/decorator/get-user.decorator';
import { ProductQuery } from 'src/core/decorator/product-query.decorator';
import type { ProductQueryParams } from '../../shared/constants/types';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  // admin only
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: cloudinaryStorage,
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
      },
    }),
  )
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ) {
    const imageUrl = file.path;
    const publicId = file.filename;

    return this.productService.create(dto, imageUrl, publicId, userId);
  }

  //admin product
  @Get('/my-products')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findMyProducts(@GetUser('id') userId: string) {
    return this.productService.findAllForAdmin(userId);
  }

  //user Prodcuts with pagination
  @Get()
  findAll(@ProductQuery() query: ProductQueryParams) {
    return this.productService.findAllForUsers(query);
  }

  //update product admin only
  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProductDto>,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') userId: string,
  ) {
    return this.productService.update(id, dto, userId, file);
  }

  //delete product admin only
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.productService.delete(id, userId);
  }

  // get single product details for users
  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  getProductDetails(@Param('id') id: string) {
    return this.productService.getProductDetails(id);
  }

  //get product images
  @Get(':id/images')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  getProductImages(@Param('id') id: string) {
    return this.productService.getProductDetails(id);
  }
}

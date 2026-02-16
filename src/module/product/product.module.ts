import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AuthModule } from '../auth/auth.module';
import { Category } from '../categories/entity/category.entity';
import { ProductImage } from './entity/product_images.entity';
import { ProductVariant } from './entity/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage, Category, ProductVariant]),
    AuthModule,
    Category,
  ],
  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AuthModule } from '../auth/auth.module';
import { Product } from '../product/entity/product.entity';
import { ProductVariant } from '../product/entity/product-variant.entity';
import { CartItem } from './entity/cart.entity';
import { CouponModule } from '../coupon/coupon.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, CartItem, ProductVariant]),
    AuthModule,
    CouponModule,
  ],
  providers: [CartService],
  controllers: [CartController],
  exports: [CartService],
})
export class CartModule {}

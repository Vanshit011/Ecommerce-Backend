import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AuthModule } from '../auth/auth.module';
import { Product } from '../product/entity/product.entity';
import { CartItem } from './entity/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, CartItem]), AuthModule],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}

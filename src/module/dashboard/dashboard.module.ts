import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../order/entity/order.entity';
import { OrderItem } from '../order/entity/order-item.entity';
import { User } from '../user/entity/user.entity';
import { Product } from '../product/entity/product.entity';
import { AuthModule } from '../auth/auth.module';
import { Category } from '../categories/entity/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, User, Product, Category]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

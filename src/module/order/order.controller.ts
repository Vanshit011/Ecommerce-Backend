import {
  UseGuards,
  Controller,
  Post,
  Param,
  Get,
  Query,
  Patch,
  Body,
} from '@nestjs/common';
import { GetUser } from './../../core/decorator/get-user.decorator';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { OrderService } from './order.service';
import { Roles } from '../../core/decorator/roles.decorator';
import { Status, UserRole } from '../../shared/constants/enum';
import { AdminOrderQueryParams } from '../../shared/constants/types';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  //create user order
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  create(@GetUser('id') userId: string) {
    return this.orderService.createFromCart(userId);
  }
  //user all order
  @Get('my')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  getMyOrders(@GetUser('id') userId: string) {
    return this.orderService.getUserOrders(userId);
  }
  //user single order enter id
  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  getOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.orderService.getOrderById(id, userId);
  }

  //user cancel own order
  @Patch(':id/cancel')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  async cancelOrder(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.orderService.cancelOrderByUser(id, userId);
  }

  //admin side

  @Get('admin/orders')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async adminOrders(@GetUser('id') userId: string, @Query() query: any) {
    const params: AdminOrderQueryParams = {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      status: query.status?.split(','),
    };

    return this.orderService.getOrdersForAdmin(userId, params);
  }

  @Patch(':id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateOrderStatus(
    @GetUser('id') userId: string,
    @Param('id') orderId: string,
    @Body('status') status: Status,
  ) {
    return this.orderService.updateOrderStatusByAdmin(orderId, userId, status);
  }
}

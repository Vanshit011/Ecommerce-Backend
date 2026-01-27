import { UseGuards, Controller, Post, Param, Get } from '@nestjs/common';
import { GetUser } from './../../core/decorator/get-user.decorator';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { OrderService } from './order.service';
import { Roles } from '../../core/decorator/roles.decorator';
import { UserRole } from '../../shared/constants/enum';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  create(@GetUser('id') userId: string) {
    return this.orderService.createFromCart(userId);
  }

  @Post(':id/pay')
  pay(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.orderService.payOrder(id, userId);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  getOne(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.orderService.getOrderById(id, userId);
  }
}

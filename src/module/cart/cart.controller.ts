import { Delete, Get, Param, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common/decorators/core/controller.decorator';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { UserRole } from '../../shared/constants/enum';
import { Roles } from '../../core/decorator/roles.decorator';
import { CartService } from './cart.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { GetUser } from '../../core/decorator/get-user.decorator';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // add cart
  @Post(':productId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  add(@Param('productId') productId: string, @GetUser('id') userId: string) {
    return this.cartService.addToCart(userId, productId);
  }

  // get cart
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  getCart(@GetUser('id') userId: string) {
    return this.cartService.getMyCart(userId);
  }

  // update qty
  @Post(':productId/:qty')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  updateQty(
    @Param('productId') productId: string,
    @Param('qty') qty: number,
    @GetUser('id') userId: string,
  ) {
    return this.cartService.updateCartItemQuantity(userId, productId, qty);
  }

  // delete
  @Delete()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  clear(@GetUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}

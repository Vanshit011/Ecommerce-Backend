import {
  BadRequestException,
  Body,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Controller } from '@nestjs/common/decorators/core/controller.decorator';
import { UseGuards } from '@nestjs/common/decorators/core/use-guards.decorator';
import { UserRole } from '../../shared/constants/enum';
import { Roles } from '../../core/decorator/roles.decorator';
import { CartService } from './cart.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { GetUser } from '../../core/decorator/get-user.decorator';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { JoiValidationPipe } from '../../shared/pipes/joi-validation.pipe';
import { addToCartSchema, updateQtySchema } from './joi/cart.validation';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // add cart
  @Post(':productId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  add(
    @Param('productId') productId: string,
    @GetUser('id') userId: string,
    @Body(new JoiValidationPipe(addToCartSchema))
    body: AddToCartDto = {} as AddToCartDto,
  ) {
    return this.cartService.addToCart(
      userId,
      productId,
      body.quantity,
      body.variant_id,
    );
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
    @Query('variantId') variantId: string,
    @GetUser('id') userId: string,
  ) {
    const { error } = updateQtySchema.validate(qty);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return this.cartService.updateCartItemQuantity(
      userId,
      productId,
      qty,
      variantId,
    );
  }

  // delete specific item
  @Delete(':productId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  removeItem(
    @Param('productId') productId: string,
    @Query('variantId') variantId: string,
    @GetUser('id') userId: string,
  ) {
    return this.cartService.removeCartItem(userId, productId, variantId);
  }

  // delete ALL
  @Delete()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  clear(@GetUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}

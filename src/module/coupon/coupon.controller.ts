import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Roles } from '../../core/decorator/roles.decorator';
import { UserRole } from '../../shared/constants/enum';
import { JoiValidationPipe } from '../../shared/pipes/joi-validation.pipe';
import { GetUser } from '../../core/decorator/get-user.decorator';
import { createCouponDto } from './dto/create-coupon.dto';
import { updateCouponDto } from './dto/update-coupon.dto';
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from './joi/coupon.validation';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @UsePipes(new JoiValidationPipe(createCouponSchema))
  async create(
    @GetUser('id') userId: string,
    @Body() createCouponDto: createCouponDto,
  ) {
    return this.couponService.createCoupon(userId, createCouponDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.USER)
  @UseGuards(AuthGuard, RolesGuard)
  async findAll(
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.couponService.findAll(userId, role);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @UsePipes(new JoiValidationPipe(updateCouponSchema))
  async update(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @Body() updateCouponDto: updateCouponDto,
  ) {
    return this.couponService.updateCoupon(id, userId, updateCouponDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async remove(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.couponService.removeCoupon(id, userId);
  }

  @Post('validate')
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(validateCouponSchema))
  async validate(
    @Body() body: { code: string; cartTotal: number; product_ids?: string[] },
  ) {
    const result = await this.couponService.validateCoupon(
      body.code,
      body.cartTotal,
      body.product_ids,
    );
    return {
      discountAmount: result.discountAmount,
      code: result.coupon.code,
    };
  }
}

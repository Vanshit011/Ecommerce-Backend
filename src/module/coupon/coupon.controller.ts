import {
  Controller,
  Get,
  Post,
  Body,
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
import {
  createCouponSchema,
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
    @GetUser() userId: string,
    @Body() createCouponDto: createCouponDto,
  ) {
    return this.couponService.createCoupon(userId, createCouponDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async findAll() {
    return this.couponService.findAll();
  }

  @Post('validate')
  @UseGuards(AuthGuard)
  @UsePipes(new JoiValidationPipe(validateCouponSchema))
  async validate(@Body() body: { code: string; cartTotal: number }) {
    const result = await this.couponService.validateCoupon(
      body.code,
      body.cartTotal,
    );
    return {
      discountAmount: result.discountAmount,
      code: result.coupon.code,
    };
  }
}

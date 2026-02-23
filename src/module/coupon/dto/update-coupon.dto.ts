import { PartialType } from '@nestjs/swagger';
import { createCouponDto } from './create-coupon.dto';

export class updateCouponDto extends PartialType(createCouponDto) {}

import { ApiProperty } from '@nestjs/swagger';
import { DiscountType } from '../../../shared/constants/enum';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsDate,
  IsBoolean,
} from 'class-validator';

export class createCouponDto {
  @ApiProperty({ example: 'COUPON123' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({ example: DiscountType.PERCENTAGE })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  discount_value: number;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  min_order_amount: number;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  max_discount_amount: number;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  usage_limit: number;

  @ApiProperty({ example: '2022-01-01' })
  @IsNotEmpty()
  @IsDate()
  start_date: Date;

  @ApiProperty({ example: '2022-01-01' })
  @IsNotEmpty()
  @IsDate()
  end_date: Date;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  is_active: boolean;
}

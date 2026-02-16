import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ProductStatus } from '../../../shared/constants/enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';
import { CreateVariantDto } from './create-variant.dto';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  sale_price?: number;

  @IsOptional()
  sku?: string;

  @IsOptional()
  brand?: string;

  @IsOptional()
  @IsInt()
  stock_qty?: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  availability: ProductStatus;

  @IsNotEmpty()
  category_id: string;

  @IsOptional()
  tags?: string[];

  @IsOptional()
  specifications?: Record<string, any>;

  @IsOptional()
  weight?: number;

  @IsOptional()
  @IsInt()
  main_image_index?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
  @ApiPropertyOptional({
    type: [CreateVariantDto],
    description: 'List of product variants',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVariantDto)
  variants?: CreateVariantDto[];
}

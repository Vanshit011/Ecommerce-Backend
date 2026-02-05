import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  IsInt,
  IsBoolean,
} from 'class-validator';
import { ProductStatus } from '../../../shared/constants/enum';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  sale_price?: number;

  @IsNotEmpty()
  sku: string;

  @IsOptional()
  brand?: string;

  @IsOptional()
  @IsInt()
  stock_qty: number;

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
}

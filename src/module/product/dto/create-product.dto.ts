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
  salePrice?: number;

  @IsNotEmpty()
  sku: string;

  @IsOptional()
  brand?: string;

  @IsOptional()
  @IsInt()
  stockQty: number;

  @IsOptional()
  @IsEnum(ProductStatus)
  availability: ProductStatus;

  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  sizes?: string[];

  @IsOptional()
  colors?: string[];

  @IsOptional()
  tags?: string[];

  @IsOptional()
  specifications?: Record<string, any>;

  @IsOptional()
  weight?: number;

  @IsOptional()
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @IsOptional()
  metaTitle?: string;

  @IsOptional()
  metaDescription?: string;

  @IsOptional()
  @IsInt()
  mainImageIndex?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVariantDto {
  @IsOptional()
  @IsString()
  id?: string;
  @ApiPropertyOptional({ example: 'Red', description: 'Variant color' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'L', description: 'Variant size' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ example: 25.5, description: 'Variant price' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, description: 'Variant stock quantity' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  stock_qty: number;

  @ApiProperty({ example: 'SKU-12345', description: 'Variant SKU' })
  @IsNotEmpty()
  @IsString()
  sku: string;
}

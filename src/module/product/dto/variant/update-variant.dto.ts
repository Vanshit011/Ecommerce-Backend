import { IsNumber, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVariantDto {
  @ApiPropertyOptional({ example: 'Red', description: 'Variant color' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'L', description: 'Variant size' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ example: 25.5, description: 'Variant price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: 100, description: 'Variant stock quantity' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock_qty?: number;

  @ApiPropertyOptional({ example: 'SKU-12345', description: 'Variant SKU' })
  @IsOptional()
  @IsString()
  sku?: string;
}

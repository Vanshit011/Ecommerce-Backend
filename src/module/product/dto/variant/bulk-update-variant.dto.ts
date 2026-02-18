import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkUpdateVariantItemDto {
  @ApiProperty({ example: 'uuid-v4', description: 'Variant ID' })
  @IsUUID()
  id: string;

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

export class BulkUpdateVariantDto {
  @ApiProperty({ type: [BulkUpdateVariantItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateVariantItemDto)
  variants: BulkUpdateVariantItemDto[];
}

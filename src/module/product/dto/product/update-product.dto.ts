import { IsOptional, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Product Name', description: 'Product name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Product Description',
    description: 'Product description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Brand Name', description: 'Product brand' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ example: true, description: 'Product status' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({
    example: 'Available',
    description: 'Product availability',
  })
  @IsOptional()
  @IsString()
  availability?: string;

  @ApiPropertyOptional({
    example: 'Category ID',
    description: 'Product category ID',
  })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({ example: 0, description: 'Index of main image' })
  @IsOptional()
  @IsInt()
  @Min(0)
  main_image_index?: number;
}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateMetadataDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  base_description?: string;
}

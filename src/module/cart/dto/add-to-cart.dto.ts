import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class AddToCartDto {
  @IsOptional()
  @IsString()
  size: string;

  @IsOptional()
  @IsString()
  color: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity: number;
}

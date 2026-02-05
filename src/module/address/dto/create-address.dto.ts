import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  full_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  address_line_1: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  address_line_2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postal_code?: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

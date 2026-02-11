import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsBoolean,
} from 'class-validator';

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
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsOptional()
  @IsBoolean()
  is_default?: boolean;
}

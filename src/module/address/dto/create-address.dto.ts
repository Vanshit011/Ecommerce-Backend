import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  addressline1: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  addressline2?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalcode?: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

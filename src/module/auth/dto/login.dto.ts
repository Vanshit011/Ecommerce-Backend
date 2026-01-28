import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsNumberString()
  mobile?: string;

  @IsOptional()
  @IsNumberString()
  otp?: string;
}

import { IsEmail, IsNumber, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumber()
  @MinLength(6)
  mobile: string;
}

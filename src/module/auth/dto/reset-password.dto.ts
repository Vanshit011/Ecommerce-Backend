import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/)
  mobile?: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @Length(6, 32, { message: 'Password must be 6-32 characters' })
  newPassword: string;
}

import { IsEmail, IsOptional, Matches } from 'class-validator';

export class ForgotPasswordDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Matches(/^[6-9]\d{9}$/, { message: 'Invalid mobile number' })
  mobile?: string;
}
      
import { IsNotEmpty } from 'class-validator';

export class VerifyForgotOtpDto {
  @IsNotEmpty()
  otp: string;
}

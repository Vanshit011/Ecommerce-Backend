import { IsNotEmpty, IsOptional } from "class-validator";

export class VerifyForgotOtpDto {
    @IsNotEmpty()
    otp: string;
}

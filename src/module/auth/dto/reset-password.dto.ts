import { IsString, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @Length(6, 32, { message: 'Password must be 6-32 characters' })
  newPassword: string;
}

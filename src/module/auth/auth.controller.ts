import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { RolesGuard } from 'src/core/guard/roles.guard';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.mobile);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.sendForgotPasswordOtp(dto);
    return {
      message: 'OTP send successfully'
    }
  }


  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return {
      message: 'Password has been successfully updated',
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = req.user.id;
    await this.authService.logout(userId);

    return {
      message: 'Logged out successfully',
    };
  }


  @UseGuards(AuthGuard, RolesGuard)
  @Get('dashboard')
  getHello(): string {
    return 'Hello World!';
  }
}

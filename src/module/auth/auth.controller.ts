import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { VerifyForgotOtpDto } from './dto/VerifyForgotOtpDto.dto';
import { JoiValidationPipe } from '../../shared/pipes/joi-validation.pipe';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyForgotOtpSchema,
  resetPasswordSchema,
} from './joi/auth.validation';
import { UserRole } from '../../shared/constants/enum';
import type { RequestWithUser } from '../../shared/constants/types';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register/admin')
  @UsePipes(new JoiValidationPipe(registerSchema))
  registerAdmin(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.name,
      dto.email,
      dto.password,
      dto.mobile,
      UserRole.ADMIN,
    );
  }

  @Post('register/user')
  @UsePipes(new JoiValidationPipe(registerSchema))
  registerUser(@Body() dto: RegisterDto) {
    return this.authService.register(
      dto.name,
      dto.email,
      dto.password,
      dto.mobile,
      UserRole.USER,
    );
  }

  @Post('login')
  @UsePipes(new JoiValidationPipe(loginSchema))
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.mobile, dto.otp);
  }

  @Post('forgot-password')
  @UsePipes(new JoiValidationPipe(forgotPasswordSchema))
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.sendForgotPasswordOtp(dto);
    return {
      message: 'OTP send successfully',
    };
  }

  @Post('verify-forgot-otp')
  @UsePipes(new JoiValidationPipe(verifyForgotOtpSchema))
  async verifyForgotOtp(@Body() dto: VerifyForgotOtpDto) {
    await this.authService.verifyForgotPasswordOtp(dto);

    return {
      message: 'OTP verified successfully',
    };
  }

  @Post('reset-password')
  @UsePipes(new JoiValidationPipe(resetPasswordSchema))
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return {
      message: 'Password has been successfully updated',
    };
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Post('logout')
  async logout(@Req() req: RequestWithUser) {
    if (!req.user) {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = req.user.id;
    await this.authService.logout(userId);

    return {
      message: 'Logged out successfully',
    };
  }

  // --- SOCIAL LOGIN ---

  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  async googleAuth() {
    // Redirects to Google
  }

  @Get('google/callback')
  @UseGuards(PassportAuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.validateSocialUser(req.user);

    const frontendUrl =
      this.configService.get<string>('ECOMMERCE_FRONTEND') || '';

    return res.redirect(
      `${frontendUrl}/login?token=${result.accessToken}&role=${result.user.role}`,
    );
  }

  @Get('github')
  @UseGuards(PassportAuthGuard('github'))
  async githubAuth() {
    // Redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(PassportAuthGuard('github'))
  async githubAuthRedirect(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.validateSocialUser(req.user);

    const frontendUrl =
      this.configService.get<string>('ECOMMERCE_FRONTEND') || '';

    return res.redirect(
      `${frontendUrl}/login?token=${result.accessToken}&role=${result.user.role}`,
    );
  }
}

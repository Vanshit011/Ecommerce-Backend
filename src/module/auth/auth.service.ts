import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { PasswordResetOtp } from './entity/password-reset-otp.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
// import { UserRole } from 'src/shared/constants/enum';
import { TokenService } from './token.service';
import { OtpType } from 'src/shared/constants/enum';
import { Token } from './entity/auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,

    @InjectRepository(PasswordResetOtp)
    private readonly otpRepo: Repository<PasswordResetOtp>,
    @InjectRepository(Token)
    private readonly tokenRepo: Repository<Token>
  ) { }

  async register(email: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      email,
      password: hashedPassword,
    });

    this.mailService.sendWelcomeEmail(user.email, user.email).catch(console.error);

    return { success: true };
  }


  async login(email: string, password: string) {
    if (!email || !password) {
      throw new UnauthorizedException('Email and password required');
    }

    const user = await this.usersService.findByEmail(email);

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      success: true,
      ...(await this.tokenService.generate(user.id, user.role)),
    };
  }

  async logout(userId: string) {
    const token = await this.tokenRepo.findOne({
      where: { user: { id: userId } },
    });

    if (!token) return;

    token.logout_at = new Date();
    await this.tokenRepo.save(token);
  }

  async sendForgotPasswordOtp(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const existingOtp = await this.otpRepo.findOne({
      where: {
        user: { id: user.id },
        type: OtpType.FORGOT_PASSWORD,
      },
    });

    if (existingOtp) {
      await this.otpRepo.update(
        { id: existingOtp.id },
        {
          otp,
          expires_at: expiresAt,
          is_verified: false,
        },
      );
    } else {
      await this.otpRepo.insert({
        email,
        otp,
        expires_at: expiresAt,
        user: { id: user.id },
        type: OtpType.FORGOT_PASSWORD,
      });
    }

    // 🔥 Send email async (DO NOT await)
    this.mailService.sendOtpEmail(email, otp).catch(err => {
      console.error('Email send failed:', err);
    });
  }


  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { email, otp, newPassword } = dto;

    const otpRecord = await this.otpRepo.findOne({
      where: {
        email,
        type: OtpType.FORGOT_PASSWORD,
        is_verified: false,
      },
      relations: ['user'],
      order: { created_at: 'DESC' }, //  latest OTP
    });

    if (!otpRecord) {
      throw new BadRequestException('OTP not found or already used');
    }

    //  Normalize OTP comparison
    if (otpRecord.otp !== String(otp).trim()) {
      throw new BadRequestException('Invalid OTP');
    }

    //  Expiry check
    if (otpRecord.expires_at < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //  Update password
    otpRecord.user.password = hashedPassword;
    await this.usersService.save(otpRecord.user);

    // Mark OTP as verified
    await this.otpRepo.update(
      { id: otpRecord.id },
      { is_verified: true },
    );
  }

}
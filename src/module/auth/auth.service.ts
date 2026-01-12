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
import { ForgotPasswordDto } from './dto/forgot-password.dto';

const STATIC_MOBILE_OTP = '123456';

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

  async register(email: string, password: string, mobile: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    if (!mobile) {
      throw new BadRequestException('Enter mobile number')
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      email,
      mobile,
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

  async sendForgotPasswordOtp(dto: ForgotPasswordDto): Promise<void> {
    const { email, mobile } = dto;

    if (!email && !mobile) {
      throw new BadRequestException('Email or mobile is required');
    }

    let user;

    if (email) {
      user = await this.usersService.findByEmail(email);
    } else if (mobile) {
      user = await this.usersService.findByMobile(mobile);
    }

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // OTP LOGIC
    const otp = mobile
      ? STATIC_MOBILE_OTP
      : Math.floor(100000 + Math.random() * 900000).toString();

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
        otp,
        expires_at: expiresAt,
        user: { id: user.id },
        type: OtpType.FORGOT_PASSWORD,
      });
    }

    // 🔥 SEND OTP
    if (email) {
      this.mailService.sendOtpEmail(user.email, otp).catch(console.error);
    } else {
      console.log(`STATIC OTP ${otp} sent to mobile ${user.mobile}`);
    }
  }



  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { otp, newPassword } = dto;

    const otpRecord = await this.otpRepo.findOne({
      where: {
        otp: String(otp).trim(),
        type: OtpType.FORGOT_PASSWORD,
        is_verified: false,
      },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (otpRecord.expires_at < new Date()) {
      throw new BadRequestException('OTP expired');
    }

    const user = otpRecord.user;

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersService.save(user);

    // mark OTP as used
    await this.otpRepo.update(
      { id: otpRecord.id },
      { is_verified: true },
    );
  }

}
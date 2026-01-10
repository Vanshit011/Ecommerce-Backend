import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entity/auth.entity';
import { MailService } from '../mail/mail.service';
import { PasswordResetOtp } from './entity/password-reset-otp.entity';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole } from '../user/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    @InjectRepository(PasswordResetOtp)
    private readonly otpRepo: Repository<PasswordResetOtp>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
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

    this.mailService
      .sendWelcomeEmail(user.email, user.email)
      .catch((err) => {
        console.error('Welcome email failed:', err);
      });

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
      ...(await this.generateToken(user.id)),
    };
  }



  private async generateToken(userId: string) {
    const payload = { sub: userId, role: UserRole};
    const token = this.jwtService.sign(payload);

    const existingToken = await this.tokenRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (existingToken) {
      existingToken.token = token;
      await this.tokenRepository.save(existingToken);
    } else {
      await this.tokenRepository.save({
        token,
        user: { id: userId },
      });
    }

    return {
      accessToken: token,
    };
  }

 async sendForgotPasswordOtp(email: string): Promise<void> {
  const user = await this.usersService.findByEmail(email);
  if (!user) {
    throw new BadRequestException('User not found');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  const existingOtp = await this.otpRepo.findOne({
    where: { email },
  });

  if (existingOtp) {
    existingOtp.otp = otp;
    existingOtp.expiresAt = expiresAt;
    await this.otpRepo.save(existingOtp);
  } else {
    await this.otpRepo.save({
      email,
      otp,
      expiresAt,
    });
  }

  this.mailService.sendOtpEmail(email, otp).catch(err => {
    console.error('Failed to send OTP email', err);
  });
}



  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { email, otp, newPassword } = dto;

    let userEmail = email;

    // OTP for the email
    const otpRecord = await this.otpRepo.findOne({ where: { email: userEmail, otp } });
    if (!otpRecord) throw new BadRequestException('Invalid OTP');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await this.usersService.findByEmail(userEmail);
    if (!user) throw new BadRequestException('User not found');

    user.password = hashedPassword;
    await this.usersService.save(user);
  }

}
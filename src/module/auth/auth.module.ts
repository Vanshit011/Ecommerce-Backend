import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config'; // Added ConfigModule just in case

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { Token } from './entity/auth.entity';
import { UsersModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { PasswordResetOtp } from './entity/password-reset-otp.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Token, PasswordResetOtp]),
    UsersModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [ConfigService], // Removed 'const'
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
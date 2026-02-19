import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../user/user.module';
import { MailModule } from '../mail/mail.module';
import { Otp } from './entity/otp.entity';
import { TokenModule } from '../token/token.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp]),
    UsersModule,
    MailModule,
    TokenModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, GithubStrategy],
  exports: [AuthService, TokenModule],
})
export class AuthModule {}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entity/token.entity';
import { JwtPayload } from '../../shared/constants/types';
import { UserRole } from '../user/entity/user.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Token)
    private readonly tokenRepo: Repository<Token>,
  ) {}

  /**
   * Generate or reuse existing valid token for a user
   */
  async generate(userId: string, role: UserRole) {
    const now = new Date();

    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 1);

    const existingToken = await this.tokenRepo.findOne({
      where: { user: { id: userId } },
    });

    // Token exists AND not expired → reuse same token
    if (
      existingToken &&
      existingToken.expires_at &&
      existingToken.expires_at > now
    ) {
      await this.tokenRepo.update(
        { id: existingToken.id },
        {
          login_at: now,
          logout_at: null,
          expires_at: newExpiresAt, // refresh expiry
        },
      );

      return { accessToken: existingToken.token };
    }

    // Token expired OR not exists → generate new token
    const payload: JwtPayload = { sub: userId, role: role };
    const newToken = this.jwtService.sign(payload);

    if (existingToken) {
      // Token expired → update same row
      await this.tokenRepo.update(
        { id: existingToken.id },
        {
          token: newToken,
          login_at: now,
          logout_at: null,
          expires_at: newExpiresAt,
        },
      );
    } else {
      // First login → create row
      await this.tokenRepo.insert({
        token: newToken,
        login_at: now,
        logout_at: null,
        expires_at: newExpiresAt,
        user: { id: userId },
      });
    }

    return { accessToken: newToken };
  }

  /**
   * Validate JWT token and return payload
   */
  validateToken(token: string): JwtPayload | null {
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return payload;
    } catch {
      return null;
    }
  }

  /**
   * Revoke token by marking logout time
   */
  async revokeToken(userId: string): Promise<void> {
    const token = await this.tokenRepo.findOne({
      where: { user: { id: userId } },
    });

    const logoutTime = new Date();
    if (token) {
      await this.tokenRepo.update({ id: token.id }, { logout_at: logoutTime });
    }

    return;
  }

  /**
   * Find token by user ID
   */
  async findTokenByUserId(userId: string): Promise<Token | null> {
    return this.tokenRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  /**
   * Cleanup expired tokens (can be run as a cron job)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.tokenRepo
      .createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now })
      .execute();
  }
}

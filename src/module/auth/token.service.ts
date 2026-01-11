import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entity/auth.entity';
import { JwtPayload } from 'src/shared/constants/types';
import { UserRole } from 'src/module/user/entity/user.entity';

@Injectable()
export class TokenService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(Token)
        private readonly tokenRepo: Repository<Token>,
    ) { }

    async generate(userId: string, role: UserRole = UserRole.USER) {
        const now = new Date();

        const newExpiresAt = new Date();
        newExpiresAt.setHours(newExpiresAt.getHours() + 1);

        const existingToken = await this.tokenRepo.findOne({
            where: { user: { id: userId } },
        });

        //  Token exists AND not expired  reuse same token
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

        // Token expired OR not exists  generate new token
        const payload: JwtPayload = { sub: userId, role };
        const newToken = this.jwtService.sign(payload);

        if (existingToken) {
            // Token expired update same row
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
            // First login create row
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

}



import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { UserRole } from '../../shared/constants/enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            sendForgotPasswordOtp: jest.fn(),
            verifyForgotPasswordOtp: jest.fn(),
            resetPassword: jest.fn(),
            logout: jest.fn(),
            validateSocialUser: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerAdmin', () => {
    it('should call authService.register with ADMIN role', async () => {
      const dto = {
        name: 'Admin',
        email: 'admin@test.com',
        password: 'pass123',
        mobile: '1234567890',
      };
      const expected = { id: 'user-1', ...dto, role: UserRole.ADMIN };
      (authService.register as jest.Mock).mockResolvedValue(expected);

      const result = await controller.registerAdmin(dto);

      expect(authService.register).toHaveBeenCalledWith(
        dto.name,
        dto.email,
        dto.password,
        dto.mobile,
        UserRole.ADMIN,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('registerUser', () => {
    it('should call authService.register with USER role', async () => {
      const dto = {
        name: 'User',
        email: 'user@test.com',
        password: 'pass123',
        mobile: '1234567890',
      };
      const expected = { id: 'user-2', ...dto, role: UserRole.USER };
      (authService.register as jest.Mock).mockResolvedValue(expected);

      const result = await controller.registerUser(dto);

      expect(authService.register).toHaveBeenCalledWith(
        dto.name,
        dto.email,
        dto.password,
        dto.mobile,
        UserRole.USER,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should call authService.login with credentials', async () => {
      const dto = {
        email: 'user@test.com',
        password: 'pass123',
        mobile: undefined,
        otp: undefined,
      };
      const expected = { accessToken: 'token123' };
      (authService.login as jest.Mock).mockResolvedValue(expected);

      const result = await controller.login(dto as any);

      expect(authService.login).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        dto.mobile,
        dto.otp,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.sendForgotPasswordOtp and return success message', async () => {
      const dto = { email: 'user@test.com' } as any;
      (authService.sendForgotPasswordOtp as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await controller.forgotPassword(dto);

      expect(authService.sendForgotPasswordOtp).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ message: 'OTP send successfully' });
    });
  });

  describe('verifyForgotOtp', () => {
    it('should call authService.verifyForgotPasswordOtp and return success message', async () => {
      const dto = { email: 'user@test.com', otp: '123456' } as any;
      (authService.verifyForgotPasswordOtp as jest.Mock).mockResolvedValue(
        undefined,
      );

      const result = await controller.verifyForgotOtp(dto);

      expect(authService.verifyForgotPasswordOtp).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ message: 'OTP verified successfully' });
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword and return success message', async () => {
      const dto = {
        email: 'user@test.com',
        password: 'newPass123',
      } as any;
      (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.resetPassword(dto);

      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        message: 'Password has been successfully updated',
      });
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return success message', async () => {
      const req = { user: { id: 'user-1' } } as any;
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const result = await controller.logout(req);

      expect(authService.logout).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should throw UnauthorizedException if req.user is missing', async () => {
      const req = { user: null } as any;

      await expect(controller.logout(req)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('googleAuth', () => {
    it('should be defined (guard handles redirect)', () => {
      expect(controller.googleAuth).toBeDefined();
    });
  });

  describe('googleAuthRedirect', () => {
    it('should redirect to frontend with token and role', async () => {
      const req = {
        user: { email: 'user@test.com', name: 'User' },
      };
      const res = { redirect: jest.fn() } as any;
      const socialResult = {
        accessToken: 'social-token',
        user: { role: UserRole.USER },
      };
      (authService.validateSocialUser as jest.Mock).mockResolvedValue(
        socialResult,
      );
      (configService.get as jest.Mock).mockReturnValue(
        'http://localhost:3000',
      );

      await controller.googleAuthRedirect(req, res);

      expect(authService.validateSocialUser).toHaveBeenCalledWith(req.user);
      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?token=social-token&role=user',
      );
    });

    it('should use empty string if ECOMMERCE_FRONTEND is not set', async () => {
      const req = { user: { email: 'user@test.com' } };
      const res = { redirect: jest.fn() } as any;
      const socialResult = {
        accessToken: 'token',
        user: { role: UserRole.USER },
      };
      (authService.validateSocialUser as jest.Mock).mockResolvedValue(
        socialResult,
      );
      (configService.get as jest.Mock).mockReturnValue(undefined);

      await controller.googleAuthRedirect(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        '/login?token=token&role=user',
      );
    });
  });

  describe('githubAuth', () => {
    it('should be defined (guard handles redirect)', () => {
      expect(controller.githubAuth).toBeDefined();
    });
  });

  describe('githubAuthRedirect', () => {
    it('should redirect to frontend with token and role', async () => {
      const req = {
        user: { email: 'user@test.com', name: 'User' },
      };
      const res = { redirect: jest.fn() } as any;
      const socialResult = {
        accessToken: 'github-token',
        user: { role: UserRole.ADMIN },
      };
      (authService.validateSocialUser as jest.Mock).mockResolvedValue(
        socialResult,
      );
      (configService.get as jest.Mock).mockReturnValue(
        'http://localhost:3000',
      );

      await controller.githubAuthRedirect(req, res);

      expect(authService.validateSocialUser).toHaveBeenCalledWith(req.user);
      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:3000/login?token=github-token&role=admin',
      );
    });
  });
});

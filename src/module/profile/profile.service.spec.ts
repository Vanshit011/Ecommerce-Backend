import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';

import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entity/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('ProfileService', () => {
  let service: ProfileService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile if found', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
        mobile: '1234567890',
        created_at: new Date(),
      };
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser as User);

      const result = await service.getProfile('user-1');

      expect(result).toEqual(mockUser);
      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: ['id', 'email', 'role', 'mobile', 'created_at'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(service.getProfile('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'old@example.com',
        mobile: '0000000000',
      };
      const updateDto = {
        email: 'new@example.com',
        mobile: '1111111111',
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser as User);
      jest
        .spyOn(userRepo, 'save')
        .mockResolvedValue({ ...mockUser, ...updateDto } as User);

      const result = await service.updateProfile('user-1', updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Profile updated successfully');
      expect(result.user.email).toBe(updateDto.email);
      expect(result.user.mobile).toBe(updateDto.mobile);
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('should handle partial updates (only email)', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'old@example.com',
        mobile: '0000000000',
      };
      const updateDto = { email: 'new@example.com' };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser as User);
      jest
        .spyOn(userRepo, 'save')
        .mockResolvedValue({ ...mockUser, ...updateDto } as User);

      const result = await service.updateProfile('user-1', updateDto);

      expect(result.user.email).toBe(updateDto.email);
      expect(result.user.mobile).toBe(mockUser.mobile);
    });

    it('should handle partial updates (only mobile)', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'old@example.com',
        mobile: '0000000000',
      };
      const updateDto = { mobile: '9999999999' };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser as User);
      jest
        .spyOn(userRepo, 'save')
        .mockResolvedValue({ ...mockUser, ...updateDto } as User);

      const result = await service.updateProfile('user-1', updateDto);

      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.mobile).toBe(updateDto.mobile);
    });

    it('should handle empty update dto', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'old@example.com',
        mobile: '0000000000',
      };

      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser as User);
      jest.spyOn(userRepo, 'save').mockResolvedValue(mockUser as User);

      const result = await service.updateProfile('user-1', {});

      expect(result.success).toBe(true);
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.user.mobile).toBe(mockUser.mobile);
    });

    it('should throw NotFoundException if user to update does not exist', async () => {
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(
        service.updateProfile('invalid-id', { email: 'test@test.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { FavoriteController } from './favorite.controller';

import { FavoriteService } from '../../module/favorite/favorite.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let service: FavoriteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoriteController],
      providers: [
        {
          provide: FavoriteService,
          useValue: {
            add: jest.fn(),
            remove: jest.fn(),
            getFavorites: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<FavoriteController>(FavoriteController);
    service = module.get<FavoriteService>(FavoriteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('add', () => {
    it('should call favoriteService.add with userId and productId', async () => {
      const productId = 'prod-1';
      const userId = 'user-1';
      const expected = { id: 'fav-1', productId, userId };
      (service.add as jest.Mock).mockResolvedValue(expected);

      const result = await controller.add(productId, userId);

      expect(service.add).toHaveBeenCalledWith(userId, productId);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should call favoriteService.remove with userId and productId', async () => {
      const productId = 'prod-1';
      const userId = 'user-1';
      const expected = { affected: 1 };
      (service.remove as jest.Mock).mockResolvedValue(expected);

      const result = await controller.remove(productId, userId);

      expect(service.remove).toHaveBeenCalledWith(userId, productId);
      expect(result).toEqual(expected);
    });
  });

  describe('getFavorites', () => {
    it('should call favoriteService.getFavorites with userId', async () => {
      const userId = 'user-1';
      const expected = [{ id: 'fav-1' }, { id: 'fav-2' }];
      (service.getFavorites as jest.Mock).mockResolvedValue(expected);

      const result = await controller.getFavorites(userId);

      expect(service.getFavorites).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });

    it('should throw UnauthorizedException if userId is falsy', () => {
      expect(() => controller.getFavorites('')).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if userId is undefined', () => {
      expect(() => controller.getFavorites(undefined as any)).toThrow(
        UnauthorizedException,
      );
    });
  });
});

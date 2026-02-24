import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteController } from './favorite.controller';

import { FavoriteService } from '../../module/favorite/favorite.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  // let service: FavoriteService;

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
    // service = module.get<FavoriteService>(FavoriteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

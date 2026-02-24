import { Test, TestingModule } from '@nestjs/testing';
import { FavoriteService } from './favorite.service';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from './entity/favorite.entity';
import { Product } from '../product/entity/product.entity';
// import { Repository } from 'typeorm';

describe('FavoriteService', () => {
  let service: FavoriteService;
  // let favoriteRepo: Repository<Favorite>;
  // let productRepo: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoriteService,
        {
          provide: getRepositoryToken(Favorite),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            softDelete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
              getMany: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FavoriteService>(FavoriteService);
    // favoriteRepo = module.get<Repository<Favorite>>(
    //   getRepositoryToken(Favorite),
    // );
    // productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

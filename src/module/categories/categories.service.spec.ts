import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { DataSource } from 'typeorm';

describe('CategoriesService', () => {
  let service: CategoriesService;
  // let categoryRepository: TreeRepository<Category>;
  // let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findTrees: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            getTreeRepository: jest.fn().mockReturnValue({
              create: jest.fn(),
              save: jest.fn(),
              findTrees: jest.fn(),
              findOne: jest.fn(),
            }),
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    // dataSource = module.get<DataSource>(DataSource);
    // categoryRepository = module.get<TreeRepository<Category>>(
    //   getRepositoryToken(Category),
    // );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

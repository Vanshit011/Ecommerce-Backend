import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entity/product.entity';
import { Category } from '../categories/entity/category.entity';
import { ProductImage } from './entity/product_images.entity';
import { ProductVariant } from './entity/product-variant.entity';
import { GeminiService } from '../ai/gemini.service';
// import { Repository } from 'typeorm';

describe('ProductService', () => {
  let service: ProductService;
  // let productRepo: Repository<Product>;
  // let categoryRepo: Repository<Category>;
  // let imageRepo: Repository<ProductImage>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductImage),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            softDelete: jest.fn(),
            count: jest.fn(),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: GeminiService,
          useValue: {
            isConfigured: jest.fn(),
            generateJsonResponse: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    // productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
    // categoryRepo = module.get<Repository<Category>>(
    //   getRepositoryToken(Category),
    // );
    // imageRepo = module.get<Repository<ProductImage>>(
    //   getRepositoryToken(ProductImage),
    // );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

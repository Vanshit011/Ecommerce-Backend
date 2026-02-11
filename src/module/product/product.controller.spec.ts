import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';

import { ProductService } from './product.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

describe('ProductController', () => {
  let controller: ProductController;
  // let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn(),
            findAllForAdmin: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAllForUsers: jest.fn(),
            getProductDetails: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideInterceptor(CacheInterceptor)
      .useValue({ intercept: jest.fn(() => null) })
      .compile();

    controller = module.get<ProductController>(ProductController);
    // service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

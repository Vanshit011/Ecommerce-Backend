import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';

import { getRepositoryToken } from '@nestjs/typeorm';
import { CartItem } from './entity/cart.entity';
import { Product } from '../product/entity/product.entity';
import { ProductVariant } from '../product/entity/product-variant.entity';
import { CouponService } from '../coupon/coupon.service';
// import { Repository } from 'typeorm';

describe('CartService', () => {
  let service: CartService;
  // let cartRepo: Repository<CartItem>;
  // let productRepo: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(CartItem),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            remove: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useValue: {
            findOne: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: CouponService,
          useValue: {
            validateCoupon: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    // cartRepo = module.get<Repository<CartItem>>(getRepositoryToken(CartItem));
    // productRepo = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';

import { CartService } from './cart.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';

describe('CartController', () => {
  let controller: CartController;
  // let cartService: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            addToCart: jest.fn(),
            getMyCart: jest.fn(),
            updateCartItemQuantity: jest.fn(),
            clearCart: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CartController>(CartController);
    // cartService = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

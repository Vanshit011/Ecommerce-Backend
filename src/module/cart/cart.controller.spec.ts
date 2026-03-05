import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CartController } from './cart.controller';

import { CartService } from './cart.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;

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
            removeCartItem: jest.fn(),
            applyCoupon: jest.fn(),
            removeCoupon: jest.fn(),
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
    cartService = module.get<CartService>(CartService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCart', () => {
    it('should call cartService.getMyCart with userId', async () => {
      const userId = 'user-1';
      const expected = { items: [], total: 0 };
      (cartService.getMyCart as jest.Mock).mockResolvedValue(expected);

      const result = await controller.getCart(userId);

      expect(cartService.getMyCart).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });

  describe('clear', () => {
    it('should call cartService.clearCart with userId', async () => {
      const userId = 'user-1';
      const expected = { message: 'Cart cleared' };
      (cartService.clearCart as jest.Mock).mockResolvedValue(expected);

      const result = await controller.clear(userId);

      expect(cartService.clearCart).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });

  describe('applyCoupon', () => {
    it('should call cartService.applyCoupon with userId and body', async () => {
      const userId = 'user-1';
      const body = { code: 'SAVE10' } as any;
      const expected = { discount: 10 };
      (cartService.applyCoupon as jest.Mock).mockResolvedValue(expected);

      const result = await controller.applyCoupon(userId, body);

      expect(cartService.applyCoupon).toHaveBeenCalledWith(userId, body);
      expect(result).toEqual(expected);
    });
  });

  describe('removeCoupon', () => {
    it('should call cartService.removeCoupon with userId', async () => {
      const userId = 'user-1';
      const expected = { message: 'Coupon removed' };
      (cartService.removeCoupon as jest.Mock).mockResolvedValue(expected);

      const result = await controller.removeCoupon(userId);

      expect(cartService.removeCoupon).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });

  describe('add', () => {
    it('should call cartService.addToCart with correct params', async () => {
      const productId = 'prod-1';
      const userId = 'user-1';
      const body = { quantity: 2, variant_id: 'var-1' } as any;
      const expected = { id: 'cart-1' };
      (cartService.addToCart as jest.Mock).mockResolvedValue(expected);

      const result = await controller.add(productId, userId, body);

      expect(cartService.addToCart).toHaveBeenCalledWith(
        userId,
        productId,
        2,
        'var-1',
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateQty', () => {
    it('should call cartService.updateCartItemQuantity with valid qty', async () => {
      const productId = 'prod-1';
      const qty = 3;
      const variantId = 'var-1';
      const userId = 'user-1';
      const expected = { updated: true };
      (cartService.updateCartItemQuantity as jest.Mock).mockResolvedValue(
        expected,
      );

      const result = await controller.updateQty(
        productId,
        qty,
        variantId,
        userId,
      );

      expect(cartService.updateCartItemQuantity).toHaveBeenCalledWith(
        userId,
        productId,
        qty,
        variantId,
      );
      expect(result).toEqual(expected);
    });

    it('should throw BadRequestException for invalid qty', () => {
      const productId = 'prod-1';
      const qty = -1;
      const variantId = 'var-1';
      const userId = 'user-1';

      expect(() =>
        controller.updateQty(productId, qty, variantId, userId),
      ).toThrow(BadRequestException);
    });
  });

  describe('removeItem', () => {
    it('should call cartService.removeCartItem with correct params', async () => {
      const productId = 'prod-1';
      const variantId = 'var-1';
      const userId = 'user-1';
      const expected = { removed: true };
      (cartService.removeCartItem as jest.Mock).mockResolvedValue(expected);

      const result = await controller.removeItem(productId, variantId, userId);

      expect(cartService.removeCartItem).toHaveBeenCalledWith(
        userId,
        productId,
        variantId,
      );
      expect(result).toEqual(expected);
    });
  });
});

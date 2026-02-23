import { Test, TestingModule } from '@nestjs/testing';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';

describe('CouponController', () => {
  let controller: CouponController;
  let service: CouponService;

  const mockCouponService = {
    createCoupon: jest.fn(),
    findAll: jest.fn(),
    validateCoupon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        {
          provide: CouponService,
          useValue: mockCouponService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CouponController>(CouponController);
    service = module.get<CouponService>(CouponService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.createCoupon', async () => {
      const dto = {
        code: 'SAVE10',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
      };
      mockCouponService.createCoupon.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.create('admin1', dto as any);

      expect(service.createCoupon).toHaveBeenCalledWith('admin1', dto);
      expect(result).toHaveProperty('id');
    });
  });

  describe('findAll', () => {
    it('should call service.findAll', async () => {
      mockCouponService.findAll.mockResolvedValue([]);

      const result = await controller.findAll('admin1', 'ADMIN' as any);

      expect(service.findAll).toHaveBeenCalledWith('admin1', 'ADMIN');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('validate', () => {
    it('should call service.validateCoupon and return discount info', async () => {
      const body = { code: 'SAVE10', cartTotal: 100 };
      mockCouponService.validateCoupon.mockResolvedValue({
        discountAmount: 10,
        coupon: { code: 'SAVE10' },
      });

      const result = await controller.validate(body);

      expect(service.validateCoupon).toHaveBeenCalledWith(
        body.code,
        body.cartTotal,
      );
      expect(result).toEqual({
        discountAmount: 10,
        code: 'SAVE10',
      });
    });
  });
});

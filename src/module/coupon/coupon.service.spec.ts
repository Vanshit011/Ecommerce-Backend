import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coupon } from './entity/coupon.entity';
import { DiscountType } from '../../shared/constants/enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CouponService', () => {
  let service: CouponService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: getRepositoryToken(Coupon),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            increment: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    repo = module.get(getRepositoryToken(Coupon));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCoupon', () => {
    it('should throw NotFoundException if coupon does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.validateCoupon('INVALID', 100)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if coupon is inactive', async () => {
      repo.findOne.mockResolvedValue({ is_active: false });
      await expect(service.validateCoupon('INACTIVE', 100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if cart total is less than min_order_amount', async () => {
      repo.findOne.mockResolvedValue({
        is_active: true,
        min_order_amount: 200,
        start_date: null,
        end_date: null,
      });
      await expect(service.validateCoupon('MIN200', 100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should calculate percentage discount correctly', async () => {
      repo.findOne.mockResolvedValue({
        is_active: true,
        discount_type: DiscountType.PERCENTAGE,
        discount_value: 10,
        min_order_amount: 50,
        max_discount_amount: 100,
        start_date: null,
        end_date: null,
      });

      const result = await service.validateCoupon('SAVE10', 200);
      expect(result.discountAmount).toBe(20);
    });

    it('should cap percentage discount by max_discount_amount', async () => {
      repo.findOne.mockResolvedValue({
        is_active: true,
        discount_type: DiscountType.PERCENTAGE,
        discount_value: 50,
        min_order_amount: 0,
        max_discount_amount: 20,
        start_date: null,
        end_date: null,
      });

      const result = await service.validateCoupon('HALF', 100);
      expect(result.discountAmount).toBe(20);
    });

    it('should calculate fixed discount correctly', async () => {
      repo.findOne.mockResolvedValue({
        is_active: true,
        discount_type: DiscountType.FIXED,
        discount_value: 15,
        min_order_amount: 50,
        start_date: null,
        end_date: null,
      });

      const result = await service.validateCoupon('FIXED15', 100);
      expect(result.discountAmount).toBe(15);
    });
  });
});

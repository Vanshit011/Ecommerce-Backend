import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coupon } from './entity/coupon.entity';
import { DiscountType } from '../../shared/constants/enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { updateCouponDto } from './dto/update-coupon.dto';

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
            softDelete: jest.fn(),
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

  describe('createCoupon', () => {
    it('should create a coupon with user id', async () => {
      const dto = { code: 'NEW10', discount_value: 10 } as any;
      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue(dto);
      repo.save.mockResolvedValue({ ...dto, user: { id: 'admin1' } });

      const result = await service.createCoupon('admin1', dto);
      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        user: { id: 'admin1' },
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result.user.id).toBe('admin1');
    });

    it('should throw BadRequestException if coupon code exists', async () => {
      repo.findOne.mockResolvedValue({ id: '1' });
      await expect(
        service.createCoupon('admin1', { code: 'EXISTS' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should filter by userId if provided', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll('admin1');
      expect(repo.find).toHaveBeenCalledWith({
        where: { user: { id: 'admin1' } },
      });
    });

    it('should return all if no userId provided', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll();
      expect(repo.find).toHaveBeenCalledWith();
    });
  });

  describe('updateCoupon', () => {
    it('should update coupon if owned by user', async () => {
      const coupon = { id: '1', code: 'OLD', user: { id: 'admin1' } };
      const dto: updateCouponDto = { code: 'NEW' };
      repo.findOne.mockResolvedValueOnce(coupon).mockResolvedValueOnce(null);
      repo.save.mockResolvedValue({ ...coupon, ...dto });

      const result = await service.updateCoupon('1', 'admin1', dto);
      expect(result.code).toBe('NEW');
      expect(repo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if not owned by user', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.updateCoupon('1', 'admin2', { code: 'NEW' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if new code already exists', async () => {
      const coupon = { id: '1', code: 'OLD', user: { id: 'admin1' } };
      repo.findOne
        .mockResolvedValueOnce(coupon)
        .mockResolvedValueOnce({ id: '2', code: 'EXISTS' });

      await expect(
        service.updateCoupon('1', 'admin1', { code: 'EXISTS' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeCoupon', () => {
    it('should remove coupon if owned by user', async () => {
      const coupon = { id: '1', user: { id: 'admin1' } };
      repo.findOne.mockResolvedValue(coupon);
      repo.softDelete.mockResolvedValue({ affected: 1 });

      await service.removeCoupon('1', 'admin1');
      expect(repo.softDelete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if not owned by user', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.removeCoupon('1', 'admin2')).rejects.toThrow(
        NotFoundException,
      );
    });
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

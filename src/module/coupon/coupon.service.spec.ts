import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from './coupon.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Coupon } from './entity/coupon.entity';
import { Product } from '../product/entity/product.entity';
import { DiscountType, UserRole } from '../../shared/constants/enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { updateCouponDto } from './dto/update-coupon.dto';

describe('CouponService', () => {
  let service: CouponService;
  let repo: any;
  let productRepo: any;

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
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    repo = module.get(getRepositoryToken(Coupon));
    productRepo = module.get(getRepositoryToken(Product));
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

    it('should create coupon with product_ids', async () => {
      const dto = {
        code: 'PROD10',
        discount_value: 10,
        product_ids: ['p1', 'p2'],
      } as any;
      const products = [{ id: 'p1' }, { id: 'p2' }];

      repo.findOne.mockResolvedValue(null);
      const createdCoupon = { code: 'PROD10', discount_value: 10 };
      repo.create.mockReturnValue(createdCoupon);
      productRepo.findBy.mockResolvedValue(products);
      repo.save.mockResolvedValue({
        ...createdCoupon,
        products,
        user: { id: 'admin1' },
      });

      const result = await service.createCoupon('admin1', dto);
      expect(productRepo.findBy).toHaveBeenCalled();
      expect(result.products).toEqual(products);
    });

    it('should throw BadRequestException if product_ids are invalid', async () => {
      const dto = {
        code: 'PROD10',
        discount_value: 10,
        product_ids: ['p1', 'p2'],
      } as any;

      repo.findOne.mockResolvedValue(null);
      repo.create.mockReturnValue({ code: 'PROD10' });
      productRepo.findBy.mockResolvedValue([{ id: 'p1' }]);

      await expect(service.createCoupon('admin1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should filter by userId if role is ADMIN', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll('admin1', UserRole.ADMIN);
      expect(repo.find).toHaveBeenCalledWith({
        where: { user: { id: 'admin1' } },
        relations: ['products'],
      });
    });

    it('should return active coupons for USER role', async () => {
      repo.find.mockResolvedValue([]);
      await service.findAll('admin1', UserRole.USER);
      expect(repo.find).toHaveBeenCalledWith({
        where: { is_active: true, deleted_at: expect.anything() },
        relations: ['products'],
      });
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

    it('should update product associations when product_ids provided', async () => {
      const coupon = {
        id: '1',
        code: 'OLD',
        user: { id: 'admin1' },
        products: [],
      };
      const dto = { product_ids: ['p1', 'p2'] } as updateCouponDto;
      const products = [{ id: 'p1' }, { id: 'p2' }];

      repo.findOne.mockResolvedValueOnce(coupon);
      productRepo.findBy.mockResolvedValue(products);
      repo.save.mockResolvedValue({ ...coupon, products });

      const result = await service.updateCoupon('1', 'admin1', dto);
      expect(result.products).toEqual(products);
    });

    it('should clear products when empty product_ids array provided', async () => {
      const coupon = {
        id: '1',
        code: 'OLD',
        user: { id: 'admin1' },
        products: [{ id: 'p1' }],
      };
      const dto = { product_ids: [] } as updateCouponDto;

      repo.findOne.mockResolvedValueOnce(coupon);
      repo.save.mockResolvedValue({ ...coupon, products: [] });

      const result = await service.updateCoupon('1', 'admin1', dto);
      expect(result.products).toEqual([]);
    });

    it('should throw BadRequestException if product_ids are invalid during update', async () => {
      const coupon = {
        id: '1',
        code: 'OLD',
        user: { id: 'admin1' },
        products: [],
      };
      const dto = { product_ids: ['p1', 'p2'] } as updateCouponDto;

      repo.findOne.mockResolvedValueOnce(coupon);
      productRepo.findBy.mockResolvedValue([{ id: 'p1' }]);

      await expect(
        service.updateCoupon('1', 'admin1', dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow same code for same coupon', async () => {
      const coupon = { id: '1', code: 'SAME', user: { id: 'admin1' } };
      const dto: updateCouponDto = { code: 'SAME' };
      repo.findOne
        .mockResolvedValueOnce(coupon)
        .mockResolvedValueOnce({ id: '1', code: 'SAME' });
      repo.save.mockResolvedValue({ ...coupon, ...dto });

      const result = await service.updateCoupon('1', 'admin1', dto);
      expect(result.code).toBe('SAME');
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

    it('should throw BadRequestException if coupon is not yet valid (start_date in future)', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      repo.findOne.mockResolvedValue({
        is_active: true,
        start_date: futureDate,
        end_date: null,
      });
      await expect(service.validateCoupon('FUTURE', 100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if coupon has expired', async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      repo.findOne.mockResolvedValue({
        is_active: true,
        start_date: null,
        end_date: pastDate,
      });
      await expect(service.validateCoupon('EXPIRED', 100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if usage limit reached', async () => {
      repo.findOne.mockResolvedValue({
        is_active: true,
        start_date: null,
        end_date: null,
        usage_limit: 5,
        used_count: 5,
        min_order_amount: 0,
      });
      await expect(service.validateCoupon('LIMIT', 100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if cart total is less than min_order_amount', async () => {
      repo.findOne.mockResolvedValue({
        is_active: true,
        min_order_amount: 200,
        start_date: null,
        end_date: null,
        usage_limit: 0,
      });
      await expect(service.validateCoupon('MIN200', 100)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if product-specific coupon does not match cart products', async () => {
      repo.findOne.mockResolvedValue({
        is_active: true,
        min_order_amount: 0,
        start_date: null,
        end_date: null,
        usage_limit: 0,
        products: [{ id: 'p1' }, { id: 'p2' }],
        discount_type: DiscountType.FIXED,
        discount_value: 10,
      });
      await expect(
        service.validateCoupon('SPECIFIC', 100, ['p3', 'p4']),
      ).rejects.toThrow(BadRequestException);
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
        usage_limit: 0,
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
        usage_limit: 0,
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
        usage_limit: 0,
      });

      const result = await service.validateCoupon('FIXED15', 100);
      expect(result.discountAmount).toBe(15);
    });

    it('should not allow discount to exceed cart total', async () => {
      repo.findOne.mockResolvedValue({
        is_active: true,
        discount_type: DiscountType.FIXED,
        discount_value: 200,
        min_order_amount: 0,
        start_date: null,
        end_date: null,
        usage_limit: 0,
      });

      const result = await service.validateCoupon('BIG', 50);
      expect(result.discountAmount).toBe(50);
    });

    it('should validate product-specific coupon when products match', async () => {
      repo.findOne.mockResolvedValue({
        is_active: true,
        min_order_amount: 0,
        start_date: null,
        end_date: null,
        usage_limit: 0,
        products: [{ id: 'p1' }, { id: 'p2' }],
        discount_type: DiscountType.FIXED,
        discount_value: 10,
      });

      const result = await service.validateCoupon('MATCH', 100, ['p1', 'p3']);
      expect(result.discountAmount).toBe(10);
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count using default repo', async () => {
      repo.increment.mockResolvedValue({ affected: 1 });

      await service.incrementUsage('coupon-1');

      expect(repo.increment).toHaveBeenCalledWith(
        { id: 'coupon-1' },
        'used_count',
        1,
      );
    });

    it('should increment usage count using provided entity manager', async () => {
      const mockManagerRepo = { increment: jest.fn() };
      const manager = {
        getRepository: jest.fn().mockReturnValue(mockManagerRepo),
      } as any;

      await service.incrementUsage('coupon-1', manager);

      expect(manager.getRepository).toHaveBeenCalledWith(Coupon);
      expect(mockManagerRepo.increment).toHaveBeenCalledWith(
        { id: 'coupon-1' },
        'used_count',
        1,
      );
    });
  });
});

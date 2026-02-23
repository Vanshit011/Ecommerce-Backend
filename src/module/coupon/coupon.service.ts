import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Coupon } from './entity/coupon.entity';
import { DiscountType } from '../../shared/constants/enum';
import { createCouponDto } from './dto/create-coupon.dto';
import { updateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepo: Repository<Coupon>,
  ) {}

  async createCoupon(userId: string, data: createCouponDto) {
    const existing = await this.couponRepo.findOne({
      where: { code: data.code },
    });
    if (existing) {
      throw new BadRequestException('Coupon code already exists');
    }
    const coupon = this.couponRepo.create({
      ...data,
      user: { id: userId },
    });
    return this.couponRepo.save(coupon);
  }

  async findAll(userId?: string) {
    if (userId) {
      return this.couponRepo.find({
        where: { user: { id: userId } },
      });
    }
    return this.couponRepo.find();
  }

  async updateCoupon(id: string, userId: string, data: updateCouponDto) {
    const coupon = await this.couponRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!coupon) {
      throw new NotFoundException(
        'Coupon not found or you do not have permission',
      );
    }

    if (data.code) {
      const existing = await this.couponRepo.findOne({
        where: { code: data.code },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException('Coupon code already exists');
      }
    }

    Object.assign(coupon, data);
    return this.couponRepo.save(coupon);
  }

  async removeCoupon(id: string, userId: string) {
    const coupon = await this.couponRepo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!coupon) {
      throw new NotFoundException(
        'Coupon not found or you do not have permission',
      );
    }
    return this.couponRepo.softDelete(id);
  }

  async validateCoupon(code: string, cartTotal: number) {
    const coupon = await this.couponRepo.findOne({ where: { code } });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    if (!coupon.is_active) {
      throw new BadRequestException('Coupon is inactive');
    }

    const now = new Date();
    if (coupon.start_date && coupon.start_date > now) {
      throw new BadRequestException('Coupon is not yet valid');
    }
    if (coupon.end_date && coupon.end_date < now) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (cartTotal < Number(coupon.min_order_amount)) {
      throw new BadRequestException(
        `Minimum order amount of ${coupon.min_order_amount} required`,
      );
    }

    let discountAmount = 0;
    if (coupon.discount_type === DiscountType.PERCENTAGE) {
      discountAmount = (cartTotal * Number(coupon.discount_value)) / 100;
      if (
        coupon.max_discount_amount &&
        discountAmount > Number(coupon.max_discount_amount)
      ) {
        discountAmount = Number(coupon.max_discount_amount);
      }
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    // Discount cannot exceed cart total
    discountAmount = Math.min(discountAmount, cartTotal);

    return {
      coupon,
      discountAmount,
    };
  }

  async incrementUsage(couponId: string, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Coupon) : this.couponRepo;
    await repo.increment({ id: couponId }, 'used_count', 1);
  }
}

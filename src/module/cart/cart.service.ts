import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import { CartItem } from './entity/cart.entity';
import { Product } from '../product/entity/product.entity';
import { ProductVariant } from '../product/entity/product-variant.entity';
import { CouponService } from '../coupon/coupon.service';
import { Coupon } from '../coupon/entity/coupon.entity';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,

    private couponService: CouponService,
  ) {}

  //add cart
  async addToCart(
    userId: string,
    productId: string,
    quantity = 1,
    variantId?: string,
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    let variant: ProductVariant | undefined = undefined;
    let priceSnapshot = 0;

    if (variantId) {
      const foundVariant = await this.variantRepo.findOne({
        where: { id: variantId, product: { id: productId } },
      });

      if (!foundVariant) {
        throw new NotFoundException('Product variant not found');
      }

      variant = foundVariant;

      if (variant.stock_qty < quantity) {
        throw new BadRequestException('Requested quantity exceeds stock');
      }
      priceSnapshot = variant.price;
    } else {
      const hasVariants = await this.variantRepo.count({
        where: { product: { id: productId } },
      });
      if (hasVariants > 0) {
        throw new BadRequestException('Please specify a product variant');
      }
    }

    // Get active coupon from any existing cart item for this user
    // Use QueryBuilder with raw column to avoid TypeORM relation join issues
    const existingWithCoupon = await this.cartRepo
      .createQueryBuilder('cart')
      .select('cart.active_cart_coupon', 'active_cart_coupon')
      .where('cart.user_id = :userId', { userId })
      .andWhere('cart.deleted_at IS NULL')
      .andWhere('cart.active_cart_coupon IS NOT NULL')
      .getRawOne<{ active_cart_coupon: string }>();

    const activeCoupon = existingWithCoupon?.active_cart_coupon ?? null;

    const activeItem = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
        variant_id: variantId ? variantId : IsNull(),
      },
    });

    if (activeItem) {
      const newQty = activeItem.quantity + quantity;

      if (variant && variant.stock_qty < newQty) {
        throw new BadRequestException('Total quantity exceeds available stock');
      }

      activeItem.quantity = newQty;
      await this.cartRepo.save(activeItem);

      return { message: 'Quantity increased', item: activeItem };
    }

    const newItem = this.cartRepo.create({
      user: { id: userId },
      product,
      variant,
      quantity,
      variant_id: variantId,
      price_snapshot: priceSnapshot,
      size: variant?.size,
      color: variant?.color,
      active_cart_coupon: activeCoupon,
    });

    const saved = await this.cartRepo.save(newItem);

    if (activeCoupon) {
      await this.cartRepo
        .createQueryBuilder()
        .update(CartItem)
        .set({ active_cart_coupon: activeCoupon })
        .where('user_id = :userId', { userId })
        .execute();
    }

    return { message: 'Added to cart', item: saved };
  }

  //get MY CART
  async getMyCart(userId: string) {
    const items = await this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['product', 'product.images', 'product.category', 'variant'],
      order: { created_at: 'ASC' },
    });

    let subtotal = 0;
    for (const item of items) {
      subtotal += Number(item.price_snapshot) * item.quantity;
    }

    // Read coupon from first cart item
    const activeCouponCode = items[0]?.active_cart_coupon ?? null;

    let discountAmount = 0;
    let coupon: Coupon | null = null;
    let message = '';

    if (activeCouponCode) {
      try {
        const productIds = items.map((i) => i.product.id);
        const validation = await this.couponService.validateCoupon(
          activeCouponCode,
          subtotal,
          productIds,
        );
        discountAmount = validation.discountAmount;
        coupon = validation.coupon;
      } catch (err: any) {
        message = `Applied coupon "${activeCouponCode}" is no longer valid: ${err.message}`;
      }
    }

    const finalTotal = subtotal - discountAmount;

    return {
      items,
      subtotal,
      discountAmount,
      finalTotal,
      appliedCoupon: coupon
        ? {
            code: coupon.code,
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value,
          }
        : null,
      message: message || undefined,
    };
  }

  async applyCoupon(userId: string, dto: ApplyCouponDto) {
    const cart = await this.getMyCart(userId);

    // Validate coupon against current subtotal and products
    const productIds = cart.items.map((i) => i.product.id);
    await this.couponService.validateCoupon(
      dto.code,
      cart.subtotal,
      productIds,
    );

    // Save coupon to ALL cart items for this user
    await this.cartRepo
      .createQueryBuilder()
      .update(CartItem)
      .set({ active_cart_coupon: dto.code })
      .where('user_id = :userId', { userId })
      .execute();

    return { message: 'Coupon applied successfully' };
  }

  async removeCoupon(userId: string) {
    await this.cartRepo
      .createQueryBuilder()
      .update(CartItem)
      .set({ active_cart_coupon: null })
      .where('user_id = :userId', { userId })
      .execute();

    return { message: 'Coupon removed' };
  }

  //update cart item quantity
  async updateCartItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
    variantId?: string,
  ) {
    const where: FindOptionsWhere<CartItem> = {
      user: { id: userId },
      product: { id: productId },
      variant_id: variantId ? variantId : IsNull(),
    };

    const item = await this.cartRepo.findOne({
      where,
      relations: ['product', 'variant'],
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity <= 0) {
      await this.cartRepo.remove(item);
      return { message: 'Cart item removed', item: null };
    }

    if (item.variant && item.variant.stock_qty < quantity) {
      throw new BadRequestException(
        'Requested quantity exceeds available stock',
      );
    }

    item.quantity = quantity;
    await this.cartRepo.save(item);
    return { message: 'Cart item updated', item };
  }

  // remove specific item
  async removeCartItem(userId: string, productId: string, variantId?: string) {
    const where: FindOptionsWhere<CartItem> = {
      user: { id: userId },
      product: { id: productId },
      variant_id: variantId ? variantId : IsNull(),
    };

    const item = await this.cartRepo.findOne({ where });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepo.remove(item);

    return { message: 'Item removed from cart' };
  }

  //  CLEAR CART
  async clearCart(userId: string) {
    await this.cartRepo.softDelete({ user: { id: userId } });
    return { message: 'Cart cleared' };
  }
}

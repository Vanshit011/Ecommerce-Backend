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

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    @InjectRepository(ProductVariant)
    private variantRepo: Repository<ProductVariant>,
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

      // Check stock
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
      // If no variants, fallback to product price if it exists (assuming hybrid schema or default)
      // For now, let's assume if it has no variants, we use product.price (if it exists)
      // priceSnapshot = (product as any).price || 0;
    }

    //  Find existing cart item WITH SAME VARIANT
    const activeItem = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
        variant_id: variantId ? variantId : IsNull(),
      },
    });

    if (activeItem) {
      const newQty = activeItem.quantity + quantity;

      // Check stock for total qty
      if (variant && variant.stock_qty < newQty) {
        throw new BadRequestException('Total quantity exceeds available stock');
      }

      activeItem.quantity = newQty;
      await this.cartRepo.save(activeItem);

      return {
        message: 'Quantity increased',
        item: activeItem,
      };
    }

    //  Insert new row
    const newItem = this.cartRepo.create({
      user: { id: userId },
      product,
      variant,
      quantity,
      variant_id: variantId,
      price_snapshot: priceSnapshot,
      size: variant?.size,
      color: variant?.color,
    });

    const saved = await this.cartRepo.save(newItem);

    return {
      message: 'Added to cart',
      item: saved,
    };
  }

  //get MY CART
  async getMyCart(userId: string) {
    const items = await this.cartRepo.find({
      where: { user: { id: userId } },
      relations: ['product', 'product.images', 'product.category', 'variant'],
      order: {
        created_at: 'ASC',
      },
    });

    return { items };
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

    // If quantity is 0 or less, remove the item
    if (quantity <= 0) {
      await this.cartRepo.remove(item);
      return {
        message: 'Cart item removed',
        item: null,
      };
    }

    // Check stock for the new absolute quantity
    if (item.variant && item.variant.stock_qty < quantity) {
      throw new BadRequestException(
        'Requested quantity exceeds available stock',
      );
    }

    item.quantity = quantity;
    await this.cartRepo.save(item);
    return {
      message: 'Cart item updated',
      item,
    };
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
    //soft delete
    await this.cartRepo.softDelete({ user: { id: userId } });
    return { message: 'Cart cleared' };
  }
}

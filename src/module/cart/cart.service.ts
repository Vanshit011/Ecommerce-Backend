import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entity/cart.entity';
import { Product } from '../product/entity/product.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepo: Repository<CartItem>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  //add cart
  async addToCart(
    userId: string,
    productId: string,
    size: string,
    color: string,
    quantity = 1,
  ) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    //  Validate selected options
    if (size && product.sizes && !product.sizes.includes(size)) {
      throw new BadRequestException('Invalid size selected');
    }

    if (color && product.colors && !product.colors.includes(color)) {
      throw new BadRequestException('Invalid color selected');
    }

    //  Check stock
    if (product.stockQty < quantity) {
      throw new BadRequestException('Out of stock');
    }

    //  Find existing cart item WITH SAME VARIANT
    const activeItem = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
        size,
        color,
      },
    });

    if (activeItem) {
      activeItem.quantity += quantity;

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
      quantity,
      size,
      color,
      priceSnapshot: product.salePrice ?? product.price,
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
      relations: ['product', 'product.images', 'product.category'],
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
    size?: string,
    color?: string,
  ) {
    const where: any = {
      user: { id: userId },
      product: { id: productId },
    };

    // If size/color is provided, match it; otherwise match null/undefined
    if (size) where.size = size;
    else where.size = null;

    if (color) where.color = color;
    else where.color = null;

    const item = await this.cartRepo.findOne({
      where,
      relations: ['product'],
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    // Check stock for the new absolute quantity
    if (item.product && item.product.stockQty < quantity) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }

    item.quantity = quantity;
    await this.cartRepo.save(item);
    return {
      message: 'Cart item updated',
      item,
    };
  }

  //  CLEAR CART
  async clearCart(userId: string) {
    //soft delete
    await this.cartRepo.softDelete({ user: { id: userId } });
    return { message: 'Cart cleared' };
  }
}

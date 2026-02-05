import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
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
  async addToCart(userId: string, productId: string, quantity = 1) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    //  Check stock
    if (product.stock_qty < quantity) {
      throw new BadRequestException('Out of stock');
    }

    //  Find existing cart item WITH SAME VARIANT
    const activeItem = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
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

      price_snapshot: product.sale_price ?? product.price,
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
  ) {
    const where: FindOptionsWhere<CartItem> = {
      user: { id: userId },
      product: { id: productId },
    };

    const item = await this.cartRepo.findOne({
      where,
      relations: ['product'],
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
    if (item.product && item.product.stock_qty < quantity) {
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

  //  CLEAR CART
  async clearCart(userId: string) {
    //soft delete
    await this.cartRepo.softDelete({ user: { id: userId } });
    return { message: 'Cart cleared' };
  }
}

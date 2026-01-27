import { Injectable } from '@nestjs/common';
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

  // ADD TO CART
  async addToCart(userId: string, productId: string) {
    const product = await this.productRepo.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    //  ACTIVE ITEM
    const activeItem = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });

    if (activeItem) {
      activeItem.quantity += 1;

      await this.cartRepo.save(activeItem);

      return {
        message: 'Quantity increased',
        item: activeItem,
      };
    }

    // Just insert new row
    const newItem = this.cartRepo.create({
      user: { id: userId },
      product,
      quantity: 1,
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
      relations: ['product'],
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
    const item = await this.cartRepo.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });
    if (!item) {
      throw new NotFoundException('Cart item not found');
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

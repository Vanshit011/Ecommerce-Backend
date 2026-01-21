import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { deleteImage, uploadImage } from '../../core/utils/cloudinary.helper';
import { Category } from '../categories/entity/category.entity';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly category: Repository<Category>
  ) { }

  async create(
    dto: CreateProductDto,
    imageUrl: string,
    publicId: string,
    userId: string
  ) {
    return this.productRepo.save({
      ...dto,
      image: imageUrl,
      imagePublicId: publicId,
      userId: userId,
    });
  }

  // USER see all products
  findAllForUsers() {
    return this.productRepo.find({
      where: { isActive: true },
      relations: ['category'],
    });
  }

  // ADMIN see only own products
  findAllForAdmin(userId: string) {
    return this.productRepo.find({
      where: { isActive: true, userId },
      relations: ['category']
    });
  }


  async update(
    id: string,
    dto: Partial<CreateProductDto>,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const product = await this.productRepo.findOne({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    if (file) {
      if (product.imagePublicId) {
        await deleteImage(product.imagePublicId);
      }

      const uploaded = await uploadImage(file.buffer, 'ecommerce/products');
      product.image = uploaded.url;
      product.imagePublicId = uploaded.publicId;
    }

    Object.assign(product, dto);
    return this.productRepo.save(product);
  }



  async delete(id: string, userId: string) {
    const product = await this.productRepo.findOne({
      where: { id, userId },
    });

    if (!product) {
      throw new NotFoundException('Product not found or access denied');
    }

    await this.productRepo.softDelete(id);

    return {
      message: 'Product moved to trash successfully',
    };
  }



}

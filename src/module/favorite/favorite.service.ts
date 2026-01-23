import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entity/favorite.entity';
import { Product } from '../product/entity/product.entity';

@Injectable()
export class FavoriteService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoriteRepo: Repository<Favorite>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
    ) { }

    async add(userId: string, productId: string) {
        const existing = await this.favoriteRepo.findOne({
            where: {
                user: { id: userId },
                product: { id: productId },
            },
            withDeleted: true,
        });

        if (existing && !existing.deleted_at) {
            return { message: 'Already in favorites' };
        }

        if (existing && existing.deleted_at) {
            await this.favoriteRepo.restore(existing.id);
            return { message: 'Added to favorites again' };
        }

        const product = await this.productRepo.findOneBy({ id: productId });
        if (!product) throw new NotFoundException('Product not found');

        const fav = this.favoriteRepo.create({
            user: { id: userId },
            product: { id: productId },
        });

        await this.favoriteRepo.save(fav);

        return { message: 'Added to favorites' };
    }

    async remove(userId: string, productId: string) {
        const fav = await this.favoriteRepo
            .createQueryBuilder('fav')
            .leftJoin('fav.user', 'user')
            .leftJoin('fav.product', 'product')
            .where('user.id = :userId', { userId })
            .andWhere('product.id = :productId', { productId })
            .andWhere('fav.deleted_at IS NULL')
            .getOne();

        if (!fav) {
            return { message: 'Already removed from favorites' };
        }

        await this.favoriteRepo.softDelete(fav.id);

        return { message: 'Removed from favorites' };
    }


    async getFavorites(userId: string) {
        const favorites = await this.favoriteRepo
            .createQueryBuilder('fav')
            .where('fav.userId = :userId', { userId })
            .andWhere('fav.deleted_at IS NULL')
            .leftJoinAndSelect('fav.product', 'product')
            .getMany();

        return favorites.map(fav => fav.product);
    }
}

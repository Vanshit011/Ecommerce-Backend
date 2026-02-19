import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entity/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Product } from '../product/entity/product.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createReview(
    userId: string,
    productId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const { rating, comment } = createReviewDto;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // Check if user already reviewed this product
    const existingReview = await this.reviewRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = this.reviewRepository.create({
      rating,
      comment,
      user: { id: userId },
      product,
    });

    return await this.reviewRepository.save(review);
  }

  async getReviewsByProduct(productId: string): Promise<Review[]> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    return await this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getAverageRating(productId: string): Promise<{
    average: number;
    count: number;
    breakdown: Record<number, { count: number; percentage: number }>;
  }> {
    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
    });

    const breakdown: Record<number, { count: number; percentage: number }> = {};
    for (let i = 1; i <= 5; i++) {
      breakdown[i] = { count: 0, percentage: 0 };
    }

    if (reviews.length === 0) {
      return { average: 0, count: 0, breakdown };
    }

    const sum = reviews.reduce((acc, review) => {
      const rating = review.rating;
      if (breakdown[rating]) {
        breakdown[rating].count++;
      }
      return acc + rating;
    }, 0);

    const totalCount = reviews.length;
    for (let i = 1; i <= 5; i++) {
      breakdown[i].percentage = parseFloat(
        ((breakdown[i].count / totalCount) * 100).toFixed(1),
      );
    }

    return {
      average: parseFloat((sum / totalCount).toFixed(1)),
      count: totalCount,
      breakdown,
    };
  }

  async updateReview(
    userId: string,
    id: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.user.id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    return await this.reviewRepository.save(review);
  }

  async deleteReview(userId: string, id: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.softRemove(review);
  }
}

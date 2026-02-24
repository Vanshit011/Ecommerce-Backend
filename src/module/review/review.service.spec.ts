import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Review } from './entity/review.entity';
import { Product } from '../product/entity/product.entity';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('ReviewService', () => {
  let service: ReviewService;
  let reviewRepo: Record<string, any>;
  let productRepo: Record<string, any>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: getRepositoryToken(Review),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            softRemove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReviewService>(ReviewService);
    reviewRepo = module.get(getRepositoryToken(Review));
    productRepo = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReview', () => {
    const userId = 'user-id';
    const productId = 'product-id';
    const createReviewDto = {
      rating: 5,
      comment: 'Great product!',
    };

    it('should throw NotFoundException if product not found', async () => {
      productRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createReview(userId, productId, createReviewDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if user already reviewed the product', async () => {
      productRepo.findOne.mockResolvedValue({ id: productId });
      reviewRepo.findOne.mockResolvedValue({ id: 'existing-review' });
      await expect(
        service.createReview(userId, productId, createReviewDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create and save a review', async () => {
      const product = { id: productId };
      productRepo.findOne.mockResolvedValue(product);
      reviewRepo.findOne.mockResolvedValue(null);
      reviewRepo.create.mockReturnValue({
        ...createReviewDto,
        user: { id: userId },
        product,
      });
      reviewRepo.save.mockResolvedValue({
        id: 'new-review',
        ...createReviewDto,
      });

      const result = await service.createReview(
        userId,
        productId,
        createReviewDto,
      );
      expect(result).toBeDefined();
      expect(reviewRepo.create).toHaveBeenCalled();
      expect(reviewRepo.save).toHaveBeenCalled();
    });
  });

  describe('getReviewsByProduct', () => {
    it('should throw NotFoundException if product not found', async () => {
      productRepo.findOne.mockResolvedValue(null);
      await expect(service.getReviewsByProduct('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return reviews for a product', async () => {
      productRepo.findOne.mockResolvedValue({ id: 'product-id' });
      reviewRepo.find.mockResolvedValue([{ id: 'review-1' }]);

      const result = await service.getReviewsByProduct('product-id');
      expect(result).toHaveLength(1);
    });
  });

  describe('getAverageRating', () => {
    it('should return 0 if no reviews exist with empty breakdown', async () => {
      reviewRepo.find.mockResolvedValue([]);
      const result = await service.getAverageRating('product-id');
      expect(result.average).toBe(0);
      expect(result.count).toBe(0);
      expect(result.breakdown[5].count).toBe(0);
    });

    it('should return calculated average, count, and breakdown', async () => {
      reviewRepo.find.mockResolvedValue([{ rating: 5 }, { rating: 4 }]);
      const result = await service.getAverageRating('product-id');
      expect(result.average).toBe(4.5);
      expect(result.count).toBe(2);
      expect(result.breakdown[5]).toEqual({ count: 1, percentage: 50 });
      expect(result.breakdown[4]).toEqual({ count: 1, percentage: 50 });
      expect(result.breakdown[1].count).toBe(0);
    });
  });

  describe('updateReview', () => {
    const userId = 'user-id';
    const reviewId = 'review-id';
    const updateDto = { rating: 4, comment: 'Updated' };

    it('should throw NotFoundException if review not found', async () => {
      reviewRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateReview(userId, reviewId, updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      reviewRepo.findOne.mockResolvedValue({
        id: reviewId,
        user: { id: 'other-user' },
      });
      await expect(
        service.updateReview(userId, reviewId, updateDto),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update and save the review', async () => {
      const review = { id: reviewId, user: { id: userId }, rating: 5 };
      reviewRepo.findOne.mockResolvedValue(review);
      reviewRepo.save.mockResolvedValue({ ...review, ...updateDto });

      const result = await service.updateReview(userId, reviewId, updateDto);
      expect(result.rating).toBe(4);
      expect(reviewRepo.save).toHaveBeenCalled();
    });
  });

  describe('deleteReview', () => {
    const userId = 'user-id';
    const reviewId = 'review-id';

    it('should throw NotFoundException if review not found', async () => {
      reviewRepo.findOne.mockResolvedValue(null);
      await expect(service.deleteReview(userId, reviewId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      reviewRepo.findOne.mockResolvedValue({
        id: reviewId,
        user: { id: 'other-user' },
      });
      await expect(service.deleteReview(userId, reviewId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should soft remove the review', async () => {
      const review = { id: reviewId, user: { id: userId } };
      reviewRepo.findOne.mockResolvedValue(review);
      await service.deleteReview(userId, reviewId);
      expect(reviewRepo.softRemove).toHaveBeenCalledWith(review);
    });
  });
});

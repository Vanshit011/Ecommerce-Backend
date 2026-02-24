import { Test, TestingModule } from '@nestjs/testing';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';

describe('ReviewController', () => {
  let controller: ReviewController;
  let service: ReviewService;

  const mockReviewService = {
    createReview: jest.fn(),
    getReviewsByProduct: jest.fn(),
    getAverageRating: jest.fn(),
    updateReview: jest.fn(),
    deleteReview: jest.fn(),
  };

  beforeEach(async () => {
    mockReviewService.createReview.mockClear();
    mockReviewService.getReviewsByProduct.mockClear();
    mockReviewService.getAverageRating.mockClear();
    mockReviewService.updateReview.mockClear();
    mockReviewService.deleteReview.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: mockReviewService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ReviewController>(ReviewController);
    service = module.get<ReviewService>(ReviewService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReview', () => {
    it('should call service.createReview', async () => {
      const userId = 'user-id';
      const productId = 'prod-id';
      const dto = { rating: 5, comment: 'test' };

      await controller.createReview(productId, dto, userId);
      expect(service.createReview).toHaveBeenCalledWith(userId, productId, dto);
    });
  });

  describe('getReviewsByProduct', () => {
    it('should call service.getReviewsByProduct', async () => {
      const productId = 'prod-id';
      await controller.getReviewsByProduct(productId);
      expect(service.getReviewsByProduct).toHaveBeenCalledWith(productId);
    });
  });

  describe('getProductStats', () => {
    it('should call service.getAverageRating', async () => {
      const productId = 'prod-id';
      await controller.getProductStats(productId);
      expect(service.getAverageRating).toHaveBeenCalledWith(productId);
    });
  });

  describe('updateReview', () => {
    it('should call service.updateReview', async () => {
      const id = 'rev-id';
      const userId = 'user-id';
      const dto = { rating: 4 };
      await controller.updateReview(id, dto, userId);
      expect(service.updateReview).toHaveBeenCalledWith(userId, id, dto);
    });
  });

  describe('deleteReview', () => {
    it('should call service.deleteReview', async () => {
      const id = 'rev-id';
      const userId = 'user-id';
      await controller.deleteReview(id, userId);
      expect(service.deleteReview).toHaveBeenCalledWith(userId, id);
    });
  });
});

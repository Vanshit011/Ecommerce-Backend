import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';

import { ProductService } from './product.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            create: jest.fn(),
            findAllForAdmin: jest.fn(),
            updateProduct: jest.fn(),
            delete: jest.fn(),
            findAllForUsers: jest.fn(),
            getProductDetails: jest.fn(),
            generateMetadata: jest.fn(),
            createVariant: jest.fn(),
            updateVariant: jest.fn(),
            bulkUpdateVariants: jest.fn(),
            deleteVariant: jest.fn(),
            getRecommendations: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideInterceptor(CacheInterceptor)
      .useValue({ intercept: jest.fn(() => null) })
      .compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call productService.create with dto, files and userId', async () => {
      const dto = { name: 'Product 1', price: 100 } as any;
      const files = [{ originalname: 'img.jpg' }] as any;
      const userId = 'admin-1';
      const expected = { id: 'prod-1', name: 'Product 1' };
      (service.create as jest.Mock).mockResolvedValue(expected);

      const result = await controller.create(dto, files, userId);

      expect(service.create).toHaveBeenCalledWith(dto, files, userId);
      expect(result).toEqual(expected);
    });
  });

  describe('generateMetadata', () => {
    it('should call productService.generateMetadata with dto', async () => {
      const dto = { name: 'Product 1' } as any;
      const expected = { meta_title: 'Product 1', meta_description: 'desc' };
      (service.generateMetadata as jest.Mock).mockResolvedValue(expected);

      const result = await controller.generateMetadata(dto);

      expect(service.generateMetadata).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findMyProducts', () => {
    it('should call productService.findAllForAdmin with userId, page, limit', async () => {
      const userId = 'admin-1';
      const query = { page: 1, limit: 10 } as any;
      const expected = { data: [], total: 0 };
      (service.findAllForAdmin as jest.Mock).mockResolvedValue(expected);

      const result = await controller.findMyProducts(userId, query);

      expect(service.findAllForAdmin).toHaveBeenCalledWith(userId, 1, 10);
      expect(result).toEqual(expected);
    });
  });

  describe('updateProduct', () => {
    it('should call productService.updateProduct with id, dto, files, userId', async () => {
      const id = 'prod-1';
      const dto = { name: 'Updated Product' } as any;
      const files = [] as any;
      const userId = 'admin-1';
      const expected = { id, name: 'Updated Product' };
      (service.updateProduct as jest.Mock).mockResolvedValue(expected);

      const result = await controller.updateProduct(id, dto, files, userId);

      expect(service.updateProduct).toHaveBeenCalledWith(
        id,
        dto,
        files,
        userId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('addVariant', () => {
    it('should call productService.createVariant with productId, dto, userId', async () => {
      const productId = 'prod-1';
      const dto = { size: 'M', color: 'Red', price: 50 } as any;
      const userId = 'admin-1';
      const expected = { id: 'var-1', ...dto };
      (service.createVariant as jest.Mock).mockResolvedValue(expected);

      const result = await controller.addVariant(productId, dto, userId);

      expect(service.createVariant).toHaveBeenCalledWith(
        productId,
        dto,
        userId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateVariant', () => {
    it('should call productService.updateVariant with all params', async () => {
      const productId = 'prod-1';
      const variantId = 'var-1';
      const dto = { price: 60 } as any;
      const userId = 'admin-1';
      const expected = { id: variantId, price: 60 };
      (service.updateVariant as jest.Mock).mockResolvedValue(expected);

      const result = await controller.updateVariant(
        productId,
        variantId,
        dto,
        userId,
      );

      expect(service.updateVariant).toHaveBeenCalledWith(
        productId,
        variantId,
        dto,
        userId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('bulkUpdateVariants', () => {
    it('should call productService.bulkUpdateVariants with productId, variants, userId', async () => {
      const productId = 'prod-1';
      const variants = [{ id: 'var-1', price: 60 }];
      const dto = { variants } as any;
      const userId = 'admin-1';
      const expected = { updated: 1 };
      (service.bulkUpdateVariants as jest.Mock).mockResolvedValue(expected);

      const result = await controller.bulkUpdateVariants(
        productId,
        dto,
        userId,
      );

      expect(service.bulkUpdateVariants).toHaveBeenCalledWith(
        productId,
        variants,
        userId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('deleteVariant', () => {
    it('should call productService.deleteVariant with productId, variantId, userId', async () => {
      const productId = 'prod-1';
      const variantId = 'var-1';
      const userId = 'admin-1';
      const expected = { affected: 1 };
      (service.deleteVariant as jest.Mock).mockResolvedValue(expected);

      const result = await controller.deleteVariant(
        productId,
        variantId,
        userId,
      );

      expect(service.deleteVariant).toHaveBeenCalledWith(
        productId,
        variantId,
        userId,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should call productService.delete with id and userId', async () => {
      const id = 'prod-1';
      const userId = 'admin-1';
      const expected = { affected: 1 };
      (service.delete as jest.Mock).mockResolvedValue(expected);

      const result = await controller.remove(id, userId);

      expect(service.delete).toHaveBeenCalledWith(id, userId);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should call productService.findAllForUsers with query', async () => {
      const query = { page: 1, limit: 10 } as any;
      const expected = { data: [], total: 0 };
      (service.findAllForUsers as jest.Mock).mockResolvedValue(expected);

      const result = await controller.findAll(query);

      expect(service.findAllForUsers).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('getProductDetails', () => {
    it('should call productService.getProductDetails with id', async () => {
      const id = 'prod-1';
      const expected = { id, name: 'Product 1', variants: [] };
      (service.getProductDetails as jest.Mock).mockResolvedValue(expected);

      const result = await controller.getProductDetails(id);

      expect(service.getProductDetails).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('getRecommendations', () => {
    it('should call productService.getRecommendations with id', async () => {
      const id = 'prod-1';
      const expected = [{ id: 'prod-2' }, { id: 'prod-3' }];
      (service.getRecommendations as jest.Mock).mockResolvedValue(expected);

      const result = await controller.getRecommendations(id);

      expect(service.getRecommendations).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';

import { CategoriesService } from './categories.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call categoriesService.create with dto', async () => {
      const dto = { name: 'Electronics' } as any;
      const expected = { id: 'cat-1', name: 'Electronics' };
      (service.create as jest.Mock).mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should call categoriesService.findAll and return tree', async () => {
      const expected = [
        { id: 'cat-1', name: 'Electronics', children: [] },
        { id: 'cat-2', name: 'Clothing', children: [] },
      ];
      (service.findAll as jest.Mock).mockResolvedValue(expected);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should call categoriesService.update with id and dto', async () => {
      const id = 'cat-1';
      const dto = { name: 'Updated Electronics' };
      const expected = { id, name: 'Updated Electronics' };
      (service.update as jest.Mock).mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(service.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('delete', () => {
    it('should call categoriesService.delete with id', async () => {
      const id = 'cat-1';
      const expected = { affected: 1 };
      (service.delete as jest.Mock).mockResolvedValue(expected);

      const result = await controller.delete(id);

      expect(service.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });
});

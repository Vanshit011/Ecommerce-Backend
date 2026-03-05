import { Test, TestingModule } from '@nestjs/testing';
import { AddressController } from './address.controller';

import { AddressService } from './address.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';

describe('AddressController', () => {
  let controller: AddressController;
  let service: AddressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AddressController],
      providers: [
        {
          provide: AddressService,
          useValue: {
            create: jest.fn(),
            getAll: jest.fn(),
            setDefault: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AddressController>(AddressController);
    service = module.get<AddressService>(AddressService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call addressService.create with userId and dto', async () => {
      const dto = {
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        country: 'US',
      } as any;
      const userId = 'user-1';
      const expected = { id: 'addr-1', ...dto, userId };
      (service.create as jest.Mock).mockResolvedValue(expected);

      const result = await controller.create(dto, userId);

      expect(service.create).toHaveBeenCalledWith(userId, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getAll', () => {
    it('should call addressService.getAll with userId', async () => {
      const userId = 'user-1';
      const expected = [{ id: 'addr-1' }, { id: 'addr-2' }];
      (service.getAll as jest.Mock).mockResolvedValue(expected);

      const result = await controller.getAll(userId);

      expect(service.getAll).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });

  describe('setDefault', () => {
    it('should call addressService.setDefault with id and userId', async () => {
      const id = 'addr-1';
      const userId = 'user-1';
      const expected = { id, isDefault: true };
      (service.setDefault as jest.Mock).mockResolvedValue(expected);

      const result = await controller.setDefault(id, userId);

      expect(service.setDefault).toHaveBeenCalledWith(id, userId);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should call addressService.update with id, userId, and dto', async () => {
      const id = 'addr-1';
      const userId = 'user-1';
      const dto = { street: '456 New St' } as any;
      const expected = { id, ...dto };
      (service.update as jest.Mock).mockResolvedValue(expected);

      const result = await controller.update(id, dto, userId);

      expect(service.update).toHaveBeenCalledWith(id, userId, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should call addressService.softDelete with id and userId', async () => {
      const id = 'addr-1';
      const userId = 'user-1';
      const expected = { affected: 1 };
      (service.softDelete as jest.Mock).mockResolvedValue(expected);

      const result = await controller.remove(id, userId);

      expect(service.softDelete).toHaveBeenCalledWith(id, userId);
      expect(result).toEqual(expected);
    });
  });
});

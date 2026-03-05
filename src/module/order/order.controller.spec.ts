import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';

import { OrderService } from './order.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';
import { Status } from '../../shared/constants/enum';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: {
            createFromCart: jest.fn(),
            getUserOrders: jest.fn(),
            getOrderById: jest.fn(),
            cancelOrderByUser: jest.fn(),
            getOrdersForAdmin: jest.fn(),
            updateOrderStatusByAdmin: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call orderService.createFromCart with userId and couponCode', async () => {
      const userId = 'user-1';
      const couponCode = 'SAVE10';
      const expected = { id: 'order-1', total: 100 };
      (service.createFromCart as jest.Mock).mockResolvedValue(expected);

      const result = await controller.create(userId, couponCode);

      expect(service.createFromCart).toHaveBeenCalledWith(userId, couponCode);
      expect(result).toEqual(expected);
    });

    it('should call orderService.createFromCart without couponCode', async () => {
      const userId = 'user-1';
      const expected = { id: 'order-1', total: 100 };
      (service.createFromCart as jest.Mock).mockResolvedValue(expected);

      const result = await controller.create(userId);

      expect(service.createFromCart).toHaveBeenCalledWith(userId, undefined);
      expect(result).toEqual(expected);
    });
  });

  describe('getMyOrders', () => {
    it('should call orderService.getUserOrders with userId', async () => {
      const userId = 'user-1';
      const expected = [{ id: 'order-1' }, { id: 'order-2' }];
      (service.getUserOrders as jest.Mock).mockResolvedValue(expected);

      const result = await controller.getMyOrders(userId);

      expect(service.getUserOrders).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expected);
    });
  });

  describe('getOne', () => {
    it('should call orderService.getOrderById with id and userId', async () => {
      const id = 'order-1';
      const userId = 'user-1';
      const expected = { id, items: [] };
      (service.getOrderById as jest.Mock).mockResolvedValue(expected);

      const result = await controller.getOne(id, userId);

      expect(service.getOrderById).toHaveBeenCalledWith(id, userId);
      expect(result).toEqual(expected);
    });
  });

  describe('cancelOrder', () => {
    it('should call orderService.cancelOrderByUser with id and userId', async () => {
      const id = 'order-1';
      const userId = 'user-1';
      const expected = { message: 'Order cancelled' };
      (service.cancelOrderByUser as jest.Mock).mockResolvedValue(expected);

      const result = await controller.cancelOrder(id, userId);

      expect(service.cancelOrderByUser).toHaveBeenCalledWith(id, userId);
      expect(result).toEqual(expected);
    });
  });

  describe('adminOrders', () => {
    it('should call orderService.getOrdersForAdmin with parsed params', async () => {
      const userId = 'admin-1';
      const query = {
        page: '2',
        limit: '20',
        status: 'pending,shipped',
        paymentStatus: 'paid',
      };
      const expected = { data: [], total: 0 };
      (service.getOrdersForAdmin as jest.Mock).mockResolvedValue(expected);

      const result = await controller.adminOrders(userId, query);

      expect(service.getOrdersForAdmin).toHaveBeenCalledWith(userId, {
        page: 2,
        limit: 20,
        status: ['pending', 'shipped'],
        paymentStatus: ['paid'],
      });
      expect(result).toEqual(expected);
    });

    it('should use default page and limit when not provided', async () => {
      const userId = 'admin-1';
      const query = {};
      const expected = { data: [], total: 0 };
      (service.getOrdersForAdmin as jest.Mock).mockResolvedValue(expected);

      const result = await controller.adminOrders(userId, query);

      expect(service.getOrdersForAdmin).toHaveBeenCalledWith(userId, {
        page: 1,
        limit: 10,
        status: undefined,
        paymentStatus: undefined,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('updateOrderStatus', () => {
    it('should call orderService.updateOrderStatusByAdmin', async () => {
      const userId = 'admin-1';
      const orderId = 'order-1';
      const status = Status.SHIPPED;
      const expected = { id: orderId, status: Status.SHIPPED };
      (service.updateOrderStatusByAdmin as jest.Mock).mockResolvedValue(
        expected,
      );

      const result = await controller.updateOrderStatus(
        userId,
        orderId,
        status,
      );

      expect(service.updateOrderStatusByAdmin).toHaveBeenCalledWith(
        orderId,
        userId,
        status,
      );
      expect(result).toEqual(expected);
    });
  });
});

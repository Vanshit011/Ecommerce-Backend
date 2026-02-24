import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';

import { OrderService } from './order.service';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesGuard } from '../../core/guard/roles.guard';

describe('OrderController', () => {
  let controller: OrderController;
  // let service: OrderService;

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
    // service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

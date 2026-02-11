import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Payment } from './entity/payments.entity';
import { Order } from '../order/entity/order.entity';
import { StripeService } from '../../core/stripe/stripe.service';
import { OrderService } from '../order/order.service';
// import { Repository } from 'typeorm';

describe('PaymentsService', () => {
  let service: PaymentsService;
  // let paymentRepo: Repository<Payment>;
  // let orderRepo: Repository<Order>;
  // let stripeService: StripeService;
  // let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: StripeService,
          useValue: {
            getClient: jest.fn(),
          },
        },
        {
          provide: OrderService,
          useValue: {
            handlePaymentSuccess: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    // paymentRepo = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    // orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
    // stripeService = module.get<StripeService>(StripeService);
    // orderService = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

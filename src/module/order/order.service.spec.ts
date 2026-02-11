import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';

import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entity/order.entity';
import { OrderItem } from './entity/order-item.entity';
import { Address } from '../address/entity/address.entity';
import { CartService } from '../cart/cart.service';
import { Payment } from '../payments/entity/payments.entity';
import { StripeService } from '../../core/stripe/stripe.service';
import { Repository } from 'typeorm';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepo: Repository<Order>;
  let orderItemRepo: Repository<OrderItem>;
  let addressRepo: Repository<Address>;
  let cartService: CartService;
  let paymentRepo: Repository<Payment>;
  let stripeService: StripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn(),
              getOne: jest.fn(),
            })),
            manager: {
              transaction: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Address),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: CartService,
          useValue: {
            getMyCart: jest.fn(),
            clearCart: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Payment),
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
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepo = module.get<Repository<Order>>(getRepositoryToken(Order));
    orderItemRepo = module.get<Repository<OrderItem>>(
      getRepositoryToken(OrderItem),
    );
    addressRepo = module.get<Repository<Address>>(getRepositoryToken(Address));
    cartService = module.get<CartService>(CartService);
    paymentRepo = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    stripeService = module.get<StripeService>(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { WebhookController } from './webhook.controller';

import { StripeService } from '../../core/stripe/stripe.service';
import { OrderService } from '../order/order.service';
import { PaymentsService } from '../payments/payments.service';

describe('WebhookController', () => {
  let controller: WebhookController;
  // let stripeService: StripeService;
  // let orderService: OrderService;
  // let paymentsService: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        {
          provide: StripeService,
          useValue: {
            getClient: jest.fn(() => ({
              webhooks: {
                constructEvent: jest.fn(),
              },
            })),
          },
        },
        {
          provide: OrderService,
          useValue: {
            handlePaymentSuccess: jest.fn(),
            markFailedByOrderId: jest.fn(),
          },
        },
        {
          provide: PaymentsService,
          useValue: {
            markFailed: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WebhookController>(WebhookController);
    // stripeService = module.get<StripeService>(StripeService);
    // orderService = module.get<OrderService>(OrderService);
    // paymentsService = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

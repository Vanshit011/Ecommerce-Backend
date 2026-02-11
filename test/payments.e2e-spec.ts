import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import {
  cleanDatabase,
  createTestUsers,
  createTestCategory,
  createTestProduct,
  TEST_USERS,
  setupApp,
} from './test-helpers';
import { Status } from '../src/shared/constants/enum';
import { StripeService } from '../src/core/stripe/stripe.service';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  let orderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(StripeService)
      .useValue({
        getClient: () => ({
          paymentIntents: {
            create: jest.fn().mockResolvedValue({
              id: 'pi_test_123',
              client_secret: 'secret_123',
            }),
            retrieve: jest.fn().mockResolvedValue({
              id: 'pi_test_123',
              client_secret: 'secret_123',
              status: 'requires_payment_method',
            }),
          },
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    dataSource = app.get(DataSource);
    await cleanDatabase(dataSource);
    await createTestUsers(dataSource);

    // Create test product and order
    const category = await createTestCategory(dataSource, 'Electronics');
    const product = await createTestProduct(
      dataSource,
      TEST_USERS.admin.id,
      category.id,
    );

    // Login as user
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TEST_USERS.user.email,
        password: TEST_USERS.user.password,
      })
      .expect(201);

    userToken = loginResponse.body.accessToken;

    // Create address
    await request(app.getHttpServer())
      .post('/address')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        full_name: 'Test User',
        address_line_1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        postal_code: '10001',
        country: 'Test Country',
      })
      .expect(201);

    // Add to cart and create order
    await request(app.getHttpServer())
      .post(`/cart/${product.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 1 })
      .expect(201);

    const orderResponse = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);

    orderId = orderResponse.body.id;
  });

  afterAll(async () => {
    await cleanDatabase(dataSource);
    await app.close();
  });

  describe('POST /payments/order/:id', () => {
    it('should create payment intent for order', async () => {
      const response = await request(app.getHttpServer())
        .post(`/payments/order/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('clientSecret');
      expect(response.body).toHaveProperty('payment_intent_id');
    });

    it('should fail with non-existent order', async () => {
      await request(app.getHttpServer())
        .post('/payments/order/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/payments/order/${orderId}`)
        .expect(401);
    });

    it('should fail with already paid order', async () => {
      // Mark order as paid
      const orderRepo = dataSource.getRepository('Order');
      await orderRepo.update(orderId, { status: Status.CONFIRMED });

      await request(app.getHttpServer())
        .post(`/payments/order/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });
  });

  describe('GET /payments/my', () => {
    it('should get user payments', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments/my')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/payments/my').expect(401);
    });
  });
});

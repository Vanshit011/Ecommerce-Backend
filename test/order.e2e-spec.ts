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

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  let adminToken: string;
  let productId: string;
  let orderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();

    dataSource = app.get(DataSource);
    await cleanDatabase(dataSource);
    await createTestUsers(dataSource);

    // Create test product
    const category = await createTestCategory(dataSource, 'Electronics');
    const product = await createTestProduct(
      dataSource,
      TEST_USERS.admin.id,
      category.id,
    );
    productId = product.id;

    // Login as user
    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TEST_USERS.user.email,
        password: TEST_USERS.user.password,
      })
      .expect(201);

    userToken = userLoginResponse.body.accessToken;

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      })
      .expect(201);

    adminToken = adminLoginResponse.body.accessToken;

    // Create address
    await request(app.getHttpServer())
      .post('/address')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        full_name: 'Test User',
        address_line_1: '123 Main St',
        city: 'Mumbai',
        state: 'MH',
        postal_code: '400001',
        country: 'India',
        is_default: true,
      })
      .expect(201);

    // Add product to cart
    await request(app.getHttpServer())
      .post(`/cart/${productId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 2 })
      .expect(201);
  });

  afterAll(async () => {
    await cleanDatabase(dataSource);
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create order from cart', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.total_amount).toBeDefined();
      expect(response.body).toHaveProperty('status');
      orderId = response.body.id;
    });

    it('should fail with empty cart', async () => {
      // Clear cart first
      await request(app.getHttpServer())
        .delete('/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).post('/orders').expect(401);
    });
  });

  describe('GET /orders/my', () => {
    it('should get user orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/my')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/orders/my').expect(401);
    });
  });

  describe('GET /orders/:id', () => {
    it('should get single order', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(orderId);
      expect(response.body).toHaveProperty('items');
    });

    it('should fail with non-existent order', async () => {
      await request(app.getHttpServer())
        .get('/orders/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PATCH /orders/:id/cancel', () => {
    it('should cancel order', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe(Status.CANCELLED);
    });

    it('should fail with non-existent order', async () => {
      await request(app.getHttpServer())
        .patch('/orders/00000000-0000-0000-0000-000000000099/cancel')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('GET /orders/admin/orders (Admin)', () => {
    beforeAll(async () => {
      // Create a new order for admin tests
      await request(app.getHttpServer())
        .post(`/cart/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 })
        .expect(201);

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);
    });

    it('should get all orders for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter orders by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ status: `${Status.PENDING},${Status.CONFIRMED}` })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should fail without admin role', async () => {
      await request(app.getHttpServer())
        .get('/orders/admin/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('PATCH /orders/:id/status (Admin)', () => {
    let testOrderId: string;

    beforeAll(async () => {
      // Create order for status update test
      await request(app.getHttpServer())
        .post(`/cart/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 })
        .expect(201);

      const orderResponse = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      testOrderId = orderResponse.body.id;
    });

    it('should update order status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: Status.CONFIRMED })
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('confirmed');
    });

    it('should fail without admin role', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: Status.SHIPPED })
        .expect(403);
    });

    it('should fail with invalid status', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });
});

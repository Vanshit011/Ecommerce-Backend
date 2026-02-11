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
} from './test-helpers';

describe('CartController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await cleanDatabase(dataSource);
    await createTestUsers(dataSource);

    // Create test category and product
    const category = await createTestCategory(dataSource, 'Electronics');
    const product = await createTestProduct(
      dataSource,
      TEST_USERS.admin.id,
      category.id,
    );
    productId = product.id;

    // Login as user to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TEST_USERS.user.email,
        password: TEST_USERS.user.password,
      })
      .expect(201);

    userToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await cleanDatabase(dataSource);
    await app.close();
  });

  describe('POST /cart/:productId', () => {
    it('should add product to cart', async () => {
      const response = await request(app.getHttpServer())
        .post(`/cart/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 2,
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail with non-existent product', async () => {
      await request(app.getHttpServer())
        .post('/cart/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 1,
        })
        .expect(404);
    });

    it('should fail with invalid quantity', async () => {
      await request(app.getHttpServer())
        .post(`/cart/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 0, // Invalid quantity
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/cart/${productId}`)
        .send({
          quantity: 1,
        })
        .expect(401);
    });
  });

  describe('GET /cart', () => {
    it('should get user cart', async () => {
      const response = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/cart').expect(401);
    });
  });

  describe('POST /cart/:productId/:qty', () => {
    it('should update cart item quantity', async () => {
      const response = await request(app.getHttpServer())
        .post(`/cart/${productId}/5`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail with invalid quantity', async () => {
      await request(app.getHttpServer())
        .post(`/cart/${productId}/0`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should fail with non-existent product', async () => {
      await request(app.getHttpServer())
        .post('/cart/00000000-0000-0000-0000-000000000099/3')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('DELETE /cart', () => {
    it('should clear cart', async () => {
      const response = await request(app.getHttpServer())
        .delete('/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('cleared');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).delete('/cart').expect(401);
    });
  });
});

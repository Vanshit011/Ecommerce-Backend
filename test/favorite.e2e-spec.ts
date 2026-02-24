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

describe('FavoriteController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  let productId: string;

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

  describe('POST /favorites/:id', () => {
    it('should add product to favorites', async () => {
      const response = await request(app.getHttpServer())
        .post(`/favorites/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/added/i);
    });

    it('should fail with non-existent product', async () => {
      await request(app.getHttpServer())
        .post('/favorites/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post(`/favorites/${productId}`)
        .expect(401);
    });
  });

  describe('GET /favorites', () => {
    it('should get all user favorites', async () => {
      const response = await request(app.getHttpServer())
        .get('/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/favorites').expect(401);
    });
  });

  describe('DELETE /favorites/:id', () => {
    it('should remove product from favorites', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/favorites/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/removed/i);
    });

    it('should fail with non-existent product', async () => {
      await request(app.getHttpServer())
        .delete('/favorites/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/favorites/${productId}`)
        .expect(401);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import {
  cleanDatabase,
  createTestUsers,
  createTestCategory,
  TEST_USERS,
} from './test-helpers';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let categoryId: string;
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

    // Create test category
    const category = await createTestCategory(dataSource, 'Electronics');
    categoryId = category.id;

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      })
      .expect(201);

    adminToken = adminLoginResponse.body.accessToken;

    // Login as user
    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: TEST_USERS.user.email,
        password: TEST_USERS.user.password,
      })
      .expect(201);

    userToken = userLoginResponse.body.accessToken;
  });

  afterAll(async () => {
    await cleanDatabase(dataSource);
    await app.close();
  });

  describe('POST /products (Admin)', () => {
    it('should create a new product', async () => {
      const response = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'Test Product')
        .field('description', 'Test product description')
        .field('price', '99.99')
        .field('sku', 'TEST-SKU-001')
        .field('stock_qty', '100')
        .field('availability', 'INSTOCK')
        .field('category_id', categoryId)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Test Product');
      expect(Number(response.body.price)).toBe(99.99);
      productId = response.body.id;
    });

    it('should fail without admin role', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .field('name', 'Test Product')
        .field('price', '50')
        .expect(403);
    });

    it('should fail with invalid data', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', '')
        .field('price', '-10')
        .expect(400);
    });
  });

  describe('GET /products/my-products (Admin)', () => {
    it('should get admin products with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/products/my-products')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail without admin role', async () => {
      await request(app.getHttpServer())
        .get('/products/my-products')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('PUT /products/:id (Admin)', () => {
    it('should update a product', async () => {
      const response = await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'Updated Product')
        .field('description', 'Updated description')
        .field('sku', 'TEST-SKU-001')
        .field('price', '149.99')
        .field('category_id', categoryId)
        .field('availability', 'INSTOCK')
        .expect(200);

      expect(response.body.name).toBe('Updated Product');
      expect(Number(response.body.price)).toBe(149.99);
    });

    it('should fail with non-existent product', async () => {
      await request(app.getHttpServer())
        .put('/products/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'Test')
        .field('description', 'Test')
        .field('sku', 'TEST')
        .field('price', '10')
        .field('category_id', categoryId)
        .expect(404); // Expect 404 for valid UUID format but non-existent
    });

    it('should fail without admin role', async () => {
      await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .field('name', 'Hacked')
        .expect(403);
    });
  });

  describe('DELETE /products/:id (Admin)', () => {
    it('should delete a product', async () => {
      // Create a product to delete
      const createResponse = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('name', 'To Delete')
        .field('description', 'Will be deleted')
        .field('price', '25')
        .field('sku', 'DELETE-SKU')
        .field('stock_qty', '10')
        .field('availability', 'INSTOCK')
        .field('category_id', categoryId)
        .expect(201);

      const deleteId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/products/${deleteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should fail without admin role', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /products (User)', () => {
    it('should get all products with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter products by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ category_id: categoryId })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });

    it('should search products by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ search: 'Updated' })
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /products/:id (User)', () => {
    it('should get product details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(productId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
    });

    it('should fail with non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/products/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});

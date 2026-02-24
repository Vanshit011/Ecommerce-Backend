import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import {
  cleanDatabase,
  createTestUsers,
  setupApp,
  TEST_USERS,
} from './test-helpers';

describe('AddressController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;
  let addressId: string;

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

  describe('POST /address', () => {
    it('should create a new address', async () => {
      const response = await request(app.getHttpServer())
        .post('/address')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          full_name: 'John Doe',
          address_line_1: '123 Main St',
          address_line_2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'USA',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.address_line_1).toBe('123 Main St');
      expect(response.body.city).toBe('New York');
      addressId = response.body.id;
    });

    it('should fail with duplicate address', async () => {
      await request(app.getHttpServer())
        .post('/address')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          address_line_1: '123 Main St',
          address_line_2: 'Apt 4B',
          city: 'New York',
          state: 'NY',
          postal_code: '10001',
          country: 'USA',
        })
        .expect(400);
    });

    it('should fail with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/address')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          address_line_1: '456 Oak Ave',
        })
        .expect(400);
    });
  });

  describe('GET /address', () => {
    it('should get all user addresses', async () => {
      const response = await request(app.getHttpServer())
        .get('/address')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/address').expect(401);
    });
  });

  describe('PUT /address/:id/default', () => {
    it('should set address as default', async () => {
      const response = await request(app.getHttpServer())
        .put(`/address/${addressId}/default`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Default address updated');
    });

    it('should fail with non-existent address', async () => {
      await request(app.getHttpServer())
        .put('/address/00000000-0000-0000-0000-000000000099/default')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PUT /address/:id', () => {
    it('should update an address', async () => {
      const response = await request(app.getHttpServer())
        .put(`/address/${addressId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          address_line_1: '123 Main Street',
          city: 'New York City',
        })
        .expect(200);

      expect(response.body.address_line_1).toBe('123 Main Street');
      expect(response.body.city).toBe('New York City');
    });

    it('should fail with non-existent address', async () => {
      await request(app.getHttpServer())
        .put('/address/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          city: 'Test',
        })
        .expect(404);
    });
  });

  describe('DELETE /address/:id', () => {
    it('should soft delete an address', async () => {
      // Create a new address to delete
      const createResponse = await request(app.getHttpServer())
        .post('/address')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          full_name: 'Jane Doe',
          address_line_1: '789 Delete St',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'USA',
        })
        .expect(201);

      const deleteId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/address/${deleteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');
    });

    it('should fail with non-existent address', async () => {
      await request(app.getHttpServer())
        .delete('/address/00000000-0000-0000-0000-000000000099')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});

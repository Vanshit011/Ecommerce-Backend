import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { cleanDatabase, createTestUsers, TEST_USERS } from './test-helpers';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await cleanDatabase(dataSource);
  });

  afterAll(async () => {
    await cleanDatabase(dataSource);
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'New User',
          email: 'newuser@test.com',
          password: 'Password@123',
          mobile: '1112223333',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });

    it('should fail with duplicate email', async () => {
      // Register first user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'User One',
          email: 'duplicate@test.com',
          password: 'Password@123',
          mobile: '2223334444',
        })
        .expect(201);

      // Try to register with same email
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'User Two',
          email: 'duplicate@test.com',
          password: 'Password@456',
          mobile: '3334445555',
        })
        .expect(400);
    });

    it('should fail with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password@123',
          mobile: '4445556666',
        })
        .expect(400);
    });

    it('should fail with weak password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: '123', // Too weak
          mobile: '5556667777',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeAll(async () => {
      await createTestUsers(dataSource);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USERS.user.email,
          password: TEST_USERS.user.password,
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(TEST_USERS.user.email);
    });

    it('should fail with invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USERS.user.email,
          password: 'WrongPassword@123',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password@123',
        })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      // Login first
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: TEST_USERS.user.email,
          password: TEST_USERS.user.password,
        })
        .expect(201);

      const token = loginResponse.body.accessToken;

      // Logout
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Logged out');
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send OTP for password reset', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: TEST_USERS.user.email,
        })
        .expect(201);
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com',
        })
        .expect(400);
    });
  });
});

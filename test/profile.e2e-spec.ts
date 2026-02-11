import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { cleanDatabase, createTestUsers, TEST_USERS } from './test-helpers';

describe('ProfileController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  describe('GET /profile', () => {
    it('should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toBe(TEST_USERS.user.email);
      expect(response.body).toHaveProperty('mobile');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer()).get('/profile').expect(401);
    });
  });

  describe('PUT /profile', () => {
    it('should update user profile', async () => {
      await request(app.getHttpServer())
        .put('/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          mobile: '9999999999',
        })
        .expect(200);
    });

    it('should fail with invalid mobile number', async () => {
      await request(app.getHttpServer())
        .put('/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          mobile: '123', // Too short
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .put('/profile')
        .send({
          name: 'Test',
        })
        .expect(401);
    });
  });
});

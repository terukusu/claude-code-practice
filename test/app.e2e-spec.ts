import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ConfigModule } from '@nestjs/config';
import { TestDatabaseFactory } from '../src/infrastructure/persistence/drizzle/test-database.factory';
import { DATABASE_CONNECTION } from '../src/infrastructure/persistence/drizzle/database.module';

describe('Application (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Create test database
    const testDb = TestDatabaseFactory.create();
    await TestDatabaseFactory.setupTestDatabase(testDb);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    })
      .overrideProvider(DATABASE_CONNECTION)
      .useValue(testDb)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health Check Endpoints', () => {
    it('/ (GET)', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World! Welcome to NestJS 🚀');
    });

    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
        });
    });

    it('/api/hello (GET)', () => {
      return request(app.getHttpServer())
        .get('/api/hello')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message', 'Hello NestJS! 🎉');
          expect(res.body).toHaveProperty('version', '1.0.0');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('Users API (e2e)', () => {
    let createdUserId: string;

    it('/users (POST) - should create user', () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        bio: 'Test bio',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(userData.email);
          expect(res.body.name).toBe(userData.name);
          expect(res.body.bio).toBe(userData.bio);
          expect(res.body.isActive).toBe(true);
          createdUserId = res.body.id;
        });
    });

    it('/users (GET) - should return all users', async () => {
      // First create a user
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(userData);

      return request(app.getHttpServer())
        .get('/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('email');
          expect(res.body[0]).toHaveProperty('name');
        });
    });

    it('/users/:id (GET) - should return specific user', async () => {
      // First create a user
      const userData = {
        email: 'specific@example.com',
        name: 'Specific User',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(userData);

      const userId = createResponse.body.id;

      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.email).toBe(userData.email);
          expect(res.body.name).toBe(userData.name);
        });
    });

    it('/users/:id (GET) - should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);
    });

    it('/users/:id (PATCH) - should update user', async () => {
      // First create a user
      const userData = {
        email: 'update@example.com',
        name: 'Original Name',
        bio: 'Original bio',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(userData);

      const userId = createResponse.body.id;
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      return request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.name).toBe(updateData.name);
          expect(res.body.bio).toBe(updateData.bio);
          expect(res.body.email).toBe(userData.email); // Should remain unchanged
        });
    });

    it('/users/:id (DELETE) - should delete user', async () => {
      // First create a user
      const userData = {
        email: 'delete@example.com',
        name: 'Delete User',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send(userData);

      const userId = createResponse.body.id;

      // Delete the user
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(200);

      // Verify user is deleted
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(404);
    });

    it('/users (POST) - should validate required fields', () => {
      const invalidUserData = {
        // Missing required email and name
        bio: 'Just bio',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(invalidUserData)
        .expect(400);
    });

    it('/users (POST) - should validate email format', () => {
      const invalidUserData = {
        email: 'invalid-email',
        name: 'Test User',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(invalidUserData)
        .expect(400);
    });

    it('/users (POST) - should enforce email uniqueness', async () => {
      const userData = {
        email: 'unique@example.com',
        name: 'First User',
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/users')
        .send(userData);

      // Try to create second user with same email
      const duplicateUserData = {
        email: 'unique@example.com',
        name: 'Second User',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(duplicateUserData)
        .expect(500); // Should fail due to unique constraint
    });
  });
});
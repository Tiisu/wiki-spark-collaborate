import request from 'supertest';
import app from '../server';
import User from '../models/User';
import mongoose from 'mongoose';

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Tests will use mongodb-memory-server from setup.ts
  });

  afterAll(async () => {
    // Cleanup handled by setup.ts
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe('LEARNER');
      expect(response.body.data.token).toBeDefined();
    });

    it('should not register user with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not register user with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Role-based Access Control', () => {
    let learnerToken: string;
    let instructorToken: string;
    let adminToken: string;

    beforeEach(async () => {
      // Create users with different roles
      const learnerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'learner@example.com',
          password: 'TestPassword123!',
          firstName: 'Learner',
          lastName: 'User',
          username: 'learner'
        });
      learnerToken = learnerResponse.body.data.token;

      // Create instructor (would need admin to promote in real scenario)
      const instructor = new User({
        email: 'instructor@example.com',
        password: 'TestPassword123!',
        firstName: 'Instructor',
        lastName: 'User',
        username: 'instructor',
        role: 'INSTRUCTOR'
      });
      await instructor.save();

      const instructorLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'instructor@example.com',
          password: 'TestPassword123!'
        });
      instructorToken = instructorLogin.body.data.token;

      // Create admin
      const admin = new User({
        email: 'admin@example.com',
        password: 'TestPassword123!',
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        role: 'ADMIN'
      });
      await admin.save();

      const adminLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'TestPassword123!'
        });
      adminToken = adminLogin.body.data.token;
    });

    it('should allow instructor to access instructor routes', async () => {
      const response = await request(app)
        .get('/api/courses/instructor')
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should deny learner access to instructor routes', async () => {
      await request(app)
        .get('/api/courses/instructor')
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(403);
    });

    it('should allow admin to access admin routes', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

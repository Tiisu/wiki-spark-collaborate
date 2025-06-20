import request from 'supertest';
import app from '../server';
import User from '../models/User';
import Course from '../models/Course';
import Module from '../models/Module';
import Lesson from '../models/Lesson';
import mongoose from 'mongoose';

describe('Course Management Tests', () => {
  let instructorToken: string;
  let adminToken: string;
  let learnerToken: string;
  let instructorId: string;
  let courseId: string;

  beforeAll(async () => {
    // Tests will use mongodb-memory-server from setup.ts
  });

  afterAll(async () => {
    // Cleanup handled by setup.ts
  });

  beforeEach(async () => {
    // Clean up
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});

    // Create test users
    const instructor = new User({
      email: 'instructor@example.com',
      password: 'TestPassword123!',
      firstName: 'Instructor',
      lastName: 'User',
      username: 'instructor',
      role: 'INSTRUCTOR'
    });
    await instructor.save();
    instructorId = instructor._id.toString();

    const admin = new User({
      email: 'admin@example.com',
      password: 'TestPassword123!',
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      role: 'ADMIN'
    });
    await admin.save();

    const learner = new User({
      email: 'learner@example.com',
      password: 'TestPassword123!',
      firstName: 'Learner',
      lastName: 'User',
      username: 'learner',
      role: 'LEARNER'
    });
    await learner.save();

    // Get tokens
    const instructorLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'instructor@example.com', password: 'TestPassword123!' });
    instructorToken = instructorLogin.body.data.token;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'TestPassword123!' });
    adminToken = adminLogin.body.data.token;

    const learnerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'learner@example.com', password: 'TestPassword123!' });
    learnerToken = learnerLogin.body.data.token;
  });

  describe('Course Creation', () => {
    it('should allow instructor to create course', async () => {
      const courseData = {
        title: 'Introduction to Wikipedia Editing',
        description: 'Learn the basics of Wikipedia editing',
        level: 'BEGINNER',
        category: 'EDITING_BASICS',
        tags: ['wikipedia', 'editing', 'beginner'],
        wikipediaProject: 'WIKIPEDIA',
        learningObjectives: ['Learn basic editing', 'Understand policies']
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course.title).toBe(courseData.title);
      expect(response.body.data.course.instructor).toBe(instructorId);
      expect(response.body.data.course.isPublished).toBe(false);
      courseId = response.body.data.course._id;
    });

    it('should allow admin to create course', async () => {
      const courseData = {
        title: 'Advanced Wikipedia Editing',
        description: 'Advanced editing techniques',
        level: 'ADVANCED',
        category: 'CONTENT_CREATION',
        tags: ['wikipedia', 'advanced']
      };

      const response = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(courseData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course.title).toBe(courseData.title);
    });

    it('should not allow learner to create course', async () => {
      const courseData = {
        title: 'Unauthorized Course',
        description: 'This should fail',
        level: 'BEGINNER',
        category: 'EDITING_BASICS'
      };

      await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${learnerToken}`)
        .send(courseData)
        .expect(403);
    });
  });

  describe('Course Hierarchical Structure', () => {
    beforeEach(async () => {
      // Create a test course
      const course = new Course({
        title: 'Test Course',
        description: 'Test Description',
        instructor: instructorId,
        level: 'BEGINNER',
        category: 'EDITING_BASICS'
      });
      await course.save();
      courseId = course._id.toString();
    });

    it('should create module within course', async () => {
      const moduleData = {
        title: 'Introduction Module',
        description: 'Getting started with Wikipedia',
        order: 1
      };

      const response = await request(app)
        .post(`/api/courses/${courseId}/modules`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(moduleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.module.title).toBe(moduleData.title);
      expect(response.body.data.module.course.toString()).toBe(courseId);
    });

    it('should create lesson within module', async () => {
      // First create a module
      const module = new Module({
        title: 'Test Module',
        description: 'Test Module Description',
        course: courseId,
        order: 1
      });
      await module.save();

      const lessonData = {
        title: 'First Lesson',
        description: 'Introduction lesson',
        content: 'Welcome to Wikipedia editing!',
        type: 'TEXT',
        order: 1,
        duration: 30
      };

      const response = await request(app)
        .post(`/api/courses/${courseId}/modules/${module._id}/lessons`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .send(lessonData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.lesson.title).toBe(lessonData.title);
      expect(response.body.data.lesson.type).toBe('TEXT');
    });
  });

  describe('Course Publishing', () => {
    beforeEach(async () => {
      const course = new Course({
        title: 'Test Course',
        description: 'Test Description',
        instructor: instructorId,
        level: 'BEGINNER',
        category: 'EDITING_BASICS'
      });
      await course.save();
      courseId = course._id.toString();
    });

    it('should toggle course publish status', async () => {
      const response = await request(app)
        .patch(`/api/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${instructorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.course.isPublished).toBe(true);
    });

    it('should not allow learner to publish course', async () => {
      await request(app)
        .patch(`/api/courses/${courseId}/publish`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(403);
    });
  });

  describe('Course Search and Filtering', () => {
    beforeEach(async () => {
      // Create multiple test courses
      const courses = [
        {
          title: 'Wikipedia Editing Basics',
          description: 'Learn basic editing',
          instructor: instructorId,
          level: 'BEGINNER',
          category: 'EDITING_BASICS',
          isPublished: true,
          status: 'PUBLISHED'
        },
        {
          title: 'Advanced Content Creation',
          description: 'Create quality content',
          instructor: instructorId,
          level: 'ADVANCED',
          category: 'CONTENT_CREATION',
          isPublished: true,
          status: 'PUBLISHED'
        }
      ];

      await Course.insertMany(courses);
    });

    it('should search courses by title', async () => {
      const response = await request(app)
        .get('/api/courses?search=Wikipedia')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses.length).toBeGreaterThan(0);
      expect(response.body.data.courses[0].title).toContain('Wikipedia');
    });

    it('should filter courses by category', async () => {
      const response = await request(app)
        .get('/api/courses?category=EDITING_BASICS')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses.length).toBeGreaterThan(0);
      expect(response.body.data.courses[0].category).toBe('EDITING_BASICS');
    });

    it('should filter courses by level', async () => {
      const response = await request(app)
        .get('/api/courses?level=BEGINNER')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.courses.length).toBeGreaterThan(0);
      expect(response.body.data.courses[0].level).toBe('BEGINNER');
    });
  });
});

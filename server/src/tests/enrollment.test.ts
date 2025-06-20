import request from 'supertest';
import app from '../server';
import User from '../models/User';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import Progress from '../models/Progress';
import Module from '../models/Module';
import Lesson from '../models/Lesson';
import mongoose from 'mongoose';

describe('Student Enrollment and Progress Tests', () => {
  let learnerToken: string;
  let instructorToken: string;
  let learnerId: string;
  let instructorId: string;
  let courseId: string;
  let moduleId: string;
  let lessonId: string;

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
    await Enrollment.deleteMany({});
    await Progress.deleteMany({});
    await Module.deleteMany({});
    await Lesson.deleteMany({});

    // Create test users
    const learner = new User({
      email: 'learner@example.com',
      password: 'TestPassword123!',
      firstName: 'Learner',
      lastName: 'User',
      username: 'learner',
      role: 'LEARNER'
    });
    await learner.save();
    learnerId = learner._id.toString();

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

    // Get tokens
    const learnerLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'learner@example.com', password: 'TestPassword123!' });
    learnerToken = learnerLogin.body.data.token;

    const instructorLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'instructor@example.com', password: 'TestPassword123!' });
    instructorToken = instructorLogin.body.data.token;

    // Create test course with content
    const course = new Course({
      title: 'Test Course',
      description: 'Test Description',
      instructor: instructorId,
      level: 'BEGINNER',
      category: 'EDITING_BASICS',
      isPublished: true,
      status: 'PUBLISHED'
    });
    await course.save();
    courseId = course._id.toString();

    // Create module
    const module = new Module({
      title: 'Test Module',
      description: 'Test Module Description',
      course: courseId,
      order: 1,
      isPublished: true
    });
    await module.save();
    moduleId = module._id.toString();

    // Create lesson
    const lesson = new Lesson({
      title: 'Test Lesson',
      description: 'Test Lesson Description',
      content: 'Test lesson content',
      type: 'TEXT',
      order: 1,
      module: moduleId,
      course: courseId,
      duration: 30,
      isPublished: true
    });
    await lesson.save();
    lessonId = lesson._id.toString();
  });

  describe('Course Enrollment', () => {
    it('should allow student to enroll in published course', async () => {
      const response = await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.enrollment.student.toString()).toBe(learnerId);
      expect(response.body.data.enrollment.course.toString()).toBe(courseId);
      expect(response.body.data.enrollment.status).toBe('ACTIVE');
    });

    it('should not allow duplicate enrollment', async () => {
      // First enrollment
      await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(201);

      // Second enrollment should fail
      await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(400);
    });

    it('should not allow enrollment in unpublished course', async () => {
      // Create unpublished course
      const unpublishedCourse = new Course({
        title: 'Unpublished Course',
        description: 'Not published yet',
        instructor: instructorId,
        level: 'BEGINNER',
        category: 'EDITING_BASICS',
        isPublished: false
      });
      await unpublishedCourse.save();

      await request(app)
        .post(`/api/courses/${unpublishedCourse._id}/enroll`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(400);
    });
  });

  describe('Progress Tracking', () => {
    beforeEach(async () => {
      // Enroll student in course
      await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(201);
    });

    it('should track lesson progress', async () => {
      const progressData = {
        status: 'COMPLETED',
        timeSpent: 1800, // 30 minutes
        completionPercentage: 100
      };

      const response = await request(app)
        .post(`/api/courses/${courseId}/lessons/${lessonId}/progress`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send(progressData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.progress.status).toBe('COMPLETED');
      expect(response.body.data.progress.completionPercentage).toBe(100);
    });

    it('should update existing progress', async () => {
      // Create initial progress
      await request(app)
        .post(`/api/courses/${courseId}/lessons/${lessonId}/progress`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({ status: 'IN_PROGRESS', completionPercentage: 50 })
        .expect(201);

      // Update progress
      const response = await request(app)
        .post(`/api/courses/${courseId}/lessons/${lessonId}/progress`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({ status: 'COMPLETED', completionPercentage: 100 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.progress.status).toBe('COMPLETED');
    });

    it('should get student progress for course', async () => {
      // Create some progress
      await request(app)
        .post(`/api/courses/${courseId}/lessons/${lessonId}/progress`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({ status: 'COMPLETED', completionPercentage: 100 })
        .expect(201);

      const response = await request(app)
        .get(`/api/courses/${courseId}/progress`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.progress).toBeDefined();
      expect(response.body.data.progress.length).toBeGreaterThan(0);
    });
  });

  describe('Quiz Functionality', () => {
    let quizLessonId: string;

    beforeEach(async () => {
      // Create quiz lesson
      const quizLesson = new Lesson({
        title: 'Quiz Lesson',
        description: 'Test your knowledge',
        content: JSON.stringify({
          questions: [
            {
              id: '1',
              type: 'MULTIPLE_CHOICE',
              question: 'What is Wikipedia?',
              options: ['Encyclopedia', 'Social Media', 'Search Engine', 'Blog'],
              correctAnswer: 0,
              points: 10
            },
            {
              id: '2',
              type: 'TRUE_FALSE',
              question: 'Wikipedia is free to edit',
              correctAnswer: true,
              points: 5
            }
          ],
          passingScore: 70,
          timeLimit: 600
        }),
        type: 'QUIZ',
        order: 2,
        module: moduleId,
        course: courseId,
        duration: 10,
        isPublished: true
      });
      await quizLesson.save();
      quizLessonId = quizLesson._id.toString();

      // Enroll student
      await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(201);
    });

    it('should submit quiz answers and calculate score', async () => {
      const quizSubmission = {
        answers: {
          '1': 0, // Correct answer
          '2': true // Correct answer
        },
        timeSpent: 300
      };

      const response = await request(app)
        .post(`/api/courses/${courseId}/lessons/${quizLessonId}/quiz/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send(quizSubmission)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.attempt.score).toBe(100);
      expect(response.body.data.attempt.passed).toBe(true);
    });

    it('should handle incorrect quiz answers', async () => {
      const quizSubmission = {
        answers: {
          '1': 1, // Incorrect answer
          '2': false // Incorrect answer
        },
        timeSpent: 300
      };

      const response = await request(app)
        .post(`/api/courses/${courseId}/lessons/${quizLessonId}/quiz/submit`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send(quizSubmission)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.attempt.score).toBe(0);
      expect(response.body.data.attempt.passed).toBe(false);
    });
  });

  describe('Course Completion', () => {
    beforeEach(async () => {
      // Enroll student
      await request(app)
        .post(`/api/courses/${courseId}/enroll`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(201);
    });

    it('should mark course as completed when all lessons are done', async () => {
      // Complete the lesson
      await request(app)
        .post(`/api/courses/${courseId}/lessons/${lessonId}/progress`)
        .set('Authorization', `Bearer ${learnerToken}`)
        .send({ status: 'COMPLETED', completionPercentage: 100 })
        .expect(201);

      // Check enrollment status
      const response = await request(app)
        .get('/api/student/enrollments')
        .set('Authorization', `Bearer ${learnerToken}`)
        .expect(200);

      const enrollment = response.body.data.enrollments.find(
        (e: any) => e.course._id === courseId
      );
      
      expect(enrollment.status).toBe('COMPLETED');
    });
  });
});

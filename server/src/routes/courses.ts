import { Router } from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
  getInstructorCourses,
  getInstructorAnalytics,
  enrollInCourse,
  getUserEnrollments,
  getEnrolledCourses,
  updateProgress,
  getCategories,
  getCourseWithProgress
} from '../controllers/courseController';

// Import module and lesson controllers
import {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  deleteModule,
  togglePublish as toggleModulePublish
} from '../controllers/moduleController';

import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  togglePublish as toggleLessonPublish
} from '../controllers/lessonController';
import { authenticate, requireInstructor } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - level
 *         - category
 *         - instructor
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the course
 *         title:
 *           type: string
 *           description: The course title
 *         description:
 *           type: string
 *           description: The course description
 *         level:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *           description: The course difficulty level
 *         category:
 *           type: string
 *           description: The course category
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Course tags
 *         price:
 *           type: number
 *           description: Course price
 *         duration:
 *           type: number
 *           description: Course duration in minutes
 *         thumbnail:
 *           type: string
 *           description: Course thumbnail URL
 *         instructor:
 *           type: string
 *           description: Instructor user ID
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED, ARCHIVED]
 *           description: Course status
 *         isPublished:
 *           type: boolean
 *           description: Whether the course is published
 *         totalLessons:
 *           type: number
 *           description: Total number of lessons
 *         totalModules:
 *           type: number
 *           description: Total number of modules
 *         rating:
 *           type: number
 *           description: Average course rating
 *         ratingCount:
 *           type: number
 *           description: Number of ratings
 *         enrollmentCount:
 *           type: number
 *           description: Number of enrollments
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateCourseRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - level
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *         description:
 *           type: string
 *           maxLength: 2000
 *         level:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *         category:
 *           type: string
 *           maxLength: 100
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *             maxLength: 50
 *         price:
 *           type: number
 *           minimum: 0
 *         thumbnail:
 *           type: string
 *     Enrollment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         course:
 *           type: string
 *         status:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, DROPPED, SUSPENDED]
 *         progress:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         enrolledAt:
 *           type: string
 *           format: date-time
 *         completedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all published courses
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of courses per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *                     total:
 *                       type: number
 *                     page:
 *                       type: number
 *                     totalPages:
 *                       type: number
 */
router.get('/', apiLimiter, getCourses);

/**
 * @swagger
 * /api/courses/categories:
 *   get:
 *     summary: Get all course categories
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /api/courses/my-courses:
 *   get:
 *     summary: Get courses created by the authenticated instructor
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor courses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/my-courses', authenticate, requireInstructor, getInstructorCourses);

/**
 * @swagger
 * /api/courses/instructor/analytics:
 *   get:
 *     summary: Get instructor analytics
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/instructor/analytics', authenticate, requireInstructor, getInstructorAnalytics);

/**
 * @swagger
 * /api/courses/enrollments:
 *   get:
 *     summary: Get user's course enrollments
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User enrollments retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/enrollments', authenticate, getUserEnrollments);

/**
 * @swagger
 * /api/courses/enrolled:
 *   get:
 *     summary: Get user's enrolled courses with pagination
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of courses per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, COMPLETED, DROPPED, SUSPENDED]
 *         description: Filter by enrollment status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in course title and description
 *     responses:
 *       200:
 *         description: Enrolled courses retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/enrolled', authenticate, getEnrolledCourses);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, requireInstructor, createCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *       404:
 *         description: Course not found
 */
router.get('/:id', getCourseById);

/**
 * @swagger
 * /api/courses/{id}/with-progress:
 *   get:
 *     summary: Get course with user progress (for enrolled users)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course with progress retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not enrolled in course
 *       404:
 *         description: Course not found
 */
router.get('/:id/with-progress', authenticate, getCourseWithProgress);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCourseRequest'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Course not found
 */
router.put('/:id', authenticate, requireInstructor, updateCourse);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Course not found
 */
router.delete('/:id', authenticate, requireInstructor, deleteCourse);

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   patch:
 *     summary: Toggle course publish status
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course publish status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Course not found
 */
router.patch('/:id/publish', authenticate, requireInstructor, togglePublish);

/**
 * @swagger
 * /api/courses/{id}/enroll:
 *   post:
 *     summary: Enroll in a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Successfully enrolled in course
 *       400:
 *         description: Already enrolled or course not available
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.post('/:id/enroll', authenticate, enrollInCourse);

/**
 * @swagger
 * /api/courses/lessons/{lessonId}/progress:
 *   put:
 *     summary: Update lesson progress
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeSpent:
 *                 type: number
 *               completionPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               lastPosition:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [NOT_STARTED, IN_PROGRESS, COMPLETED]
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not enrolled in course
 *       404:
 *         description: Lesson not found
 */
router.put('/lessons/:lessonId/progress', authenticate, updateProgress);

// Module routes
/**
 * @swagger
 * /api/courses/{courseId}/modules:
 *   get:
 *     summary: Get modules for a course
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Modules retrieved successfully
 */
router.get('/:courseId/modules', getModules);

/**
 * @swagger
 * /api/courses/{courseId}/modules:
 *   post:
 *     summary: Create a new module
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - order
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Module created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/:courseId/modules', authenticate, requireInstructor, createModule);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}:
 *   get:
 *     summary: Get module by ID
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module retrieved successfully
 *       404:
 *         description: Module not found
 */
router.get('/:courseId/modules/:moduleId', getModuleById);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}:
 *   put:
 *     summary: Update module
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Module not found
 */
router.put('/:courseId/modules/:moduleId', authenticate, requireInstructor, updateModule);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}:
 *   delete:
 *     summary: Delete module
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Module not found
 */
router.delete('/:courseId/modules/:moduleId', authenticate, requireInstructor, deleteModule);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/publish:
 *   patch:
 *     summary: Toggle module publish status
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module publish status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Module not found
 */
router.patch('/:courseId/modules/:moduleId/publish', authenticate, requireInstructor, toggleModulePublish);

// Lesson routes
/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons:
 *   get:
 *     summary: Get lessons for a module
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lessons retrieved successfully
 */
router.get('/:courseId/modules/:moduleId/lessons', getLessons);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - type
 *               - order
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *               order:
 *                 type: number
 *               duration:
 *                 type: number
 *               videoUrl:
 *                 type: string
 *               isFree:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/:courseId/modules/:moduleId/lessons', authenticate, requireInstructor, createLesson);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}:
 *   get:
 *     summary: Get lesson by ID
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson retrieved successfully
 *       404:
 *         description: Lesson not found
 */
router.get('/:courseId/modules/:moduleId/lessons/:lessonId', getLessonById);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}:
 *   put:
 *     summary: Update lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Lesson not found
 */
router.put('/:courseId/modules/:moduleId/lessons/:lessonId', authenticate, requireInstructor, updateLesson);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}:
 *   delete:
 *     summary: Delete lesson
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Lesson not found
 */
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', authenticate, requireInstructor, deleteLesson);

/**
 * @swagger
 * /api/courses/{courseId}/modules/{moduleId}/lessons/{lessonId}/publish:
 *   patch:
 *     summary: Toggle lesson publish status
 *     tags: [Lessons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lesson publish status toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Lesson not found
 */
router.patch('/:courseId/modules/:moduleId/lessons/:lessonId/publish', authenticate, requireInstructor, toggleLessonPublish);

export default router;

import { Router } from 'express';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  createCourseFromTemplate,
  saveAsTemplate,
  deleteTemplate,
  getUserTemplates
} from '../controllers/courseTemplateController';
import { authenticate, requireInstructor, optionalAuthenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all template routes
router.use(apiLimiter);

/**
 * @swagger
 * components:
 *   schemas:
 *     CourseTemplate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         level:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         thumbnail:
 *           type: string
 *         isPublic:
 *           type: boolean
 *         createdBy:
 *           type: string
 *         modules:
 *           type: array
 *           items:
 *             type: object
 *         estimatedDuration:
 *           type: number
 *         usageCount:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/course-templates:
 *   get:
 *     summary: Get all course templates
 *     tags: [Course Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
 */
router.get('/', optionalAuthenticate, getTemplates);

/**
 * @swagger
 * /api/course-templates/my:
 *   get:
 *     summary: Get current user's templates
 *     tags: [Course Templates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User templates retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticate, requireInstructor, getUserTemplates);

/**
 * @swagger
 * /api/course-templates:
 *   post:
 *     summary: Create a new course template
 *     tags: [Course Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *               - level
 *               - modules
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               thumbnail:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *               modules:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Template created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, requireInstructor, createTemplate);

/**
 * @swagger
 * /api/course-templates/create-course:
 *   post:
 *     summary: Create a course from template
 *     tags: [Course Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - templateId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               templateId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created from template successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Template not found
 */
router.post('/create-course', authenticate, requireInstructor, createCourseFromTemplate);

/**
 * @swagger
 * /api/course-templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     tags: [Course Templates]
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
 *         description: Template retrieved successfully
 *       404:
 *         description: Template not found
 */
router.get('/:id', optionalAuthenticate, getTemplateById);

/**
 * @swagger
 * /api/course-templates/{id}:
 *   delete:
 *     summary: Delete template
 *     tags: [Course Templates]
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
 *         description: Template deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Template not found
 */
router.delete('/:id', authenticate, requireInstructor, deleteTemplate);

/**
 * @swagger
 * /api/course-templates/save/{courseId}:
 *   post:
 *     summary: Save course as template
 *     tags: [Course Templates]
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
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Course saved as template successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Course not found
 */
router.post('/save/:courseId', authenticate, requireInstructor, saveAsTemplate);

export default router;

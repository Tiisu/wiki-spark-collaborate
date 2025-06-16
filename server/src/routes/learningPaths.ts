import { Router } from 'express';
import {
  getLearningPaths,
  getLearningPathById,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  startLearningPath,
  completeStep,
  getUserPathProgress
} from '../controllers/learningPathController';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../types';

const router = Router();

// Apply rate limiting to all learning path routes
router.use(apiLimiter);

/**
 * @swagger
 * components:
 *   schemas:
 *     LearningPathStep:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - type
 *         - estimatedHours
 *         - difficulty
 *         - skills
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the step
 *         title:
 *           type: string
 *           description: The title of the step
 *         description:
 *           type: string
 *           description: Description of the step
 *         type:
 *           type: string
 *           enum: [course, skill, project, assessment]
 *           description: Type of the step
 *         status:
 *           type: string
 *           enum: [completed, current, locked, available]
 *           description: Current status of the step for the user
 *         progress:
 *           type: number
 *           description: Progress percentage (0-100)
 *         estimatedHours:
 *           type: number
 *           description: Estimated hours to complete
 *         difficulty:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *           description: Difficulty level
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *           description: Prerequisites for this step
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: Skills learned in this step
 *         courseId:
 *           type: string
 *           description: Associated course ID (if type is course)
 *         order:
 *           type: number
 *           description: Order of the step in the path
 *     
 *     LearningPath:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *         - estimatedHours
 *         - difficulty
 *         - steps
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the learning path
 *         title:
 *           type: string
 *           description: The title of the learning path
 *         description:
 *           type: string
 *           description: Description of the learning path
 *         category:
 *           type: string
 *           description: Category of the learning path
 *         totalSteps:
 *           type: number
 *           description: Total number of steps
 *         completedSteps:
 *           type: number
 *           description: Number of completed steps for the user
 *         estimatedHours:
 *           type: number
 *           description: Total estimated hours to complete
 *         difficulty:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *           description: Overall difficulty level
 *         steps:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LearningPathStep'
 *         isPublished:
 *           type: boolean
 *           description: Whether the path is published
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags associated with the path
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *           description: Prerequisites for the entire path
 *         learningObjectives:
 *           type: array
 *           items:
 *             type: string
 *           description: Learning objectives
 *         skillsAcquired:
 *           type: array
 *           items:
 *             type: string
 *           description: Skills acquired upon completion
 *         targetAudience:
 *           type: string
 *           description: Target audience description
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the path was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the path was last updated
 */

/**
 * @swagger
 * /api/learning-paths:
 *   get:
 *     summary: Get all learning paths with user progress
 *     tags: [Learning Paths]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, tags, and skills
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [Beginner, Intermediate, Advanced]
 *         description: Filter by difficulty level
 *     responses:
 *       200:
 *         description: Learning paths retrieved successfully
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
 *                     paths:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LearningPath'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getLearningPaths);

/**
 * @swagger
 * /api/learning-paths/{id}:
 *   get:
 *     summary: Get learning path by ID
 *     tags: [Learning Paths]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Learning path ID
 *     responses:
 *       200:
 *         description: Learning path retrieved successfully
 *       404:
 *         description: Learning path not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, getLearningPathById);

/**
 * @swagger
 * /api/learning-paths:
 *   post:
 *     summary: Create a new learning path (instructors/admins only)
 *     tags: [Learning Paths]
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
 *               - description
 *               - category
 *               - estimatedHours
 *               - difficulty
 *               - steps
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               estimatedHours:
 *                 type: number
 *               difficulty:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced]
 *               steps:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/LearningPathStep'
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *               learningObjectives:
 *                 type: array
 *                 items:
 *                   type: string
 *               skillsAcquired:
 *                 type: array
 *                 items:
 *                   type: string
 *               targetAudience:
 *                 type: string
 *     responses:
 *       201:
 *         description: Learning path created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor/Admin access required
 */
router.post('/', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), createLearningPath);

/**
 * @swagger
 * /api/learning-paths/{id}:
 *   put:
 *     summary: Update learning path (instructors/admins only)
 *     tags: [Learning Paths]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Learning path ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               estimatedHours:
 *                 type: number
 *               difficulty:
 *                 type: string
 *                 enum: [Beginner, Intermediate, Advanced]
 *               steps:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/LearningPathStep'
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Learning path updated successfully
 *       404:
 *         description: Learning path not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor/Admin access required
 */
router.put('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), updateLearningPath);

/**
 * @swagger
 * /api/learning-paths/{id}:
 *   delete:
 *     summary: Delete learning path (instructors/admins only)
 *     tags: [Learning Paths]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Learning path ID
 *     responses:
 *       200:
 *         description: Learning path deleted successfully
 *       404:
 *         description: Learning path not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Instructor/Admin access required
 */
router.delete('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteLearningPath);

/**
 * @swagger
 * /api/learning-paths/{id}/start:
 *   post:
 *     summary: Start a learning path
 *     tags: [Learning Paths]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Learning path ID
 *     responses:
 *       200:
 *         description: Learning path started successfully
 *       404:
 *         description: Learning path not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/start', authenticate, startLearningPath);

/**
 * @swagger
 * /api/learning-paths/{id}/steps/{stepId}/complete:
 *   post:
 *     summary: Complete a learning path step
 *     tags: [Learning Paths]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Learning path ID
 *       - in: path
 *         name: stepId
 *         required: true
 *         schema:
 *           type: string
 *         description: Step ID
 *     responses:
 *       200:
 *         description: Step completed successfully
 *       404:
 *         description: Learning path or step not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/steps/:stepId/complete', authenticate, completeStep);

/**
 * @swagger
 * /api/learning-paths/{id}/progress:
 *   get:
 *     summary: Get user progress for a specific learning path
 *     tags: [Learning Paths]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Learning path ID
 *     responses:
 *       200:
 *         description: User progress retrieved successfully
 *       404:
 *         description: Learning path not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/progress', authenticate, getUserPathProgress);

export default router;

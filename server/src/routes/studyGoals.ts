import { Router } from 'express';
import {
  getUserGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getGoalStats,
  updateExpiredGoals
} from '../controllers/studyGoalController';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../types';

const router = Router();

// Apply rate limiting to all study goal routes
router.use(apiLimiter);

/**
 * @swagger
 * components:
 *   schemas:
 *     StudyGoal:
 *       type: object
 *       required:
 *         - title
 *         - target
 *         - unit
 *         - deadline
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the study goal
 *         title:
 *           type: string
 *           description: The title of the study goal
 *         description:
 *           type: string
 *           description: Optional description of the study goal
 *         target:
 *           type: number
 *           description: The target value to achieve
 *         current:
 *           type: number
 *           description: Current progress towards the goal
 *         unit:
 *           type: string
 *           enum: [lessons, hours, courses, points]
 *           description: The unit of measurement for the goal
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: The deadline for achieving the goal
 *         status:
 *           type: string
 *           enum: [active, completed, paused, expired]
 *           description: Current status of the goal
 *         isCompleted:
 *           type: boolean
 *           description: Whether the goal has been completed
 *         completedAt:
 *           type: string
 *           format: date-time
 *           description: When the goal was completed
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the goal was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the goal was last updated
 */

/**
 * @swagger
 * /api/study-goals:
 *   get:
 *     summary: Get user's study goals
 *     tags: [Study Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Study goals retrieved successfully
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
 *                     goals:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StudyGoal'
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getUserGoals);

/**
 * @swagger
 * /api/study-goals/{id}:
 *   get:
 *     summary: Get study goal by ID
 *     tags: [Study Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Study goal ID
 *     responses:
 *       200:
 *         description: Study goal retrieved successfully
 *       404:
 *         description: Study goal not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticate, getGoalById);

/**
 * @swagger
 * /api/study-goals:
 *   post:
 *     summary: Create a new study goal
 *     tags: [Study Goals]
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
 *               - target
 *               - unit
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the study goal
 *               description:
 *                 type: string
 *                 description: Optional description of the study goal
 *               target:
 *                 type: number
 *                 description: The target value to achieve
 *               unit:
 *                 type: string
 *                 enum: [lessons, hours, courses, points]
 *                 description: The unit of measurement for the goal
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: The deadline for achieving the goal
 *     responses:
 *       201:
 *         description: Study goal created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, createGoal);

/**
 * @swagger
 * /api/study-goals/{id}:
 *   put:
 *     summary: Update study goal
 *     tags: [Study Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Study goal ID
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
 *               target:
 *                 type: number
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, completed, paused, expired]
 *     responses:
 *       200:
 *         description: Study goal updated successfully
 *       404:
 *         description: Study goal not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id', authenticate, updateGoal);

/**
 * @swagger
 * /api/study-goals/{id}:
 *   delete:
 *     summary: Delete study goal
 *     tags: [Study Goals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Study goal ID
 *     responses:
 *       200:
 *         description: Study goal deleted successfully
 *       404:
 *         description: Study goal not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticate, deleteGoal);

/**
 * @swagger
 * /api/study-goals/progress/update:
 *   post:
 *     summary: Update goal progress
 *     tags: [Study Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unit
 *             properties:
 *               unit:
 *                 type: string
 *                 enum: [lessons, hours, courses, points]
 *               increment:
 *                 type: number
 *                 default: 1
 *     responses:
 *       200:
 *         description: Goal progress updated successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/progress/update', authenticate, updateGoalProgress);

/**
 * @swagger
 * /api/study-goals/stats:
 *   get:
 *     summary: Get goal statistics
 *     tags: [Study Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Goal statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticate, getGoalStats);

/**
 * @swagger
 * /api/study-goals/admin/update-expired:
 *   post:
 *     summary: Update expired goals (admin only)
 *     tags: [Study Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expired goals updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.post('/admin/update-expired', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), updateExpiredGoals);

export default router;

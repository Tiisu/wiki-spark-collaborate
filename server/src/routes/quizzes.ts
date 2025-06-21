import { Router } from 'express';
import {
  createQuiz,
  getQuizById,
  getQuizzesByLesson,
  submitQuiz,
  getUserQuizAttempts,
  updateQuiz,
  deleteQuiz,
  getQuizStats,
  getStudentProgress,
  startQuizAttempt,
  validateQuizAttempt,
  getQuizAttempt
} from '../controllers/quizController';
import { authenticate, requireInstructor, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../types';

const router = Router();

// Apply rate limiting to all quiz routes
router.use(apiLimiter);

/**
 * @swagger
 * components:
 *   schemas:
 *     Quiz:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         lesson:
 *           type: string
 *         course:
 *           type: string
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *         passingScore:
 *           type: number
 *         timeLimit:
 *           type: number
 *         maxAttempts:
 *           type: number
 *         isRequired:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     QuizAttempt:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         quiz:
 *           type: string
 *         score:
 *           type: number
 *         passed:
 *           type: boolean
 *         timeSpent:
 *           type: number
 *         attemptNumber:
 *           type: number
 *         completedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
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
 *               - lessonId
 *               - courseId
 *               - questions
 *               - passingScore
 *               - order
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               lessonId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               questions:
 *                 type: array
 *               passingScore:
 *                 type: number
 *               timeLimit:
 *                 type: number
 *               maxAttempts:
 *                 type: number
 *               isRequired:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', authenticate, requireInstructor, createQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get quiz by ID
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeAnswers
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully
 *       404:
 *         description: Quiz not found
 */
router.get('/:id', authenticate, getQuizById);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quizzes]
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
 *         description: Quiz updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Quiz not found
 */
router.put('/:id', authenticate, requireInstructor, updateQuiz);

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete quiz
 *     tags: [Quizzes]
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
 *         description: Quiz deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Quiz not found
 */
router.delete('/:id', authenticate, requireInstructor, deleteQuiz);

/**
 * @swagger
 * /api/quizzes/lesson/{lessonId}:
 *   get:
 *     summary: Get quizzes for a lesson
 *     tags: [Quizzes]
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 */
router.get('/lesson/:lessonId', getQuizzesByLesson);

/**
 * @swagger
 * /api/quizzes/{id}/start:
 *   post:
 *     summary: Start a quiz attempt
 *     tags: [Quizzes]
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
 *         description: Quiz attempt started successfully
 *       400:
 *         description: Maximum attempts exceeded
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */
router.post('/:id/start', authenticate, startQuizAttempt);

/**
 * @swagger
 * /api/quizzes/{id}/validate/{attemptId}:
 *   get:
 *     summary: Validate quiz attempt (check if still valid/not expired)
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz attempt validation completed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz or attempt not found
 */
router.get('/:id/validate/:attemptId', authenticate, validateQuizAttempt);

/**
 * @swagger
 * /api/quizzes/{id}/submit:
 *   post:
 *     summary: Submit quiz attempt
 *     tags: [Quizzes]
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
 *             type: object
 *             required:
 *               - answers
 *               - timeSpent
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     userAnswer:
 *                       oneOf:
 *                         - type: string
 *                         - type: array
 *               timeSpent:
 *                 type: number
 *     responses:
 *       201:
 *         description: Quiz submitted successfully
 *       400:
 *         description: Invalid submission data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz not found
 */
router.post('/:id/submit', authenticate, submitQuiz);

/**
 * @swagger
 * /api/quizzes/attempts/my:
 *   get:
 *     summary: Get current user's quiz attempts
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: quizId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz attempts retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/attempts/my', authenticate, getUserQuizAttempts);

/**
 * @swagger
 * /api/quizzes/{id}/stats:
 *   get:
 *     summary: Get quiz statistics
 *     tags: [Quizzes]
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
 *         description: Quiz statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/:id/stats', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), getQuizStats);

/**
 * @swagger
 * /api/quizzes/{id}/progress:
 *   get:
 *     summary: Get student progress analytics
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student progress retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/:id/progress', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN), getStudentProgress);

/**
 * @swagger
 * /api/quizzes/attempts/{attemptId}:
 *   get:
 *     summary: Get quiz attempt details
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz attempt retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quiz attempt not found
 */
router.get('/attempts/:attemptId', authenticate, getQuizAttempt);

export default router;

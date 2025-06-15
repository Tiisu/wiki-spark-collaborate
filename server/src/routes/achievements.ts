import { Router } from 'express';
import {
  getUserAchievements,
  getMyAchievements,
  checkAchievements,
  getAchievementStats,
  getBadgeDefinitions,
  awardAchievement,
  getAchievementLeaderboard,
  getRecentAchievements,
  getAchievementAnalytics
} from '../controllers/achievementController';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../types';

const router = Router();

// Apply rate limiting to all achievement routes
router.use(apiLimiter);

/**
 * @swagger
 * components:
 *   schemas:
 *     Achievement:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         badgeType:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         iconUrl:
 *           type: string
 *         course:
 *           type: string
 *         quiz:
 *           type: string
 *         earnedAt:
 *           type: string
 *           format: date-time
 *         metadata:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/achievements/my:
 *   get:
 *     summary: Get current user's achievements
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievements retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticate, getMyAchievements);

/**
 * @swagger
 * /api/achievements/check:
 *   post:
 *     summary: Check and award new achievements for current user
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievements checked successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/check', authenticate, checkAchievements);

/**
 * @swagger
 * /api/achievements/stats:
 *   get:
 *     summary: Get current user's achievement statistics
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievement statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticate, getAchievementStats);

/**
 * @swagger
 * /api/achievements/badges:
 *   get:
 *     summary: Get all available badge definitions
 *     tags: [Achievements]
 *     responses:
 *       200:
 *         description: Badge definitions retrieved successfully
 */
router.get('/badges', getBadgeDefinitions);

/**
 * @swagger
 * /api/achievements/leaderboard:
 *   get:
 *     summary: Get achievement leaderboard
 *     tags: [Achievements]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 */
router.get('/leaderboard', getAchievementLeaderboard);

/**
 * @swagger
 * /api/achievements/user/{userId}:
 *   get:
 *     summary: Get achievements for specific user (admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User achievements retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/user/:userId', authenticate, getUserAchievements);

/**
 * @swagger
 * /api/achievements/user/{userId}/stats:
 *   get:
 *     summary: Get achievement statistics for specific user (admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User achievement statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/user/:userId/stats', authenticate, getAchievementStats);

/**
 * @swagger
 * /api/achievements/award:
 *   post:
 *     summary: Manually award achievement (admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - badgeType
 *             properties:
 *               userId:
 *                 type: string
 *               badgeType:
 *                 type: string
 *               metadata:
 *                 type: object
 *               courseId:
 *                 type: string
 *               quizId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Achievement awarded successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/award', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), awardAchievement);

/**
 * @swagger
 * /api/achievements/recent:
 *   get:
 *     summary: Get recent achievements across platform (admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Recent achievements retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/recent', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getRecentAchievements);

/**
 * @swagger
 * /api/achievements/analytics:
 *   get:
 *     summary: Get achievement analytics (admin only)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Achievement analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/analytics', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAchievementAnalytics);

export default router;

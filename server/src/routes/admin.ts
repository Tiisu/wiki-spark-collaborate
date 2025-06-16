import { Router } from 'express';
import {
  getAnalytics,
  getCourses,
  getUsers,
  updateUserRole,
  uploadVideo,
  uploadThumbnail
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all admin routes
router.use(apiLimiter);

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get platform analytics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                         totalCourses:
 *                           type: number
 *                         totalEnrollments:
 *                           type: number
 *                         publishedCourses:
 *                           type: number
 *                         userGrowth:
 *                           type: number
 *                         courseGrowth:
 *                           type: number
 *                         publishedPercentage:
 *                           type: number
 *                     growth:
 *                       type: object
 *                     recentActivity:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/analytics', getAnalytics);

/**
 * @swagger
 * /api/admin/courses:
 *   get:
 *     summary: Get all courses for admin management
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by course status
 *       - in: query
 *         name: instructor
 *         schema:
 *           type: string
 *         description: Filter by instructor ID
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/courses', getCourses);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users for admin management
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [LEARNER, INSTRUCTOR, MENTOR, ADMIN, SUPER_ADMIN]
 *         description: Filter by user role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/admin/users/{userId}/role:
 *   patch:
 *     summary: Update user role (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [LEARNER, INSTRUCTOR, MENTOR, ADMIN, SUPER_ADMIN]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.patch('/users/:userId/role', updateUserRole);

/**
 * @swagger
 * /api/admin/upload/video:
 *   post:
 *     summary: Upload video file (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *       400:
 *         description: No video file provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/upload/video', uploadVideo);

/**
 * @swagger
 * /api/admin/upload/thumbnail:
 *   post:
 *     summary: Upload thumbnail image (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               thumbnail:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Thumbnail uploaded successfully
 *       400:
 *         description: No thumbnail file provided
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/upload/thumbnail', uploadThumbnail);

export default router;

import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { UserRole } from '../models/User.js';
import { AuthenticatedRequest, ApiResponse } from '../types/index.js';
import { courseController } from '../controllers/courseController.js';
import { uploadVideo, uploadThumbnail, handleUploadError, getFileUrl } from '../middleware/upload.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get('/users',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ query: schemas.paginationQuery }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Admin routes - Coming soon!',
      data: { endpoint: 'GET /api/admin/users' }
    });
  })
);

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get platform analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/analytics',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Platform analytics - Coming soon!',
      data: { endpoint: 'GET /api/admin/analytics' }
    });
  })
);

/**
 * @swagger
 * /api/admin/courses:
 *   get:
 *     summary: Get all courses for admin dashboard
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, draft]
 *       - in: query
 *         name: instructor
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin courses retrieved successfully
 */
router.get('/courses',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ query: schemas.paginationQuery }),
  asyncHandler(courseController.getAdminCourses)
);

/**
 * @swagger
 * /api/admin/upload/video:
 *   post:
 *     summary: Upload a video file
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
 */
router.post('/upload/video',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  uploadVideo,
  handleUploadError,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw new Error('No video file uploaded');
    }

    const videoUrl = getFileUrl(req.file.filename, 'video');

    logger.info(`Video uploaded: ${req.file.filename} by ${req.user!.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Video uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: videoUrl
      }
    };

    res.status(200).json(response);
  })
);

/**
 * @swagger
 * /api/admin/upload/thumbnail:
 *   post:
 *     summary: Upload a thumbnail image
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
 */
router.post('/upload/thumbnail',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  uploadThumbnail,
  handleUploadError,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) {
      throw new Error('No thumbnail file uploaded');
    }

    const thumbnailUrl = getFileUrl(req.file.filename, 'thumbnail');

    logger.info(`Thumbnail uploaded: ${req.file.filename} by ${req.user!.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Thumbnail uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: thumbnailUrl
      }
    };

    res.status(200).json(response);
  })
);

export default router;

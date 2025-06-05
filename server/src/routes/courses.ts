import { Router, Request, Response } from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../types/index.js';
import { UserRole } from '../models/User.js';

const router = Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
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
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED]
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 */
router.get('/',
  optionalAuth,
  validate({ query: schemas.paginationQuery.extend(schemas.searchQuery.shape) }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Course routes - Coming soon!',
      data: {
        endpoint: 'GET /api/courses',
        query: req.query,
        user: req.user ? 'Authenticated' : 'Anonymous'
      }
    });
  })
);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Course created successfully
 */
router.post('/',
  authenticate,
  authorize(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ body: schemas.createCourse }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.status(201).json({
      success: true,
      message: 'Create course - Coming soon!',
      data: { endpoint: 'POST /api/courses' }
    });
  })
);

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
 */
router.get('/:id',
  optionalAuth,
  validate({ params: schemas.idParam }),
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Get course by ID - Coming soon!',
      data: { endpoint: `GET /api/courses/${req.params.id}` }
    });
  })
);

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
 *       200:
 *         description: Enrolled successfully
 */
router.post('/:id/enroll',
  authenticate,
  validate({ params: schemas.idParam }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: 'Course enrollment - Coming soon!',
      data: { endpoint: `POST /api/courses/${req.params.id}/enroll` }
    });
  })
);

export default router;

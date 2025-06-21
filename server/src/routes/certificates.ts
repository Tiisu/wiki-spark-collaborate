import { Router } from 'express';
import {
  generateCertificate,
  getUserCertificates,
  getMyCertificates,
  verifyCertificate,
  getCertificateByCode,
  checkCertificateEligibility,
  revokeCertificate,
  getCertificateStats,
  downloadCertificate,
  getCertificateTemplate,
  regenerateCertificatePDF,
  bulkRegeneratePDFs,
  retryFailedCertificates,
  getCertificateAnalytics,
  triggerAutomaticGeneration,
  getDetailedEligibility
} from '../controllers/certificateController';
import { authenticate, authorize } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';
import { UserRole } from '../types';

const router = Router();

// Apply rate limiting to all certificate routes
router.use(apiLimiter);

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           type: string
 *         course:
 *           type: string
 *         verificationCode:
 *           type: string
 *         issuedAt:
 *           type: string
 *           format: date-time
 *         completionDate:
 *           type: string
 *           format: date-time
 *         finalScore:
 *           type: number
 *         timeSpent:
 *           type: number
 *         instructorName:
 *           type: string
 *         courseName:
 *           type: string
 *         courseLevel:
 *           type: string
 *         isValid:
 *           type: boolean
 *         metadata:
 *           type: object
 */

/**
 * @swagger
 * /api/certificates/my:
 *   get:
 *     summary: Get current user's certificates
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificates retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticate, getMyCertificates);

/**
 * @swagger
 * /api/certificates/generate/{courseId}:
 *   post:
 *     summary: Generate certificate for completed course
 *     tags: [Certificates]
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
 *               - completionDate
 *               - timeSpent
 *             properties:
 *               completionDate:
 *                 type: string
 *                 format: date-time
 *               finalScore:
 *                 type: number
 *               timeSpent:
 *                 type: number
 *     responses:
 *       201:
 *         description: Certificate generated successfully
 *       400:
 *         description: Certificate cannot be generated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.post('/generate/:courseId', authenticate, generateCertificate);

/**
 * @swagger
 * /api/certificates/eligibility/{courseId}:
 *   get:
 *     summary: Check certificate eligibility for course
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate eligibility checked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */
router.get('/eligibility/:courseId', authenticate, checkCertificateEligibility);

/**
 * @swagger
 * /api/certificates/verify/{verificationCode}:
 *   get:
 *     summary: Verify certificate by verification code (public)
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: verificationCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate verification result
 *       400:
 *         description: Invalid verification code
 */
router.get('/verify/:verificationCode', verifyCertificate);

/**
 * @swagger
 * /api/certificates/public/{verificationCode}:
 *   get:
 *     summary: Get certificate by verification code (public)
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: verificationCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate retrieved successfully
 *       404:
 *         description: Certificate not found
 */
router.get('/public/:verificationCode', getCertificateByCode);

/**
 * @swagger
 * /api/certificates/{certificateId}/download:
 *   get:
 *     summary: Download certificate as PDF
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate download initiated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Certificate not found
 */
router.get('/:certificateId/download', authenticate, downloadCertificate);

/**
 * @swagger
 * /api/certificates/user/{userId}:
 *   get:
 *     summary: Get certificates for specific user (admin only)
 *     tags: [Certificates]
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
 *         description: User certificates retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/user/:userId', authenticate, getUserCertificates);

/**
 * @swagger
 * /api/certificates/{certificateId}/revoke:
 *   post:
 *     summary: Revoke certificate (admin only)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
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
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Certificate revoked successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Certificate not found
 */
router.post('/:certificateId/revoke', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), revokeCertificate);

/**
 * @swagger
 * /api/certificates/stats:
 *   get:
 *     summary: Get certificate statistics (admin only)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificate statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/stats', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getCertificateStats);

/**
 * @swagger
 * /api/certificates/template:
 *   get:
 *     summary: Get certificate template configuration (admin only)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Certificate template retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/template', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getCertificateTemplate);

// Enhanced certificate management endpoints

/**
 * @swagger
 * /api/certificates/{certificateId}/regenerate:
 *   post:
 *     summary: Regenerate certificate PDF (admin only)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: certificateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate PDF regenerated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Certificate not found
 */
router.post('/:certificateId/regenerate', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), regenerateCertificatePDF);

/**
 * @swagger
 * /api/certificates/bulk/regenerate:
 *   post:
 *     summary: Bulk regenerate certificate PDFs (admin only)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *               template:
 *                 type: string
 *                 enum: [STANDARD, PREMIUM, CUSTOM]
 *     responses:
 *       200:
 *         description: Bulk regeneration completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/bulk/regenerate', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), bulkRegeneratePDFs);

/**
 * @swagger
 * /api/certificates/retry-failed:
 *   post:
 *     summary: Retry failed certificate generations (admin only)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxRetries:
 *                 type: number
 *                 default: 3
 *     responses:
 *       200:
 *         description: Failed certificate retry completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/retry-failed', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), retryFailedCertificates);

/**
 * @swagger
 * /api/certificates/analytics:
 *   get:
 *     summary: Get certificate analytics (admin only)
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Certificate analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/analytics', authenticate, authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), getCertificateAnalytics);

/**
 * @swagger
 * /api/certificates/trigger/{courseId}:
 *   post:
 *     summary: Trigger automatic certificate generation
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID (admin only, defaults to current user)
 *     responses:
 *       200:
 *         description: Certificate generation triggered
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post('/trigger/:courseId', authenticate, triggerAutomaticGeneration);

/**
 * @swagger
 * /api/certificates/eligibility-detailed/{courseId}:
 *   get:
 *     summary: Get detailed certificate eligibility
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           description: User ID (admin only, defaults to current user)
 *     responses:
 *       200:
 *         description: Detailed eligibility information retrieved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get('/eligibility-detailed/:courseId', authenticate, getDetailedEligibility);

export default router;

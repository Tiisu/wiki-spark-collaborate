import { Request, Response } from 'express';
import certificateService from '../services/certificateService';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

// Generate certificate for completed course
export const generateCertificate = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId } = req.params;
  const { completionDate, finalScore, timeSpent } = req.body;

  // Check if user is eligible for certificate
  const eligibility = await certificateService.checkCertificateEligibility(req.user._id, courseId);
  
  if (!eligibility.eligible) {
    throw new AppError(`Certificate cannot be generated: ${eligibility.reason}`, 400);
  }

  const certificate = await certificateService.generateCertificate({
    userId: req.user._id,
    courseId,
    completionDate: new Date(completionDate),
    finalScore,
    timeSpent
  });

  res.status(201).json({
    success: true,
    message: 'Certificate generated successfully',
    data: { certificate }
  });
});

// Get user certificates
export const getUserCertificates = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { userId } = req.params;
  
  // Users can only see their own certificates unless they're admin
  const targetUserId = userId || req.user._id;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
  
  if (targetUserId !== req.user._id && !isAdmin) {
    throw new AppError('Access denied. You can only view your own certificates.', 403);
  }

  const certificates = await certificateService.getUserCertificates(targetUserId);

  res.status(200).json({
    success: true,
    message: 'Certificates retrieved successfully',
    data: { certificates }
  });
});

// Get current user's certificates
export const getMyCertificates = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const certificates = await certificateService.getUserCertificates(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Your certificates retrieved successfully',
    data: { certificates }
  });
});

// Verify certificate by verification code (public endpoint)
export const verifyCertificate = catchAsync(async (req: Request, res: Response) => {
  const { verificationCode } = req.params;

  if (!verificationCode) {
    throw new AppError('Verification code is required', 400);
  }

  const verification = await certificateService.verifyCertificate(verificationCode);

  res.status(200).json({
    success: true,
    message: verification.message,
    data: {
      isValid: verification.isValid,
      certificate: verification.certificate
    }
  });
});

// Get certificate by verification code (public endpoint)
export const getCertificateByCode = catchAsync(async (req: Request, res: Response) => {
  const { verificationCode } = req.params;

  if (!verificationCode) {
    throw new AppError('Verification code is required', 400);
  }

  const certificate = await certificateService.getCertificateByVerificationCode(verificationCode);

  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Certificate retrieved successfully',
    data: { certificate }
  });
});

// Check certificate eligibility
export const checkCertificateEligibility = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId } = req.params;

  const eligibility = await certificateService.checkCertificateEligibility(req.user._id, courseId);

  res.status(200).json({
    success: true,
    message: 'Certificate eligibility checked successfully',
    data: { eligibility }
  });
});

// Revoke certificate (admin only)
export const revokeCertificate = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can revoke certificates
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const { certificateId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new AppError('Revocation reason is required', 400);
  }

  const certificate = await certificateService.revokeCertificate(
    certificateId,
    reason,
    req.user._id
  );

  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Certificate revoked successfully',
    data: { certificate }
  });
});

// Get certificate statistics (admin only)
export const getCertificateStats = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can see certificate statistics
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const stats = await certificateService.getCertificateStats();

  res.status(200).json({
    success: true,
    message: 'Certificate statistics retrieved successfully',
    data: { stats }
  });
});

// Download certificate PDF
export const downloadCertificate = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { certificateId } = req.params;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

  // Get certificate file
  const certificateFile = await certificateService.getCertificateFile(
    certificateId,
    isAdmin ? undefined : req.user._id
  );

  if (!certificateFile) {
    throw new AppError('Certificate not found or access denied', 404);
  }

  // Set response headers for PDF download
  res.setHeader('Content-Type', certificateFile.mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${certificateFile.fileName}"`);

  // Stream the PDF file
  const fs = require('fs');
  const fileStream = fs.createReadStream(certificateFile.filePath);

  fileStream.on('error', (error: any) => {
    logger.error('Error streaming certificate file:', error);
    throw new AppError('Error downloading certificate', 500);
  });

  fileStream.pipe(res);
});

// Regenerate certificate PDF
export const regenerateCertificatePDF = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can regenerate certificates
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const { certificateId } = req.params;

  const certificate = await certificateService.regeneratePDFCertificate(certificateId);

  if (!certificate) {
    throw new AppError('Certificate not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Certificate PDF regenerated successfully',
    data: { certificate }
  });
});

// Bulk regenerate certificate PDFs
export const bulkRegeneratePDFs = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can bulk regenerate certificates
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const { courseId, template } = req.body;

  const result = await certificateService.bulkRegeneratePDFs(courseId, template);

  res.status(200).json({
    success: true,
    message: 'Bulk PDF regeneration completed',
    data: result
  });
});

// Retry failed certificate generations
export const retryFailedCertificates = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can retry failed certificates
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const { maxRetries = 3 } = req.body;

  const result = await certificateService.retryFailedCertificates(maxRetries);

  res.status(200).json({
    success: true,
    message: 'Failed certificate retry completed',
    data: result
  });
});

// Get certificate analytics
export const getCertificateAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can view analytics
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const { startDate, endDate } = req.query;

  let dateRange;
  if (startDate && endDate) {
    dateRange = {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    };
  }

  const analytics = await certificateService.getCertificateAnalytics(dateRange);

  res.status(200).json({
    success: true,
    message: 'Certificate analytics retrieved successfully',
    data: { analytics }
  });
});

// Trigger automatic certificate generation
export const triggerAutomaticGeneration = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId } = req.params;
  const { userId } = req.body;

  // Users can only trigger for themselves, admins can trigger for any user
  const targetUserId = userId || req.user._id;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

  if (!isAdmin && targetUserId !== req.user._id) {
    throw new AppError('Access denied. Can only generate certificate for yourself.', 403);
  }

  const result = await certificateService.triggerAutomaticCertificateGeneration(targetUserId, courseId);

  res.status(200).json({
    success: true,
    message: result.generated ? 'Certificate generated successfully' : 'Certificate generation failed',
    data: result
  });
});

// Get detailed certificate eligibility
export const getDetailedEligibility = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId } = req.params;
  const { userId } = req.query;

  // Users can only check their own eligibility, admins can check for any user
  const targetUserId = (userId as string) || req.user._id;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

  if (!isAdmin && targetUserId !== req.user._id) {
    throw new AppError('Access denied. Can only check your own eligibility.', 403);
  }

  const eligibility = await certificateService.checkCertificateEligibility(targetUserId, courseId);

  res.status(200).json({
    success: true,
    message: 'Certificate eligibility checked successfully',
    data: { eligibility }
  });
});

// Get certificate template (admin only)
export const getCertificateTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can manage certificate templates
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  // This would return certificate template configuration
  res.status(200).json({
    success: true,
    message: 'Certificate template retrieved successfully',
    data: {
      template: {
        name: 'WikiWalkthrough Certificate',
        layout: 'landscape',
        elements: [
          'logo',
          'title',
          'recipient_name',
          'course_name',
          'completion_date',
          'instructor_signature',
          'verification_code'
        ]
      },
      message: 'Certificate template customization coming soon'
    }
  });
});

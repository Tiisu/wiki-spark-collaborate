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

// Download certificate (placeholder for PDF generation)
export const downloadCertificate = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { certificateId } = req.params;

  // Check if user owns this certificate or is admin
  const certificate = await certificateService.getUserCertificates(req.user._id);
  const userCertificate = certificate.find(cert => cert._id.toString() === certificateId);
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

  if (!userCertificate && !isAdmin) {
    throw new AppError('Certificate not found or access denied', 404);
  }

  // This would generate and return a PDF certificate
  // For now, return a placeholder response
  res.status(200).json({
    success: true,
    message: 'Certificate download feature coming soon',
    data: {
      certificateId,
      downloadUrl: `/api/certificates/${certificateId}/download`,
      message: 'PDF generation will be implemented in the next phase'
    }
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

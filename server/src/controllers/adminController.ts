import { Response } from 'express';
import { AuthRequest } from '../types';
import { adminService } from '../services/adminService';
import { catchAsync, AppError } from '../middleware/errorHandler';

// Get platform analytics
export const getAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can access analytics
  if (!['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const analytics = await adminService.getAnalytics();

  res.status(200).json({
    success: true,
    message: 'Analytics retrieved successfully',
    data: analytics
  });
});

// Get courses for admin management
export const getCourses = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can access course management
  if (!['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const { page, limit, status, instructor } = req.query;

  const result = await adminService.getCourses({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    status: status as string,
    instructor: instructor as string
  });

  res.status(200).json({
    success: true,
    message: 'Courses retrieved successfully',
    data: result
  });
});

// Get users for admin management
export const getUsers = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can access user management
  if (!['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const { page, limit, role, search } = req.query;

  const result = await adminService.getUsers({
    page: page ? parseInt(page as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    role: role as string,
    search: search as string
  });

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: result
  });
});

// Update user role
export const updateUserRole = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can update user roles
  if (!['ADMIN', 'SUPER_ADMIN', 'admin', 'super_admin'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const { userId } = req.params;
  const { role } = req.body;

  if (!role) {
    throw new AppError('Role is required', 400);
  }

  const user = await adminService.updateUserRole(userId, role);

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: { user }
  });
});

// Upload functionality temporarily disabled - will be implemented later
export const uploadVideo = catchAsync(async (req: AuthRequest, res: Response) => {
  res.status(501).json({
    success: false,
    message: 'Video upload functionality is not yet implemented'
  });
});

export const uploadThumbnail = catchAsync(async (req: AuthRequest, res: Response) => {
  res.status(501).json({
    success: false,
    message: 'Thumbnail upload functionality is not yet implemented'
  });
});

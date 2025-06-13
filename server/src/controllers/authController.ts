import { Request, Response } from 'express';
import authService from '../services/authService';
import { validateRequest, registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../utils/validation';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

// Register new user
export const register = catchAsync(async (req: Request, res: Response) => {
  // Validate request body
  const validation = validateRequest(registerSchema, req.body);
  if (!validation.success) {
    throw new AppError(validation.errors?.join(', ') || 'Validation failed', 400);
  }

  const { user, token } = await authService.register(validation.data!);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  });
});

// Login user
export const login = catchAsync(async (req: Request, res: Response) => {
  // Validate request body
  const validation = validateRequest(loginSchema, req.body);
  if (!validation.success) {
    throw new AppError(validation.errors?.join(', ') || 'Validation failed', 400);
  }

  const { user, token } = await authService.login(validation.data!);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user,
      token,
    },
  });
});

// Logout user (client-side token removal)
export const logout = catchAsync(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

// Get current user profile
export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: {
      user: req.user,
    },
  });
});

// Forgot password
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  // Validate request body
  const validation = validateRequest(forgotPasswordSchema, req.body);
  if (!validation.success) {
    throw new AppError(validation.errors?.join(', ') || 'Validation failed', 400);
  }

  await authService.forgotPassword(validation.data!.email);

  res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.',
  });
});

// Reset password
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  // Validate request body
  const validation = validateRequest(resetPasswordSchema, req.body);
  if (!validation.success) {
    throw new AppError(validation.errors?.join(', ') || 'Validation failed', 400);
  }

  await authService.resetPassword(validation.data!.token, validation.data!.password);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

// Change password (for authenticated users)
export const changePassword = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  await authService.changePassword(req.user._id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// Update user profile
export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const allowedFields = ['firstName', 'lastName', 'bio', 'country', 'timezone', 'preferredLanguage'];
  const updateData: any = {};

  // Only allow specific fields to be updated
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw new AppError('No valid fields provided for update', 400);
  }

  const updatedUser = await authService.updateProfile(req.user._id, updateData);

  if (!updatedUser) {
    throw new AppError('Failed to update profile', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: updatedUser,
    },
  });
});

// Refresh token
export const refreshToken = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Generate new token
  const tokenPayload = {
    userId: req.user._id,
    email: req.user.email,
    role: req.user.role,
  };

  const newToken = authService.generateToken(tokenPayload);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token: newToken,
    },
  });
});



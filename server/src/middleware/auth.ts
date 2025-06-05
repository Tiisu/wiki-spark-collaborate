import { Response, NextFunction } from 'express';
import { User, UserRole } from '../models/index.js';
import { verifyToken, extractTokenFromHeader } from '../utils/auth.js';
import { AppError } from './errorHandler.js';
import { AuthenticatedRequest } from '../types/index.js';

/**
 * Middleware to authenticate users using JWT
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      throw new AppError('Access token required', 401);
    }

    const payload = verifyToken(token);

    // Get user from database
    const user = await User.findById(payload.userId).select('-password');

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    req.user = user as any;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authorize users based on roles
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Insufficient permissions', 403);
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource or is admin
 */
export const authorizeOwnerOrAdmin = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Authentication required', 401);
    }

    const resourceUserId = req.params[userIdParam];
    const isOwner = req.user.id === resourceUserId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      throw new AppError('Access denied', 403);
    }

    next();
  };
};

/**
 * Optional authentication - doesn't throw error if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const payload = verifyToken(token);

      const user = await User.findById(payload.userId).select('-password');

      if (user) {
        req.user = user as any;
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't throw errors
    next();
  }
};

/**
 * Middleware to check if email is verified
 */
export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }

  if (!req.user.isEmailVerified) {
    throw new AppError('Email verification required', 403);
  }

  next();
};

import { Response, NextFunction } from 'express';
import authService from '../services/authService';
import logger from '../utils/logger';
import { AuthRequest, UserRole } from '../types';

// Authenticate user middleware
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = authService.verifyToken(token);
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
      return;
    }

    // Get user from database
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found.',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);

    if (decoded) {
      const user = await authService.getUserById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    // Continue without user even if there's an error
    next();
  }
};

// Role-based authorization middleware
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      });
      return;
    }

    next();
  };
};

// Admin authorization middleware
export const requireAdmin = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

// Super admin authorization middleware
export const requireSuperAdmin = authorize(UserRole.SUPER_ADMIN);

// Instructor or higher authorization middleware
export const requireInstructor = authorize(
  UserRole.INSTRUCTOR,
  UserRole.MENTOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN
);

// Mentor or higher authorization middleware
export const requireMentor = authorize(
  UserRole.MENTOR,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN
);

// Check if user owns resource or has admin privileges
export const requireOwnershipOrAdmin = (getUserId: (req: AuthRequest) => string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.',
      });
      return;
    }

    const resourceUserId = getUserId(req);
    const isOwner = req.user._id.toString() === resourceUserId;
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(req.user.role);

    if (!isOwner && !isAdmin) {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.',
      });
      return;
    }

    next();
  };
};

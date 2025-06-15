import { Request, Response } from 'express';
import achievementService from '../services/achievementService';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

// Get user achievements
export const getUserAchievements = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { userId } = req.params;
  
  // Users can only see their own achievements unless they're admin
  const targetUserId = userId || req.user._id;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
  
  if (targetUserId !== req.user._id && !isAdmin) {
    throw new AppError('Access denied. You can only view your own achievements.', 403);
  }

  const achievements = await achievementService.getUserAchievements(targetUserId);

  res.status(200).json({
    success: true,
    message: 'Achievements retrieved successfully',
    data: { achievements }
  });
});

// Get current user's achievements
export const getMyAchievements = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const achievements = await achievementService.getUserAchievements(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Your achievements retrieved successfully',
    data: { achievements }
  });
});

// Check and award new achievements
export const checkAchievements = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const newAchievements = await achievementService.checkAndAwardAchievements(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Achievements checked successfully',
    data: { 
      newAchievements,
      count: newAchievements.length
    }
  });
});

// Get achievement statistics
export const getAchievementStats = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { userId } = req.params;
  
  // Users can only see their own stats unless they're admin
  const targetUserId = userId || req.user._id;
  const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
  
  if (targetUserId !== req.user._id && !isAdmin) {
    throw new AppError('Access denied. You can only view your own statistics.', 403);
  }

  const stats = await achievementService.getAchievementStats(targetUserId);

  res.status(200).json({
    success: true,
    message: 'Achievement statistics retrieved successfully',
    data: { stats }
  });
});

// Get all available badge definitions
export const getBadgeDefinitions = catchAsync(async (req: Request, res: Response) => {
  const badges = achievementService.getBadgeDefinitions();

  res.status(200).json({
    success: true,
    message: 'Badge definitions retrieved successfully',
    data: { badges }
  });
});

// Award achievement manually (admin only)
export const awardAchievement = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can manually award achievements
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const { userId, badgeType, metadata, courseId, quizId } = req.body;

  if (!userId || !badgeType) {
    throw new AppError('User ID and badge type are required', 400);
  }

  const achievement = await achievementService.awardAchievement(
    userId,
    badgeType,
    metadata,
    courseId,
    quizId
  );

  if (!achievement) {
    throw new AppError('Achievement already exists or could not be created', 400);
  }

  res.status(201).json({
    success: true,
    message: 'Achievement awarded successfully',
    data: { achievement }
  });
});

// Get achievement leaderboard
export const getAchievementLeaderboard = catchAsync(async (req: Request, res: Response) => {
  const { limit = 10, category } = req.query;

  // This would be implemented to show top users by achievements
  // For now, return a placeholder
  res.status(200).json({
    success: true,
    message: 'Achievement leaderboard retrieved successfully',
    data: {
      leaderboard: [],
      message: 'Leaderboard feature coming soon',
      filters: {
        limit: parseInt(limit as string),
        category: category as string
      }
    }
  });
});

// Get recent achievements across platform (admin only)
export const getRecentAchievements = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can see platform-wide achievements
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  const { limit = 20 } = req.query;

  // This would be implemented to show recent achievements across the platform
  // For now, return a placeholder
  res.status(200).json({
    success: true,
    message: 'Recent achievements retrieved successfully',
    data: {
      achievements: [],
      message: 'Recent achievements feature coming soon',
      limit: parseInt(limit as string)
    }
  });
});

// Get achievement analytics (admin only)
export const getAchievementAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Only admins can see analytics
  if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
    throw new AppError('Access denied. Admin privileges required.', 403);
  }

  // This would be implemented to show achievement analytics
  // For now, return a placeholder
  res.status(200).json({
    success: true,
    message: 'Achievement analytics retrieved successfully',
    data: {
      analytics: {
        totalAchievements: 0,
        achievementsByCategory: {},
        achievementsByMonth: [],
        topAchievements: [],
        userEngagement: {}
      },
      message: 'Achievement analytics feature coming soon'
    }
  });
});

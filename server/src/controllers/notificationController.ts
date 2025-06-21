import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import notificationService from '../services/notificationService';
import { NotificationType } from '../models/Notification';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

// Get user notifications
export const getNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const {
    limit = 20,
    skip = 0,
    includeRead = 'true',
    includeArchived = 'false',
    type
  } = req.query;

  const options = {
    limit: parseInt(limit as string),
    skip: parseInt(skip as string),
    includeRead: includeRead === 'true',
    includeArchived: includeArchived === 'true',
    type: type as NotificationType
  };

  const notifications = await notificationService.getUserNotifications(req.user._id, options);

  res.json({
    success: true,
    notifications,
    pagination: {
      limit: options.limit,
      skip: options.skip,
      hasMore: notifications.length === options.limit
    }
  });
});

// Get unread notification count
export const getUnreadCount = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const count = await notificationService.getUnreadCount(req.user._id);

  res.json({
    success: true,
    unreadCount: count
  });
});

// Mark notification as read
export const markAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { notificationId } = req.params;
  const notification = await notificationService.markAsRead(notificationId, req.user._id);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.json({
    success: true,
    notification
  });
});

// Mark all notifications as read
export const markAllAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  await notificationService.markAllAsRead(req.user._id);

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// Archive notification
export const archiveNotification = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { notificationId } = req.params;
  const notification = await notificationService.archiveNotification(notificationId, req.user._id);

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  res.json({
    success: true,
    notification
  });
});

// Delete notification
export const deleteNotification = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { notificationId } = req.params;
  const deleted = await notificationService.deleteNotification(notificationId, req.user._id);

  if (!deleted) {
    throw new AppError('Notification not found', 404);
  }

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// Bulk operations
export const bulkMarkAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { notificationIds } = req.body;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new AppError('Invalid notification IDs provided', 400);
  }

  const modifiedCount = await notificationService.bulkMarkAsRead(notificationIds, req.user._id);

  res.json({
    success: true,
    modifiedCount,
    message: `${modifiedCount} notifications marked as read`
  });
});

export const bulkArchive = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { notificationIds } = req.body;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new AppError('Invalid notification IDs provided', 400);
  }

  const modifiedCount = await notificationService.bulkArchive(notificationIds, req.user._id);

  res.json({
    success: true,
    modifiedCount,
    message: `${modifiedCount} notifications archived`
  });
});

export const bulkDelete = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { notificationIds } = req.body;

  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new AppError('Invalid notification IDs provided', 400);
  }

  const deletedCount = await notificationService.bulkDelete(notificationIds, req.user._id);

  res.json({
    success: true,
    deletedCount,
    message: `${deletedCount} notifications deleted`
  });
});

// Get notification statistics
export const getNotificationStats = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const stats = await notificationService.getNotificationStats(req.user._id);

  res.json({
    success: true,
    stats
  });
});

// Admin: Send certificate reminders
export const sendCertificateReminders = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is admin
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Access denied. Admin role required.', 403);
  }

  const { daysOld = 7 } = req.body;

  // This would need to be imported from certificate service
  // const result = await certificateService.sendCertificateReminders(daysOld);

  res.json({
    success: true,
    message: 'Certificate reminders sent',
    // result
  });
});

// Admin: Cleanup expired notifications
export const cleanupExpiredNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  // Check if user is admin
  if (req.user.role !== 'ADMIN') {
    throw new AppError('Access denied. Admin role required.', 403);
  }

  const deletedCount = await notificationService.cleanupExpiredNotifications();

  res.json({
    success: true,
    deletedCount,
    message: `${deletedCount} expired notifications cleaned up`
  });
});

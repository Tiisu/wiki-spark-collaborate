import Notification, { INotification, NotificationType, NotificationPriority } from '../models/Notification';
import logger from '../utils/logger';

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  data?: {
    certificateId?: string;
    courseId?: string;
    achievementId?: string;
    actionUrl?: string;
    actionText?: string;
    [key: string]: any;
  };
  expiresAt?: Date;
}

class NotificationService {
  // Create a new notification
  async createNotification(notificationData: CreateNotificationData): Promise<INotification> {
    try {
      const notification = new Notification({
        user: notificationData.userId,
        type: notificationData.type,
        priority: notificationData.priority || NotificationPriority.MEDIUM,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data,
        expiresAt: notificationData.expiresAt
      });

      await notification.save();
      logger.info(`Notification created for user ${notificationData.userId}: ${notificationData.title}`);
      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Create certificate issued notification
  async createCertificateNotification(
    userId: string,
    certificateId: string,
    courseName: string,
    verificationCode: string
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      type: NotificationType.CERTIFICATE_ISSUED,
      priority: NotificationPriority.HIGH,
      title: '🎓 Certificate Ready!',
      message: `Congratulations! Your certificate for "${courseName}" has been generated and is ready for download.`,
      data: {
        certificateId,
        actionUrl: `/certificates`,
        actionText: 'View Certificate'
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Expire in 30 days
    });
  }

  // Create course completion notification
  async createCourseCompletionNotification(
    userId: string,
    courseId: string,
    courseName: string
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      type: NotificationType.COURSE_COMPLETED,
      priority: NotificationPriority.MEDIUM,
      title: '🎉 Course Completed!',
      message: `Congratulations on completing "${courseName}"! Check if you're eligible for a certificate.`,
      data: {
        courseId,
        actionUrl: `/courses/${courseId}`,
        actionText: 'Check Certificate'
      },
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expire in 7 days
    });
  }

  // Create achievement notification
  async createAchievementNotification(
    userId: string,
    achievementId: string,
    achievementName: string
  ): Promise<INotification> {
    return this.createNotification({
      userId,
      type: NotificationType.ACHIEVEMENT_EARNED,
      priority: NotificationPriority.MEDIUM,
      title: '🏆 Achievement Unlocked!',
      message: `You've earned the "${achievementName}" achievement! Great work on your learning journey.`,
      data: {
        achievementId,
        actionUrl: `/achievements`,
        actionText: 'View Achievements'
      },
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Expire in 14 days
    });
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      skip?: number;
      includeRead?: boolean;
      includeArchived?: boolean;
      type?: NotificationType;
    } = {}
  ): Promise<INotification[]> {
    try {
      const notifications = await Notification.getUserNotifications(userId, options);
      return notifications;
    } catch (error) {
      logger.error('Failed to get user notifications:', error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await Notification.getUnreadCount(userId);
    } catch (error) {
      logger.error('Failed to get unread notification count:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        user: userId
      });

      if (!notification) {
        return null;
      }

      await notification.markAsRead();
      return notification;
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await Notification.markAllAsRead(userId);
      logger.info(`All notifications marked as read for user ${userId}`);
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Archive notification
  async archiveNotification(notificationId: string, userId: string): Promise<INotification | null> {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        user: userId
      });

      if (!notification) {
        return null;
      }

      await notification.archive();
      return notification;
    } catch (error) {
      logger.error('Failed to archive notification:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await Notification.deleteOne({
        _id: notificationId,
        user: userId
      });

      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Bulk operations
  async bulkMarkAsRead(notificationIds: string[], userId: string): Promise<number> {
    try {
      const result = await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          user: userId,
          isRead: false
        },
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );

      return result.modifiedCount;
    } catch (error) {
      logger.error('Failed to bulk mark notifications as read:', error);
      throw error;
    }
  }

  async bulkArchive(notificationIds: string[], userId: string): Promise<number> {
    try {
      const result = await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          user: userId,
          isArchived: false
        },
        {
          $set: {
            isArchived: true,
            archivedAt: new Date()
          }
        }
      );

      return result.modifiedCount;
    } catch (error) {
      logger.error('Failed to bulk archive notifications:', error);
      throw error;
    }
  }

  async bulkDelete(notificationIds: string[], userId: string): Promise<number> {
    try {
      const result = await Notification.deleteMany({
        _id: { $in: notificationIds },
        user: userId
      });

      return result.deletedCount;
    } catch (error) {
      logger.error('Failed to bulk delete notifications:', error);
      throw error;
    }
  }

  // Cleanup expired notifications (should be run periodically)
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const result = await Notification.cleanupExpiredNotifications();
      logger.info(`Cleaned up ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup expired notifications:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
  }> {
    try {
      const [total, unread, byType, byPriority] = await Promise.all([
        Notification.countDocuments({ user: userId, isArchived: false }),
        Notification.countDocuments({ user: userId, isRead: false, isArchived: false }),
        Notification.aggregate([
          { $match: { user: userId, isArchived: false } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Notification.aggregate([
          { $match: { user: userId, isArchived: false } },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ])
      ]);

      const typeStats = Object.values(NotificationType).reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<NotificationType, number>);

      const priorityStats = Object.values(NotificationPriority).reduce((acc, priority) => {
        acc[priority] = 0;
        return acc;
      }, {} as Record<NotificationPriority, number>);

      byType.forEach(item => {
        typeStats[item._id as NotificationType] = item.count;
      });

      byPriority.forEach(item => {
        priorityStats[item._id as NotificationPriority] = item.count;
      });

      return {
        total,
        unread,
        byType: typeStats,
        byPriority: priorityStats
      };
    } catch (error) {
      logger.error('Failed to get notification statistics:', error);
      throw error;
    }
  }
}

export default new NotificationService();

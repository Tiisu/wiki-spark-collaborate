import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  bulkMarkAsRead,
  bulkArchive,
  bulkDelete,
  getNotificationStats,
  sendCertificateReminders,
  cleanupExpiredNotifications
} from '../controllers/notificationController';

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Get notification statistics
router.get('/stats', getNotificationStats);

// Mark notification as read
router.patch('/:notificationId/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Archive notification
router.patch('/:notificationId/archive', archiveNotification);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Bulk operations
router.patch('/bulk/mark-read', bulkMarkAsRead);
router.patch('/bulk/archive', bulkArchive);
router.delete('/bulk/delete', bulkDelete);

// Admin routes
router.post('/admin/send-certificate-reminders', sendCertificateReminders);
router.delete('/admin/cleanup-expired', cleanupExpiredNotifications);

export default router;

import mongoose, { Schema } from 'mongoose';

export enum NotificationType {
  CERTIFICATE_ISSUED = 'CERTIFICATE_ISSUED',
  CERTIFICATE_REMINDER = 'CERTIFICATE_REMINDER',
  COURSE_COMPLETED = 'COURSE_COMPLETED',
  ACHIEVEMENT_EARNED = 'ACHIEVEMENT_EARNED',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface INotification extends mongoose.Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  type: NotificationType;
  priority: NotificationPriority;
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
  isRead: boolean;
  readAt?: Date;
  isArchived: boolean;
  archivedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required'],
    index: true
  },
  type: {
    type: String,
    enum: Object.values(NotificationType),
    required: [true, 'Notification type is required'],
    index: true
  },
  priority: {
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  data: {
    certificateId: {
      type: String,
      trim: true
    },
    courseId: {
      type: String,
      trim: true
    },
    achievementId: {
      type: String,
      trim: true
    },
    actionUrl: {
      type: String,
      trim: true
    },
    actionText: {
      type: String,
      trim: true,
      maxlength: [50, 'Action text cannot exceed 50 characters']
    }
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true
  },
  archivedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ user: 1, type: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

// Static methods
notificationSchema.statics.createCertificateNotification = function(
  userId: string,
  certificateId: string,
  courseName: string,
  verificationCode: string
) {
  return this.create({
    user: userId,
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
};

notificationSchema.statics.createCourseCompletionNotification = function(
  userId: string,
  courseId: string,
  courseName: string
) {
  return this.create({
    user: userId,
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
};

notificationSchema.statics.createAchievementNotification = function(
  userId: string,
  achievementId: string,
  achievementName: string
) {
  return this.create({
    user: userId,
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
};

notificationSchema.statics.getUserNotifications = function(
  userId: string,
  options: {
    limit?: number;
    skip?: number;
    includeRead?: boolean;
    includeArchived?: boolean;
    type?: NotificationType;
  } = {}
) {
  const {
    limit = 20,
    skip = 0,
    includeRead = true,
    includeArchived = false,
    type
  } = options;

  const query: any = { user: userId };
  
  if (!includeRead) {
    query.isRead = false;
  }
  
  if (!includeArchived) {
    query.isArchived = false;
  }
  
  if (type) {
    query.type = type;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

notificationSchema.statics.getUnreadCount = function(userId: string) {
  return this.countDocuments({
    user: userId,
    isRead: false,
    isArchived: false
  });
};

notificationSchema.statics.markAllAsRead = function(userId: string) {
  return this.updateMany(
    { user: userId, isRead: false },
    { 
      $set: { 
        isRead: true, 
        readAt: new Date() 
      } 
    }
  );
};

notificationSchema.statics.cleanupExpiredNotifications = function() {
  return this.deleteMany({
    expiresAt: { $lte: new Date() }
  });
};

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;

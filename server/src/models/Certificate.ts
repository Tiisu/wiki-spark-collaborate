import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

export interface ICertificate extends mongoose.Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  verificationCode: string;
  issuedAt: Date;
  completionDate: Date;
  finalScore?: number; // Overall course score
  timeSpent: number; // Total time spent on course in minutes
  instructorName: string;
  courseName: string;
  courseLevel: string;
  certificateUrl?: string; // URL to generated PDF certificate
  isValid: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  metadata: {
    totalLessons: number;
    completedLessons: number;
    totalQuizzes: number;
    passedQuizzes: number;
    averageQuizScore?: number;
    achievements: string[]; // Badge types earned during course
  };
  createdAt: Date;
  updatedAt: Date;
}

const certificateSchema = new Schema<ICertificate>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  verificationCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  issuedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completionDate: {
    type: Date,
    required: true
  },
  finalScore: {
    type: Number,
    min: [0, 'Final score cannot be negative'],
    max: [100, 'Final score cannot exceed 100']
  },
  timeSpent: {
    type: Number,
    required: true,
    min: [0, 'Time spent cannot be negative']
  },
  instructorName: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true,
    maxlength: [100, 'Instructor name cannot exceed 100 characters']
  },
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    maxlength: [200, 'Course name cannot exceed 200 characters']
  },
  courseLevel: {
    type: String,
    required: [true, 'Course level is required'],
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
  },
  certificateUrl: {
    type: String,
    trim: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  revokedAt: {
    type: Date
  },
  revokedReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Revocation reason cannot exceed 500 characters']
  },
  metadata: {
    totalLessons: {
      type: Number,
      required: true,
      min: [0, 'Total lessons cannot be negative']
    },
    completedLessons: {
      type: Number,
      required: true,
      min: [0, 'Completed lessons cannot be negative']
    },
    totalQuizzes: {
      type: Number,
      required: true,
      min: [0, 'Total quizzes cannot be negative']
    },
    passedQuizzes: {
      type: Number,
      required: true,
      min: [0, 'Passed quizzes cannot be negative']
    },
    averageQuizScore: {
      type: Number,
      min: [0, 'Average quiz score cannot be negative'],
      max: [100, 'Average quiz score cannot exceed 100']
    },
    achievements: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Generate unique verification code before saving
certificateSchema.pre('save', function(next) {
  if (!this.verificationCode) {
    // Generate a unique verification code: WWT-YYYY-XXXXXXXX
    const year = new Date().getFullYear();
    const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.verificationCode = `WWT-${year}-${randomCode}`;
  }
  next();
});

// Indexes for better query performance
certificateSchema.index({ user: 1 });
certificateSchema.index({ course: 1 });
certificateSchema.index({ verificationCode: 1 }, { unique: true });
certificateSchema.index({ issuedAt: -1 });
certificateSchema.index({ isValid: 1 });
certificateSchema.index({ user: 1, course: 1 }, { unique: true }); // One certificate per user per course

// Static method to verify certificate
certificateSchema.statics.verifyCertificate = function(verificationCode: string) {
  return this.findOne({ 
    verificationCode, 
    isValid: true 
  }).populate('user', 'firstName lastName username')
    .populate('course', 'title level category');
};

const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);

export default Certificate;

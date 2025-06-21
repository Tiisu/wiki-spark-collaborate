import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

export enum CertificateStatus {
  PENDING = 'PENDING',
  GENERATED = 'GENERATED',
  DOWNLOADED = 'DOWNLOADED',
  REVOKED = 'REVOKED'
}

export enum CertificateTemplate {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
  CUSTOM = 'CUSTOM'
}

export interface ICertificate extends mongoose.Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  verificationCode: string;
  certificateId: string; // Human-readable certificate ID
  status: CertificateStatus;
  template: CertificateTemplate;
  issuedAt: Date;
  completionDate: Date;
  finalScore?: number; // Overall course score
  timeSpent: number; // Total time spent on course in minutes
  instructorName: string;
  courseName: string;
  courseLevel: string;
  courseCategory: string;
  studentName: string; // Full name of the student
  studentEmail: string; // Student's email for verification
  certificateUrl?: string; // URL to generated PDF certificate
  pdfPath?: string; // Local file path to PDF
  pdfSize?: number; // PDF file size in bytes
  downloadCount: number; // Track how many times downloaded
  lastDownloadedAt?: Date;
  shareableUrl?: string; // Public URL for sharing
  isValid: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  revokedBy?: mongoose.Types.ObjectId; // Admin who revoked
  metadata: {
    totalLessons: number;
    completedLessons: number;
    totalQuizzes: number;
    passedQuizzes: number;
    averageQuizScore?: number;
    achievements: string[]; // Badge types earned during course
    courseDuration: number; // Course duration in hours
    enrollmentDate: Date;
    completionRate: number; // Percentage of course completed
    skillsAcquired: string[]; // Skills learned in the course
    wikipediaProject: string; // Which Wikipedia project this relates to
  };
  verification: {
    qrCode?: string; // QR code data for quick verification
    digitalSignature?: string; // Digital signature for authenticity
    verificationUrl: string; // Public verification URL
    lastVerifiedAt?: Date;
    verificationCount: number; // How many times verified
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
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(CertificateStatus),
    default: CertificateStatus.PENDING
  },
  template: {
    type: String,
    enum: Object.values(CertificateTemplate),
    default: CertificateTemplate.STANDARD
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
  courseCategory: {
    type: String,
    required: [true, 'Course category is required'],
    trim: true,
    maxlength: [100, 'Course category cannot exceed 100 characters']
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    maxlength: [100, 'Student name cannot exceed 100 characters']
  },
  studentEmail: {
    type: String,
    required: [true, 'Student email is required'],
    trim: true,
    lowercase: true
  },
  certificateUrl: {
    type: String,
    trim: true
  },
  pdfPath: {
    type: String,
    trim: true
  },
  pdfSize: {
    type: Number,
    min: [0, 'PDF size cannot be negative']
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative']
  },
  lastDownloadedAt: {
    type: Date
  },
  shareableUrl: {
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
  revokedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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
    }],
    courseDuration: {
      type: Number,
      required: true,
      min: [0, 'Course duration cannot be negative']
    },
    enrollmentDate: {
      type: Date,
      required: true
    },
    completionRate: {
      type: Number,
      required: true,
      min: [0, 'Completion rate cannot be negative'],
      max: [100, 'Completion rate cannot exceed 100']
    },
    skillsAcquired: [{
      type: String,
      trim: true
    }],
    wikipediaProject: {
      type: String,
      trim: true,
      maxlength: [100, 'Wikipedia project cannot exceed 100 characters']
    }
  },
  verification: {
    qrCode: {
      type: String,
      trim: true
    },
    digitalSignature: {
      type: String,
      trim: true
    },
    verificationUrl: {
      type: String,
      required: true,
      trim: true
    },
    lastVerifiedAt: {
      type: Date
    },
    verificationCount: {
      type: Number,
      default: 0,
      min: [0, 'Verification count cannot be negative']
    }
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

// Generate unique codes before saving
certificateSchema.pre('save', function(next) {
  if (!this.verificationCode) {
    // Generate a unique verification code: WWT-YYYY-XXXXXXXX
    const year = new Date().getFullYear();
    const randomCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    this.verificationCode = `WWT-${year}-${randomCode}`;
  }

  if (!this.certificateId) {
    // Generate human-readable certificate ID: CERT-YYYY-NNNNNN
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    this.certificateId = `CERT-${year}-${randomNum}`;
  }

  if (!this.verification.verificationUrl) {
    // Generate verification URL
    this.verification.verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${this.verificationCode}`;
  }

  if (!this.shareableUrl) {
    // Generate shareable URL
    this.shareableUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/certificates/public/${this.verificationCode}`;
  }

  next();
});

// Indexes for better query performance
certificateSchema.index({ user: 1 });
certificateSchema.index({ course: 1 });
certificateSchema.index({ verificationCode: 1 }, { unique: true });
certificateSchema.index({ certificateId: 1 }, { unique: true });
certificateSchema.index({ issuedAt: -1 });
certificateSchema.index({ isValid: 1 });
certificateSchema.index({ status: 1 });
certificateSchema.index({ template: 1 });
certificateSchema.index({ user: 1, course: 1 }, { unique: true }); // One certificate per user per course
certificateSchema.index({ studentEmail: 1 });
certificateSchema.index({ downloadCount: -1 });
certificateSchema.index({ 'verification.verificationCount': -1 });

// Static method to verify certificate
certificateSchema.statics.verifyCertificate = function(verificationCode: string) {
  return this.findOne({
    verificationCode,
    isValid: true
  }).populate('user', 'firstName lastName username email')
    .populate('course', 'title level category description');
};

// Instance method to increment download count
certificateSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  return this.save();
};

// Instance method to increment verification count
certificateSchema.methods.incrementVerificationCount = function() {
  this.verification.verificationCount += 1;
  this.verification.lastVerifiedAt = new Date();
  return this.save();
};

const Certificate = mongoose.model<ICertificate>('Certificate', certificateSchema);

export default Certificate;

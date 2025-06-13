import mongoose, { Schema } from 'mongoose';

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  SUSPENDED = 'SUSPENDED'
}

export interface IEnrollment extends mongoose.Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  status: EnrollmentStatus;
  progress: number; // percentage (0-100)
  completedLessons: mongoose.Types.ObjectId[];
  lastAccessedLesson?: mongoose.Types.ObjectId;
  enrolledAt: Date;
  completedAt?: Date;
  certificateIssued: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>({
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
  status: {
    type: String,
    enum: Object.values(EnrollmentStatus),
    default: EnrollmentStatus.ACTIVE
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100']
  },
  completedLessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  lastAccessedLesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  certificateIssued: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true }); // One enrollment per user per course
enrollmentSchema.index({ user: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ user: 1, enrolledAt: -1 });
enrollmentSchema.index({ course: 1, enrolledAt: -1 });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ progress: 1 });

const Enrollment = mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);

export default Enrollment;

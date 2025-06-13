import mongoose, { Schema } from 'mongoose';

export enum ProgressStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface IProgress extends mongoose.Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  status: ProgressStatus;
  timeSpent: number; // in seconds
  completionPercentage: number; // 0-100
  lastPosition?: number; // for video lessons, position in seconds
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const progressSchema = new Schema<IProgress>({
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
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson reference is required']
  },
  status: {
    type: String,
    enum: Object.values(ProgressStatus),
    default: ProgressStatus.NOT_STARTED
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: [0, 'Time spent cannot be negative']
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Completion percentage cannot be negative'],
    max: [100, 'Completion percentage cannot exceed 100']
  },
  lastPosition: {
    type: Number,
    min: [0, 'Last position cannot be negative']
  },
  completedAt: {
    type: Date
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
progressSchema.index({ user: 1, lesson: 1 }, { unique: true }); // One progress record per user per lesson
progressSchema.index({ user: 1, course: 1 });
progressSchema.index({ user: 1, status: 1 });
progressSchema.index({ course: 1, status: 1 });
progressSchema.index({ lesson: 1, status: 1 });
progressSchema.index({ user: 1, updatedAt: -1 });

const Progress = mongoose.model<IProgress>('Progress', progressSchema);

export default Progress;

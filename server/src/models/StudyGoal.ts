import mongoose, { Schema } from 'mongoose';

export enum GoalUnit {
  LESSONS = 'lessons',
  HOURS = 'hours',
  COURSES = 'courses',
  POINTS = 'points'
}

export enum GoalStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  EXPIRED = 'expired'
}

export interface IStudyGoal extends mongoose.Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  target: number;
  current: number;
  unit: GoalUnit;
  deadline: Date;
  status: GoalStatus;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studyGoalSchema = new Schema<IStudyGoal>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [200, 'Goal title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Goal description cannot exceed 1000 characters']
  },
  target: {
    type: Number,
    required: [true, 'Goal target is required'],
    min: [1, 'Goal target must be at least 1']
  },
  current: {
    type: Number,
    default: 0,
    min: [0, 'Current progress cannot be negative']
  },
  unit: {
    type: String,
    enum: Object.values(GoalUnit),
    required: [true, 'Goal unit is required']
  },
  deadline: {
    type: Date,
    required: [true, 'Goal deadline is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  status: {
    type: String,
    enum: Object.values(GoalStatus),
    default: GoalStatus.ACTIVE
  },
  isCompleted: {
    type: Boolean,
    default: false
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
studyGoalSchema.index({ user: 1, status: 1 });
studyGoalSchema.index({ user: 1, deadline: 1 });
studyGoalSchema.index({ user: 1, isCompleted: 1 });
studyGoalSchema.index({ deadline: 1, status: 1 });

// Pre-save middleware to update completion status
studyGoalSchema.pre('save', function(next) {
  if (this.current >= this.target && !this.isCompleted) {
    this.isCompleted = true;
    this.status = GoalStatus.COMPLETED;
    this.completedAt = new Date();
  }
  
  // Check if goal is expired
  if (new Date() > this.deadline && this.status === GoalStatus.ACTIVE) {
    this.status = GoalStatus.EXPIRED;
  }
  
  next();
});

const StudyGoal = mongoose.model<IStudyGoal>('StudyGoal', studyGoalSchema);

export default StudyGoal;

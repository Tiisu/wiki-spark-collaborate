import mongoose, { Schema } from 'mongoose';

export enum StepType {
  COURSE = 'course',
  SKILL = 'skill',
  PROJECT = 'project',
  ASSESSMENT = 'assessment'
}

export enum StepStatus {
  COMPLETED = 'completed',
  CURRENT = 'current',
  LOCKED = 'locked',
  AVAILABLE = 'available'
}

export enum DifficultyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface ILearningPathStep {
  id: string;
  title: string;
  description: string;
  type: StepType;
  status: StepStatus;
  progress: number;
  estimatedHours: number;
  difficulty: DifficultyLevel;
  prerequisites?: string[];
  skills: string[];
  courseId?: string;
  order: number;
}

export interface ILearningPath extends mongoose.Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  totalSteps: number;
  completedSteps: number;
  estimatedHours: number;
  difficulty: DifficultyLevel;
  steps: ILearningPathStep[];
  isPublished: boolean;
  createdBy: mongoose.Types.ObjectId;
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  skillsAcquired: string[];
  targetAudience: string;
  createdAt: Date;
  updatedAt: Date;
}

const learningPathStepSchema = new Schema<ILearningPathStep>({
  title: {
    type: String,
    required: [true, 'Step title is required'],
    trim: true,
    maxlength: [200, 'Step title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Step description is required'],
    trim: true,
    maxlength: [1000, 'Step description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: Object.values(StepType),
    required: [true, 'Step type is required']
  },
  status: {
    type: String,
    enum: Object.values(StepStatus),
    default: StepStatus.AVAILABLE
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%']
  },
  estimatedHours: {
    type: Number,
    required: [true, 'Estimated hours is required'],
    min: [0, 'Estimated hours cannot be negative']
  },
  difficulty: {
    type: String,
    enum: Object.values(DifficultyLevel),
    required: [true, 'Difficulty level is required']
  },
  prerequisites: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    required: true,
    trim: true
  }],
  courseId: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    required: [true, 'Step order is required'],
    min: [1, 'Step order must be at least 1']
  }
}, {
  _id: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    }
  }
});

const learningPathSchema = new Schema<ILearningPath>({
  title: {
    type: String,
    required: [true, 'Learning path title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Learning path description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  totalSteps: {
    type: Number,
    default: 0,
    min: [0, 'Total steps cannot be negative']
  },
  completedSteps: {
    type: Number,
    default: 0,
    min: [0, 'Completed steps cannot be negative']
  },
  estimatedHours: {
    type: Number,
    required: [true, 'Estimated hours is required'],
    min: [0, 'Estimated hours cannot be negative']
  },
  difficulty: {
    type: String,
    enum: Object.values(DifficultyLevel),
    required: [true, 'Difficulty level is required']
  },
  steps: [learningPathStepSchema],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  prerequisites: [{
    type: String,
    trim: true,
    maxlength: [200, 'Prerequisite cannot exceed 200 characters']
  }],
  learningObjectives: [{
    type: String,
    trim: true,
    maxlength: [300, 'Learning objective cannot exceed 300 characters']
  }],
  skillsAcquired: [{
    type: String,
    trim: true,
    maxlength: [100, 'Skill cannot exceed 100 characters']
  }],
  targetAudience: {
    type: String,
    trim: true,
    maxlength: [500, 'Target audience cannot exceed 500 characters']
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
learningPathSchema.index({ isPublished: 1, difficulty: 1 });
learningPathSchema.index({ category: 1, isPublished: 1 });
learningPathSchema.index({ createdBy: 1 });
learningPathSchema.index({ tags: 1 });

// Pre-save middleware to update totalSteps
learningPathSchema.pre('save', function(next) {
  if (this.steps) {
    this.totalSteps = this.steps.length;
  }
  next();
});

const LearningPath = mongoose.model<ILearningPath>('LearningPath', learningPathSchema);

export default LearningPath;

import mongoose, { Schema } from 'mongoose';

export interface IQuizAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  weight?: number;
  weightedPointsEarned?: number;
  partialCredit?: number; // 0-1 for partial credit percentage
  timeSpent?: number; // in seconds
}

export interface IQuizAttempt extends mongoose.Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  answers: IQuizAnswer[];
  score: number; // Weighted percentage (0-100)
  rawScore?: number; // Unweighted percentage (0-100)
  totalPoints: number;
  earnedPoints: number;
  totalWeightedPoints?: number;
  earnedWeightedPoints?: number;
  passed: boolean;
  timeSpent: number; // Total time in seconds
  startedAt: Date;
  completedAt?: Date;
  attemptNumber: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizAnswerSchema = new Schema({
  questionId: {
    type: String,
    required: true
  },
  userAnswer: {
    type: Schema.Types.Mixed, // Can be string or array
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  pointsEarned: {
    type: Number,
    required: true,
    min: [0, 'Points earned cannot be negative']
  },
  maxPoints: {
    type: Number,
    required: true,
    min: [0, 'Max points cannot be negative']
  },
  weight: {
    type: Number,
    default: 1,
    min: [0.1, 'Weight must be at least 0.1']
  },
  weightedPointsEarned: {
    type: Number,
    min: [0, 'Weighted points earned cannot be negative']
  },
  partialCredit: {
    type: Number,
    min: [0, 'Partial credit cannot be negative'],
    max: [1, 'Partial credit cannot exceed 1']
  },
  timeSpent: {
    type: Number,
    min: [0, 'Time spent cannot be negative']
  }
}, { _id: false });

const quizAttemptSchema = new Schema<IQuizAttempt>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  quiz: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: [true, 'Quiz reference is required']
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
  answers: [quizAnswerSchema],
  score: {
    type: Number,
    required: true,
    min: [0, 'Score cannot be negative'],
    max: [100, 'Score cannot exceed 100']
  },
  rawScore: {
    type: Number,
    min: [0, 'Raw score cannot be negative'],
    max: [100, 'Raw score cannot exceed 100']
  },
  totalPoints: {
    type: Number,
    required: true,
    min: [0, 'Total points cannot be negative']
  },
  earnedPoints: {
    type: Number,
    required: true,
    min: [0, 'Earned points cannot be negative']
  },
  totalWeightedPoints: {
    type: Number,
    min: [0, 'Total weighted points cannot be negative']
  },
  earnedWeightedPoints: {
    type: Number,
    min: [0, 'Earned weighted points cannot be negative']
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true,
    min: [0, 'Time spent cannot be negative']
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: [1, 'Attempt number must be at least 1']
  },
  isCompleted: {
    type: Boolean,
    default: false
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

// Indexes for better query performance
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ user: 1, course: 1 });
quizAttemptSchema.index({ quiz: 1 });
quizAttemptSchema.index({ completedAt: -1 });
quizAttemptSchema.index({ score: -1 });

// Compound index for finding user's attempts for a specific quiz
quizAttemptSchema.index({ user: 1, quiz: 1, attemptNumber: -1 });

const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;

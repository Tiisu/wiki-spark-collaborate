import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Document {
  _id: string;
  title: string;
  description?: string;
  questions: any[]; // Array of question objects
  passingScore: number;
  timeLimit?: number; // in minutes
  lessonId: string;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: null
  },
  questions: {
    type: [Object],
    required: true,
    validate: {
      validator: function(v: any[]) {
        return v && v.length > 0;
      },
      message: 'Quiz must have at least one question'
    }
  },
  passingScore: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  timeLimit: {
    type: Number,
    default: null,
    min: 1
  },
  lessonId: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
quizSchema.index({ lessonId: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);

// Quiz Attempt Model
export interface IQuizAttempt extends Document {
  _id: string;
  answers: any; // User's answers
  score: number;
  passed: boolean;
  timeSpent: number; // in seconds
  userId: string;
  quizId: string;
  createdAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>({
  answers: {
    type: Object,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    required: true,
    min: 0
  },
  userId: {
    type: String,
    required: true
  },
  quizId: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
quizAttemptSchema.index({ userId: 1 });
quizAttemptSchema.index({ quizId: 1 });
quizAttemptSchema.index({ userId: 1, quizId: 1 });

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);

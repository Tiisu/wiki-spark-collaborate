import mongoose, { Schema } from 'mongoose';

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  MATCHING = 'MATCHING',
  ORDERING = 'ORDERING'
}

export interface IQuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | string[]; // Can be single answer or array for multiple correct
  explanation?: string;
  points: number;
  order: number;
}

export interface IQuiz extends mongoose.Document {
  _id: string;
  title: string;
  description?: string;
  lesson: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  questions: IQuizQuestion[];
  passingScore: number; // Percentage (0-100)
  timeLimit?: number; // in minutes, optional
  maxAttempts?: number; // unlimited if not set
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  isRequired: boolean; // Must pass to complete lesson
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(QuestionType),
    required: true
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    maxlength: [1000, 'Question cannot exceed 1000 characters']
  },
  options: [{
    type: String,
    trim: true,
    maxlength: [500, 'Option cannot exceed 500 characters']
  }],
  correctAnswer: {
    type: Schema.Types.Mixed, // Can be string or array
    required: [true, 'Correct answer is required']
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters']
  },
  points: {
    type: Number,
    required: true,
    min: [1, 'Points must be at least 1'],
    max: [100, 'Points cannot exceed 100']
  },
  order: {
    type: Number,
    required: true,
    min: [1, 'Order must be at least 1']
  }
}, { _id: false });

const quizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Quiz title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Quiz description cannot exceed 1000 characters']
  },
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson reference is required']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course reference is required']
  },
  questions: [quizQuestionSchema],
  passingScore: {
    type: Number,
    required: true,
    min: [0, 'Passing score cannot be negative'],
    max: [100, 'Passing score cannot exceed 100'],
    default: 70
  },
  timeLimit: {
    type: Number,
    min: [1, 'Time limit must be at least 1 minute']
  },
  maxAttempts: {
    type: Number,
    min: [1, 'Max attempts must be at least 1']
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  showScoreImmediately: {
    type: Boolean,
    default: true
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true,
    min: [1, 'Order must be at least 1']
  },
  isPublished: {
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
quizSchema.index({ lesson: 1 });
quizSchema.index({ course: 1 });
quizSchema.index({ isPublished: 1 });
quizSchema.index({ order: 1 });

const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);

export default Quiz;

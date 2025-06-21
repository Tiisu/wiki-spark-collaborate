import { Request } from 'express';
import { Document } from 'mongoose';
import { ICourse } from '../models/Course';
import { IModule } from '../models/Module';
import { ILesson } from '../models/Lesson';
import { IEnrollment } from '../models/Enrollment';
import { IProgress } from '../models/Progress';

// User roles enum
export enum UserRole {
  LEARNER = 'learner',
  INSTRUCTOR = 'instructor',
  MENTOR = 'mentor',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

// User interface
export interface IUser extends Document {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  bio?: string;
  country?: string;
  timezone?: string;
  preferredLanguage?: string;
  isEmailVerified: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
}

// Auth request interface
export interface AuthRequest extends Request {
  user?: IUser;
}

// Registration request body
export interface RegisterRequestBody {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  country?: string;
  preferredLanguage?: string;
}

// Login request body
export interface LoginRequestBody {
  email: string;
  password: string;
}

// Password reset request body
export interface ForgotPasswordRequestBody {
  email: string;
}

// Reset password request body
export interface ResetPasswordRequestBody {
  token: string;
  password: string;
}

// Course request bodies
export interface CreateCourseRequestBody {
  title: string;
  description: string;
  level: string;
  category: string;
  tags?: string[];
  price?: number;
  thumbnail?: string;
}

export interface UpdateCourseRequestBody {
  title?: string;
  description?: string;
  level?: string;
  category?: string;
  tags?: string[];
  price?: number;
  thumbnail?: string;
  status?: string;
  isPublished?: boolean;
}

// Module request bodies
export interface CreateModuleRequestBody {
  title: string;
  description?: string;
  order: number;
}

export interface UpdateModuleRequestBody {
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

// Lesson request bodies
export interface CreateLessonRequestBody {
  title: string;
  description?: string;
  content: string;
  type: string;
  order: number;
  duration?: number;
  videoUrl?: string;
  resources?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  isFree?: boolean;

  // Wikipedia-specific fields
  wikipediaExercise?: {
    articleTitle?: string;
    initialContent?: string;
    targetContent?: string;
    instructions: string;
    editingMode: 'sandbox' | 'guided' | 'live';
    allowedActions: string[];
    successCriteria: Array<{
      type: 'contains' | 'format' | 'structure' | 'links' | 'citations';
      description: string;
      required: boolean;
    }>;
  };

  // Interactive elements
  interactiveElements?: Array<{
    type: 'tooltip' | 'highlight' | 'popup' | 'guide';
    trigger: string;
    content: string;
    position?: string;
  }>;

  // Assessment criteria
  assessmentCriteria?: Array<{
    criterion: string;
    weight: number;
    description: string;
  }>;
}

export interface UpdateLessonRequestBody {
  title?: string;
  description?: string;
  content?: string;
  type?: string;
  order?: number;
  duration?: number;
  videoUrl?: string;
  resources?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
  isPublished?: boolean;
  isFree?: boolean;

  // Wikipedia-specific fields
  wikipediaExercise?: {
    articleTitle?: string;
    initialContent?: string;
    targetContent?: string;
    instructions: string;
    editingMode: 'sandbox' | 'guided' | 'live';
    allowedActions: string[];
    successCriteria: Array<{
      type: 'contains' | 'format' | 'structure' | 'links' | 'citations';
      description: string;
      required: boolean;
    }>;
  };

  // Interactive elements
  interactiveElements?: Array<{
    type: 'tooltip' | 'highlight' | 'popup' | 'guide';
    trigger: string;
    content: string;
    position?: string;
  }>;

  // Assessment criteria
  assessmentCriteria?: Array<{
    criterion: string;
    weight: number;
    description: string;
  }>;
}

// Progress request body
export interface UpdateProgressRequestBody {
  timeSpent?: number;
  completionPercentage?: number;
  lastPosition?: number;
  status?: string;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// JWT Payload interface
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Email template data
export interface EmailTemplateData {
  firstName: string;
  verificationUrl?: string;
  resetUrl?: string;
  loginUrl?: string;
}

// Database connection options
export interface DatabaseConfig {
  uri: string;
  options?: {
    useNewUrlParser?: boolean;
    useUnifiedTopology?: boolean;
  };
}

// Quiz interfaces
export interface IQuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'MATCHING' | 'ORDERING' | 'SHORT_ANSWER' | 'ESSAY';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;

  // Additional fields for new question types
  maxLength?: number;
  minLength?: number;
  keywords?: string[];
  rubric?: {
    criteria: string;
    points: number;
    description: string;
  }[];
  caseSensitive?: boolean;
  allowPartialCredit?: boolean;
}

export interface IQuiz extends Document {
  _id: string;
  title: string;
  description?: string;
  lesson: string;
  course: string;
  questions: IQuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  showCorrectAnswers: boolean;
  showScoreImmediately: boolean;
  isRequired: boolean;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizAttempt extends Document {
  _id: string;
  user: string;
  quiz: string;
  course: string;
  lesson: string;
  answers: Array<{
    questionId: string;
    userAnswer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
    timeSpent?: number;
  }>;
  score: number;
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  timeSpent: number;
  startedAt: Date;
  completedAt?: Date;
  attemptNumber: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAchievement extends Document {
  _id: string;
  user: string;
  badgeType: string;
  title: string;
  description: string;
  iconUrl?: string;
  course?: string;
  quiz?: string;
  earnedAt: Date;
  metadata?: {
    score?: number;
    timeSpent?: number;
    courseTitle?: string;
    quizTitle?: string;
    additionalInfo?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ICertificate extends Document {
  _id: string;
  user: string;
  course: string;
  verificationCode: string;
  issuedAt: Date;
  completionDate: Date;
  finalScore?: number;
  timeSpent: number;
  instructorName: string;
  courseName: string;
  courseLevel: string;
  certificateUrl?: string;
  isValid: boolean;
  revokedAt?: Date;
  revokedReason?: string;
  metadata: {
    totalLessons: number;
    completedLessons: number;
    totalQuizzes: number;
    passedQuizzes: number;
    averageQuizScore?: number;
    achievements: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Server configuration
export interface ServerConfig {
  port: number;
  nodeEnv: string;
  frontendUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  mongodbUri: string;
  smtpConfig: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    fromEmail: string;
    fromName: string;
  };
  rateLimitConfig: {
    windowMs: number;
    maxRequests: number;
  };
}

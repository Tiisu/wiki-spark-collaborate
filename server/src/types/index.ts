import { Request } from 'express';
import { IUser } from '../models/index.js';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User types
export interface CreateUserData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  country?: string;
  timezone?: string;
  preferredLanguage?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  preferredLanguage?: string;
  avatar?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Course types
export interface CreateCourseData {
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  tags: string[];
  thumbnail?: string;
  price?: number;
  duration?: number;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category?: string;
  tags?: string[];
  thumbnail?: string;
  price?: number;
  duration?: number;
  isPublished?: boolean;
}

// Module types
export interface CreateModuleData {
  title: string;
  description?: string;
  order: number;
}

export interface UpdateModuleData {
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
}

// Lesson types
export interface CreateLessonData {
  title: string;
  content: string;
  type: 'TEXT' | 'VIDEO' | 'INTERACTIVE' | 'QUIZ' | 'ASSIGNMENT';
  videoUrl?: string;
  duration?: number;
  order: number;
}

export interface UpdateLessonData {
  title?: string;
  content?: string;
  type?: 'TEXT' | 'VIDEO' | 'INTERACTIVE' | 'QUIZ' | 'ASSIGNMENT';
  videoUrl?: string;
  duration?: number;
  order?: number;
  isPublished?: boolean;
}

// Quiz types
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

export interface CreateQuizData {
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore?: number;
  timeLimit?: number;
}

export interface QuizAttemptData {
  answers: Record<string, string | string[]>;
  timeSpent: number;
}

// Forum types
export interface CreateForumPostData {
  title: string;
  content: string;
  categoryId: string;
}

export interface CreateForumCommentData {
  content: string;
}

// Mentorship types
export interface CreateMentorshipData {
  mentorId: string;
  message?: string;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  category?: string;
  level?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Analytics types
export interface UserAnalytics {
  totalCourses: number;
  completedCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalTimeSpent: number;
  achievements: number;
  certificates: number;
  forumPosts: number;
  lastActivity: Date;
}

export interface CourseAnalytics {
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  averageRating: number;
  totalReviews: number;
  averageTimeToComplete: number;
}

// File upload types
export interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

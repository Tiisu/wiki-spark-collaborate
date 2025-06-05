import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { AppError } from './errorHandler.js';

/**
 * Middleware to validate request data using Zod schemas
 */
export const validate = (schema: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate request params
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      // Validate request query
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Common validation schemas
export const schemas = {
  // User schemas
  register: z.object({
    email: z.string().email('Invalid email format'),
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be less than 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    country: z.string().optional(),
    timezone: z.string().optional(),
    preferredLanguage: z.string().optional(),
  }),

  login: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),

  updateProfile: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    bio: z.string().max(500).optional(),
    country: z.string().optional(),
    timezone: z.string().optional(),
    preferredLanguage: z.string().optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),

  forgotPassword: z.object({
    email: z.string().email('Invalid email format'),
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  // Course schemas
  createCourse: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().min(1, 'Description is required'),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    category: z.string().min(1, 'Category is required'),
    tags: z.array(z.string()).default([]),
    price: z.number().min(0).optional(),
    duration: z.number().min(1).optional(),
  }),

  updateCourse: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    category: z.string().min(1).optional(),
    tags: z.array(z.string()).optional(),
    price: z.number().min(0).optional(),
    duration: z.number().min(1).optional(),
    isPublished: z.boolean().optional(),
  }),

  // Module schemas
  createModule: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().optional(),
    order: z.number().min(1, 'Order must be at least 1'),
  }),

  updateModule: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    order: z.number().min(1).optional(),
    isPublished: z.boolean().optional(),
  }),

  // Lesson schemas
  createLesson: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().min(1, 'Content is required'),
    type: z.enum(['TEXT', 'VIDEO', 'INTERACTIVE', 'QUIZ', 'ASSIGNMENT']),
    videoUrl: z.string().url().optional(),
    duration: z.number().min(1).optional(),
    order: z.number().min(1, 'Order must be at least 1'),
  }),

  updateLesson: z.object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).optional(),
    type: z.enum(['TEXT', 'VIDEO', 'INTERACTIVE', 'QUIZ', 'ASSIGNMENT']).optional(),
    videoUrl: z.string().url().optional(),
    duration: z.number().min(1).optional(),
    order: z.number().min(1).optional(),
    isPublished: z.boolean().optional(),
  }),

  // Quiz schemas
  createQuiz: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().optional(),
    questions: z.array(z.object({
      id: z.string(),
      question: z.string().min(1, 'Question is required'),
      type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
      options: z.array(z.string()).optional(),
      correctAnswer: z.union([z.string(), z.array(z.string())]),
      explanation: z.string().optional(),
      points: z.number().min(1, 'Points must be at least 1'),
    })).min(1, 'At least one question is required'),
    passingScore: z.number().min(0).max(100).optional(),
    timeLimit: z.number().min(1).optional(),
  }),

  // Forum schemas
  createForumPost: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    content: z.string().min(1, 'Content is required'),
    categoryId: z.string().min(1, 'Category is required'),
  }),

  createForumComment: z.object({
    content: z.string().min(1, 'Content is required'),
  }),

  // Common parameter schemas
  idParam: z.object({
    id: z.string().min(1, 'ID is required'),
  }),

  // Query schemas
  paginationQuery: z.object({
    page: z.string().transform(val => parseInt(val) || 1).optional(),
    limit: z.string().transform(val => Math.min(parseInt(val) || 10, 100)).optional(),
  }),

  searchQuery: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
    tags: z.string().transform(val => val ? val.split(',') : []).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

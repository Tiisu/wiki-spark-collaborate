import { Request, Response } from 'express';
import quizService from '../services/quizService';
import quizAnalyticsService from '../services/quizAnalyticsService';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import logger from '../utils/logger';

// Create new quiz (instructors only)
export const createQuiz = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const quizData = req.body;
  const quiz = await quizService.createQuiz(req.user._id, quizData);

  res.status(201).json({
    success: true,
    message: 'Quiz created successfully',
    data: { quiz }
  });
});

// Get quiz by ID
export const getQuizById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { includeAnswers, randomize } = req.query;

  // Only instructors and admins can see answers
  const canSeeAnswers = req.user &&
    ['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role);

  const showAnswers = includeAnswers === 'true' && canSeeAnswers;
  const useRandomization = randomize === 'true' && req.user;

  let quiz;
  if (useRandomization && req.user) {
    quiz = await quizService.getRandomizedQuiz(id, req.user._id, showAnswers);
  } else {
    quiz = await quizService.getQuizById(id, showAnswers);
  }

  if (!quiz) {
    throw new AppError('Quiz not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Quiz retrieved successfully',
    data: { quiz }
  });
});

// Get quizzes for a lesson
export const getQuizzesByLesson = catchAsync(async (req: Request, res: Response) => {
  const { lessonId } = req.params;
  const quizzes = await quizService.getQuizzesByLesson(lessonId);

  res.status(200).json({
    success: true,
    message: 'Quizzes retrieved successfully',
    data: { quizzes }
  });
});

// Submit quiz attempt
export const submitQuiz = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const submissionData = req.body;

  const quizAttempt = await quizService.submitQuiz(req.user._id, id, submissionData);

  res.status(201).json({
    success: true,
    message: 'Quiz submitted successfully',
    data: { quizAttempt }
  });
});

// Get user's quiz attempts
export const getUserQuizAttempts = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { quizId } = req.query;
  const attempts = await quizService.getUserQuizAttempts(
    req.user._id, 
    quizId as string
  );

  res.status(200).json({
    success: true,
    message: 'Quiz attempts retrieved successfully',
    data: { attempts }
  });
});

// Update quiz (instructors only)
export const updateQuiz = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const updateData = req.body;

  const quiz = await quizService.updateQuiz(id, req.user._id, updateData);

  if (!quiz) {
    throw new AppError('Quiz not found or you are not authorized to update it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Quiz updated successfully',
    data: { quiz }
  });
});

// Delete quiz (instructors only)
export const deleteQuiz = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const deleted = await quizService.deleteQuiz(id, req.user._id);

  if (!deleted) {
    throw new AppError('Quiz not found or you are not authorized to delete it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Quiz deleted successfully'
  });
});

// Get quiz statistics (instructors and admins)
export const getQuizStats = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const { startDate, endDate } = req.query;

  // Parse date range if provided
  let dateRange;
  if (startDate && endDate) {
    dateRange = {
      start: new Date(startDate as string),
      end: new Date(endDate as string)
    };
  }

  const analytics = await quizAnalyticsService.getQuizAnalytics(id, dateRange);

  res.status(200).json({
    success: true,
    message: 'Quiz statistics retrieved successfully',
    data: analytics
  });
});

// Get student progress analytics
export const getStudentProgress = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const { studentId } = req.query;

  const progress = await quizAnalyticsService.getStudentProgress(id, studentId as string);

  res.status(200).json({
    success: true,
    message: 'Student progress retrieved successfully',
    data: { progress }
  });
});

// Start quiz attempt (for timed quizzes)
export const startQuizAttempt = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;

  try {
    const attemptData = await quizService.startQuizAttempt(req.user._id, id);

    res.status(200).json({
      success: true,
      message: 'Quiz attempt started successfully',
      data: attemptData
    });
  } catch (error: any) {
    throw new AppError(error.message, 400);
  }
});

// Validate quiz attempt
export const validateQuizAttempt = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id, attemptId } = req.params;

  const validation = await quizService.validateQuizAttempt(req.user._id, id, attemptId);

  res.status(200).json({
    success: true,
    message: 'Quiz attempt validation completed',
    data: validation
  });
});



// Get quiz attempt details
export const getQuizAttempt = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { attemptId } = req.params;

  // This would get a specific quiz attempt by ID
  // For now, return a placeholder
  res.status(200).json({
    success: true,
    message: 'Quiz attempt retrieved successfully',
    data: {
      attemptId,
      message: 'Quiz attempt details feature coming soon'
    }
  });
});

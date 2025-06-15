import { Request, Response } from 'express';
import quizService from '../services/quizService';
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
  const { includeAnswers } = req.query;
  
  // Only instructors and admins can see answers
  const canSeeAnswers = req.user && 
    ['INSTRUCTOR', 'MENTOR', 'ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
  
  const showAnswers = includeAnswers === 'true' && canSeeAnswers;
  
  const quiz = await quizService.getQuizById(id, showAnswers);

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

  // This would be implemented to get quiz performance statistics
  // For now, return a placeholder response
  res.status(200).json({
    success: true,
    message: 'Quiz statistics retrieved successfully',
    data: {
      quizId: id,
      totalAttempts: 0,
      averageScore: 0,
      passRate: 0,
      message: 'Quiz statistics feature coming soon'
    }
  });
});

// Start quiz attempt (for timed quizzes)
export const startQuizAttempt = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;

  // Get quiz to check if it exists and get time limit
  const quiz = await quizService.getQuizById(id, false);
  if (!quiz) {
    throw new AppError('Quiz not found', 404);
  }

  // Check if user has exceeded max attempts
  const userAttempts = await quizService.getUserQuizAttempts(req.user._id, id);
  
  if (quiz.maxAttempts && userAttempts.length >= quiz.maxAttempts) {
    throw new AppError('Maximum attempts exceeded', 400);
  }

  res.status(200).json({
    success: true,
    message: 'Quiz attempt started',
    data: {
      quiz: {
        id: quiz._id,
        title: quiz.title,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions.map(q => ({
          id: q.id,
          type: q.type,
          question: q.question,
          options: q.options,
          points: q.points,
          order: q.order
        }))
      },
      startTime: new Date(),
      attemptNumber: userAttempts.length + 1
    }
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

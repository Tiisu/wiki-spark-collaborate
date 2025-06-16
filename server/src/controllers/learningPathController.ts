import { Response } from 'express';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import learningPathService from '../services/learningPathService';
import { DifficultyLevel, StepType } from '../models/LearningPath';

// Get all learning paths with user progress
export const getLearningPaths = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { category, search, difficulty } = req.query;

  let paths;

  if (search) {
    paths = await learningPathService.searchPaths(search as string);
  } else if (category) {
    paths = await learningPathService.getPathsByCategory(category as string);
  } else {
    paths = await learningPathService.getPathsWithProgress(req.user._id);
  }

  // Filter by difficulty if specified
  if (difficulty && Object.values(DifficultyLevel).includes(difficulty as DifficultyLevel)) {
    paths = paths.filter(path => path.difficulty === difficulty);
  }

  res.status(200).json({
    success: true,
    message: 'Learning paths retrieved successfully',
    data: { paths }
  });
});

// Get learning path by ID
export const getLearningPathById = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const path = await learningPathService.getPathById(id);

  if (!path) {
    throw new AppError('Learning path not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Learning path retrieved successfully',
    data: { path }
  });
});

// Create new learning path (instructors/admins only)
export const createLearningPath = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const {
    title,
    description,
    category,
    estimatedHours,
    difficulty,
    steps,
    tags,
    prerequisites,
    learningObjectives,
    skillsAcquired,
    targetAudience
  } = req.body;

  // Validate required fields
  if (!title || !description || !category || !estimatedHours || !difficulty || !steps) {
    throw new AppError('Title, description, category, estimated hours, difficulty, and steps are required', 400);
  }

  // Validate difficulty
  if (!Object.values(DifficultyLevel).includes(difficulty)) {
    throw new AppError('Invalid difficulty level', 400);
  }

  // Validate steps
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new AppError('At least one step is required', 400);
  }

  // Validate each step
  for (const step of steps) {
    if (!step.title || !step.description || !step.type || !step.estimatedHours || !step.difficulty || !step.skills) {
      throw new AppError('Each step must have title, description, type, estimated hours, difficulty, and skills', 400);
    }

    if (!Object.values(StepType).includes(step.type)) {
      throw new AppError('Invalid step type', 400);
    }

    if (!Object.values(DifficultyLevel).includes(step.difficulty)) {
      throw new AppError('Invalid step difficulty level', 400);
    }
  }

  const path = await learningPathService.createPath(req.user._id, {
    title,
    description,
    category,
    estimatedHours: Number(estimatedHours),
    difficulty,
    steps,
    tags,
    prerequisites,
    learningObjectives,
    skillsAcquired,
    targetAudience
  });

  res.status(201).json({
    success: true,
    message: 'Learning path created successfully',
    data: { path }
  });
});

// Update learning path (instructors/admins only)
export const updateLearningPath = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const updateData = req.body;

  // Validate difficulty if provided
  if (updateData.difficulty && !Object.values(DifficultyLevel).includes(updateData.difficulty)) {
    throw new AppError('Invalid difficulty level', 400);
  }

  // Validate steps if provided
  if (updateData.steps) {
    if (!Array.isArray(updateData.steps) || updateData.steps.length === 0) {
      throw new AppError('At least one step is required', 400);
    }

    for (const step of updateData.steps) {
      if (step.type && !Object.values(StepType).includes(step.type)) {
        throw new AppError('Invalid step type', 400);
      }
      if (step.difficulty && !Object.values(DifficultyLevel).includes(step.difficulty)) {
        throw new AppError('Invalid step difficulty level', 400);
      }
    }
  }

  const path = await learningPathService.updatePath(id, req.user._id, updateData);

  if (!path) {
    throw new AppError('Learning path not found or you do not have permission to update it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Learning path updated successfully',
    data: { path }
  });
});

// Delete learning path (instructors/admins only)
export const deleteLearningPath = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const deleted = await learningPathService.deletePath(id, req.user._id);

  if (!deleted) {
    throw new AppError('Learning path not found or you do not have permission to delete it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Learning path deleted successfully'
  });
});

// Start learning path
export const startLearningPath = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;

  // Check if learning path exists
  const path = await learningPathService.getPathById(id);
  if (!path) {
    throw new AppError('Learning path not found', 404);
  }

  const progress = await learningPathService.startPath(req.user._id, id);

  res.status(200).json({
    success: true,
    message: 'Learning path started successfully',
    data: { progress }
  });
});

// Complete learning path step
export const completeStep = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id, stepId } = req.params;

  // Check if learning path exists
  const path = await learningPathService.getPathById(id);
  if (!path) {
    throw new AppError('Learning path not found', 404);
  }

  // Check if step exists in the path
  const step = path.steps.find(s => s.id === stepId);
  if (!step) {
    throw new AppError('Step not found in this learning path', 404);
  }

  const result = await learningPathService.completeStep(req.user._id, id, stepId);

  res.status(200).json({
    success: true,
    message: 'Step completed successfully',
    data: { result }
  });
});

// Get user progress for a specific learning path
export const getUserPathProgress = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;

  // Check if learning path exists
  const path = await learningPathService.getPathById(id);
  if (!path) {
    throw new AppError('Learning path not found', 404);
  }

  const progress = await learningPathService.getUserPathProgress(req.user._id, id);

  res.status(200).json({
    success: true,
    message: 'User progress retrieved successfully',
    data: { progress }
  });
});

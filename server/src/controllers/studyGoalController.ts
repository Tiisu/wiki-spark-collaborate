import { Response } from 'express';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import studyGoalService from '../services/studyGoalService';
import { GoalUnit, GoalStatus } from '../models/StudyGoal';

// Get user's study goals
export const getUserGoals = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const goals = await studyGoalService.getUserGoals(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Study goals retrieved successfully',
    data: { goals }
  });
});

// Get goal by ID
export const getGoalById = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const goal = await studyGoalService.getGoalById(id, req.user._id);

  if (!goal) {
    throw new AppError('Study goal not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Study goal retrieved successfully',
    data: { goal }
  });
});

// Create new study goal
export const createGoal = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { title, description, target, unit, deadline } = req.body;

  // Validate required fields
  if (!title || !target || !unit || !deadline) {
    throw new AppError('Title, target, unit, and deadline are required', 400);
  }

  // Validate unit
  if (!Object.values(GoalUnit).includes(unit)) {
    throw new AppError('Invalid goal unit', 400);
  }

  // Validate deadline is in the future
  const deadlineDate = new Date(deadline);
  if (deadlineDate <= new Date()) {
    throw new AppError('Deadline must be in the future', 400);
  }

  // Validate target is positive
  if (target <= 0) {
    throw new AppError('Target must be a positive number', 400);
  }

  const goal = await studyGoalService.createGoal(req.user._id, {
    title,
    description,
    target: Number(target),
    unit,
    deadline
  });

  res.status(201).json({
    success: true,
    message: 'Study goal created successfully',
    data: { goal }
  });
});

// Update study goal
export const updateGoal = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const { title, description, target, deadline, status } = req.body;

  // Validate status if provided
  if (status && !Object.values(GoalStatus).includes(status)) {
    throw new AppError('Invalid goal status', 400);
  }

  // Validate deadline if provided
  if (deadline) {
    const deadlineDate = new Date(deadline);
    if (deadlineDate <= new Date()) {
      throw new AppError('Deadline must be in the future', 400);
    }
  }

  // Validate target if provided
  if (target !== undefined && target <= 0) {
    throw new AppError('Target must be a positive number', 400);
  }

  const goal = await studyGoalService.updateGoal(id, req.user._id, {
    title,
    description,
    target: target ? Number(target) : undefined,
    deadline,
    status
  });

  if (!goal) {
    throw new AppError('Study goal not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Study goal updated successfully',
    data: { goal }
  });
});

// Delete study goal
export const deleteGoal = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const deleted = await studyGoalService.deleteGoal(id, req.user._id);

  if (!deleted) {
    throw new AppError('Study goal not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Study goal deleted successfully'
  });
});

// Update goal progress (internal endpoint)
export const updateGoalProgress = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { unit, increment = 1 } = req.body;

  // Validate unit
  if (!Object.values(GoalUnit).includes(unit)) {
    throw new AppError('Invalid goal unit', 400);
  }

  await studyGoalService.updateGoalProgress(req.user._id, unit, Number(increment));

  res.status(200).json({
    success: true,
    message: 'Goal progress updated successfully'
  });
});

// Get goal statistics
export const getGoalStats = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const stats = await studyGoalService.getGoalStats(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Goal statistics retrieved successfully',
    data: { stats }
  });
});

// Update expired goals (admin/system endpoint)
export const updateExpiredGoals = catchAsync(async (req: AuthRequest, res: Response) => {
  await studyGoalService.updateExpiredGoals();

  res.status(200).json({
    success: true,
    message: 'Expired goals updated successfully'
  });
});

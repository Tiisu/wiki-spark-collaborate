import { Response } from 'express';
import { AuthRequest } from '../types';
import { moduleService } from '../services/moduleService';
import { catchAsync, AppError } from '../middleware/errorHandler';

// Get modules for a course
export const getModules = catchAsync(async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  
  const modules = await moduleService.getModulesByCourse(courseId);

  res.status(200).json({
    success: true,
    message: 'Modules retrieved successfully',
    data: { modules }
  });
});

// Get module by ID
export const getModuleById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { moduleId } = req.params;
  
  const module = await moduleService.getModuleById(moduleId);
  
  if (!module) {
    throw new AppError('Module not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Module retrieved successfully',
    data: { module }
  });
});

// Create new module
export const createModule = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId } = req.params;
  const moduleData = req.body;

  const module = await moduleService.createModule(courseId, req.user._id, moduleData);

  res.status(201).json({
    success: true,
    message: 'Module created successfully',
    data: { module }
  });
});

// Update module
export const updateModule = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId, moduleId } = req.params;
  const updateData = req.body;

  const module = await moduleService.updateModule(moduleId, courseId, req.user._id, updateData);

  if (!module) {
    throw new AppError('Module not found or you are not authorized to update it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Module updated successfully',
    data: { module }
  });
});

// Delete module
export const deleteModule = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId, moduleId } = req.params;

  const deleted = await moduleService.deleteModule(moduleId, courseId, req.user._id);

  if (!deleted) {
    throw new AppError('Module not found or you are not authorized to delete it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Module deleted successfully'
  });
});

// Toggle module publish status
export const togglePublish = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId, moduleId } = req.params;

  const module = await moduleService.togglePublish(moduleId, courseId, req.user._id);

  if (!module) {
    throw new AppError('Module not found or you are not authorized to modify it', 404);
  }

  res.status(200).json({
    success: true,
    message: `Module ${module.isPublished ? 'published' : 'unpublished'} successfully`,
    data: { module }
  });
});

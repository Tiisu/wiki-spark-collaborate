import { Response } from 'express';
import courseTemplateService from '../services/courseTemplateService';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

// Get all templates
export const getTemplates = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  const {
    page = 1,
    limit = 12,
    category,
    level,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const result = await courseTemplateService.getTemplates(userId, {
    page: Number(page),
    limit: Number(limit),
    category: category as string,
    level: level as any,
    search: search as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc'
  });

  res.status(200).json({
    success: true,
    message: 'Templates retrieved successfully',
    data: {
      templates: result.templates,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
        total: result.total,
        limit: Number(limit)
      }
    }
  });
});

// Get template by ID
export const getTemplateById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user?._id;

  const template = await courseTemplateService.getTemplateById(id, userId);

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Template retrieved successfully',
    data: { template }
  });
});

// Create new template (instructors only)
export const createTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const templateData = req.body;
  const template = await courseTemplateService.createTemplate(req.user._id, templateData);

  res.status(201).json({
    success: true,
    message: 'Template created successfully',
    data: { template }
  });
});

// Create course from template
export const createCourseFromTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const courseData = req.body;
  const course = await courseTemplateService.createCourseFromTemplate(req.user._id, courseData);

  res.status(201).json({
    success: true,
    message: 'Course created from template successfully',
    data: { course }
  });
});

// Save course as template
export const saveAsTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId } = req.params;
  const templateData = req.body;

  const template = await courseTemplateService.saveAsTemplate(
    req.user._id,
    courseId,
    templateData
  );

  res.status(201).json({
    success: true,
    message: 'Course saved as template successfully',
    data: { template }
  });
});

// Delete template
export const deleteTemplate = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const deleted = await courseTemplateService.deleteTemplate(id, req.user._id);

  if (!deleted) {
    throw new AppError('Template not found or you are not authorized to delete it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Template deleted successfully'
  });
});

// Get user's templates
export const getUserTemplates = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const templates = await courseTemplateService.getUserTemplates(req.user._id);

  res.status(200).json({
    success: true,
    message: 'User templates retrieved successfully',
    data: { templates }
  });
});

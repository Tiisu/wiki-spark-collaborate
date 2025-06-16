import { Response } from 'express';
import { AuthRequest } from '../types';
import { lessonService } from '../services/lessonService';
import { catchAsync, AppError } from '../middleware/errorHandler';

// Get lessons for a module
export const getLessons = catchAsync(async (req: AuthRequest, res: Response) => {
  const { moduleId } = req.params;
  
  const lessons = await lessonService.getLessonsByModule(moduleId);

  res.status(200).json({
    success: true,
    message: 'Lessons retrieved successfully',
    data: { lessons }
  });
});

// Get lesson by ID
export const getLessonById = catchAsync(async (req: AuthRequest, res: Response) => {
  const { lessonId } = req.params;
  
  const lesson = await lessonService.getLessonById(lessonId);
  
  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Lesson retrieved successfully',
    data: { lesson }
  });
});

// Create new lesson
export const createLesson = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId, moduleId } = req.params;
  const lessonData = req.body;

  const lesson = await lessonService.createLesson(courseId, moduleId, req.user._id, lessonData);

  res.status(201).json({
    success: true,
    message: 'Lesson created successfully',
    data: { lesson }
  });
});

// Update lesson
export const updateLesson = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId, moduleId, lessonId } = req.params;
  const updateData = req.body;

  const lesson = await lessonService.updateLesson(lessonId, courseId, moduleId, req.user._id, updateData);

  if (!lesson) {
    throw new AppError('Lesson not found or you are not authorized to update it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Lesson updated successfully',
    data: { lesson }
  });
});

// Delete lesson
export const deleteLesson = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId, moduleId, lessonId } = req.params;

  const deleted = await lessonService.deleteLesson(lessonId, courseId, moduleId, req.user._id);

  if (!deleted) {
    throw new AppError('Lesson not found or you are not authorized to delete it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Lesson deleted successfully'
  });
});

// Toggle lesson publish status
export const togglePublish = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId, moduleId, lessonId } = req.params;

  const lesson = await lessonService.togglePublish(lessonId, courseId, moduleId, req.user._id);

  if (!lesson) {
    throw new AppError('Lesson not found or you are not authorized to modify it', 404);
  }

  res.status(200).json({
    success: true,
    message: `Lesson ${lesson.isPublished ? 'published' : 'unpublished'} successfully`,
    data: { lesson }
  });
});

// Bulk publish lessons in a module
export const bulkPublishLessons = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { courseId, moduleId } = req.params;

  const result = await lessonService.bulkPublishLessons(courseId, moduleId, req.user._id);

  res.status(200).json({
    success: true,
    message: `${result.publishedCount} lessons published successfully`,
    data: result
  });
});

import { Request, Response } from 'express';
import courseService from '../services/courseService';
import { catchAsync, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { CourseLevel } from '../models/Course';

// Get all courses with pagination and filtering
export const getCourses = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 12,
    category,
    level,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const options = {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    category: category as string,
    level: level as CourseLevel,
    search: search as string,
    sortBy: sortBy as string,
    sortOrder: sortOrder as 'asc' | 'desc'
  };

  const result = await courseService.getCourses(options);

  res.status(200).json({
    success: true,
    message: 'Courses retrieved successfully',
    data: result
  });
});

// Get course by ID
export const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const course = await courseService.getCourseById(id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Course retrieved successfully',
    data: { course }
  });
});

// Create new course (instructors only)
export const createCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const courseData = req.body;
  const course = await courseService.createCourse(req.user._id, courseData);

  res.status(201).json({
    success: true,
    message: 'Course created successfully',
    data: { course }
  });
});

// Update course (course instructor only)
export const updateCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const updateData = req.body;

  const course = await courseService.updateCourse(id, req.user._id, updateData);

  if (!course) {
    throw new AppError('Course not found or you are not authorized to update it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Course updated successfully',
    data: { course }
  });
});

// Delete course (course instructor only)
export const deleteCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const deleted = await courseService.deleteCourse(id, req.user._id);

  if (!deleted) {
    throw new AppError('Course not found or you are not authorized to delete it', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully'
  });
});

// Get courses by instructor
export const getInstructorCourses = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const courses = await courseService.getCoursesByInstructor(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Instructor courses retrieved successfully',
    data: { courses }
  });
});

// Get instructor analytics
export const getInstructorAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const analytics = await courseService.getInstructorAnalytics(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Instructor analytics retrieved successfully',
    data: { analytics }
  });
});

// Enroll in course
export const enrollInCourse = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  const enrollment = await courseService.enrollInCourse(req.user._id, id);

  res.status(201).json({
    success: true,
    message: 'Successfully enrolled in course',
    data: { enrollment }
  });
});

// Get user enrollments
export const getUserEnrollments = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const enrollments = await courseService.getUserEnrollments(req.user._id);

  res.status(200).json({
    success: true,
    message: 'User enrollments retrieved successfully',
    data: { enrollments }
  });
});

// Get enrolled courses (courses with enrollment data)
export const getEnrolledCourses = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { page = 1, limit = 10, status, search } = req.query;

  const enrollments = await courseService.getUserEnrollments(req.user._id);

  // Filter enrollments based on query parameters
  let filteredEnrollments = enrollments;

  if (status) {
    filteredEnrollments = filteredEnrollments.filter(e => e.status === status);
  }

  if (search) {
    const searchTerm = search.toString().toLowerCase();
    filteredEnrollments = filteredEnrollments.filter(e => {
      // Check if course is populated (has title property)
      if (e.course && typeof e.course === 'object' && 'title' in e.course) {
        const course = e.course as any; // Type assertion for populated course
        return (
          (course.title && course.title.toLowerCase().includes(searchTerm)) ||
          (course.description && course.description.toLowerCase().includes(searchTerm))
        );
      }
      return false;
    });
  }

  // Pagination
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedEnrollments = filteredEnrollments.slice(startIndex, endIndex);

  const pagination = {
    currentPage: Number(page),
    totalPages: Math.ceil(filteredEnrollments.length / Number(limit)),
    totalItems: filteredEnrollments.length,
    hasNext: endIndex < filteredEnrollments.length,
    hasPrev: startIndex > 0
  };

  res.status(200).json({
    success: true,
    message: 'Enrolled courses retrieved successfully',
    data: {
      enrollments: paginatedEnrollments,
      pagination
    }
  });
});

// Update lesson progress
export const updateProgress = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { lessonId } = req.params;
  const progressData = req.body;

  const progress = await courseService.updateProgress(req.user._id, lessonId, progressData);

  res.status(200).json({
    success: true,
    message: 'Progress updated successfully',
    data: { progress }
  });
});

// Get course categories
export const getCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await courseService.getCategories();

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    data: { categories }
  });
});

// Get course with user progress (for enrolled users)
export const getCourseWithProgress = catchAsync(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError('User not found', 404);
  }

  const { id } = req.params;
  
  // Get course
  const course = await courseService.getCourseById(id);
  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Check if user is enrolled
  const enrollments = await courseService.getUserEnrollments(req.user._id);
  const enrollment = enrollments.find(e => e.course.toString() === id);

  if (!enrollment) {
    throw new AppError('You are not enrolled in this course', 403);
  }

  res.status(200).json({
    success: true,
    message: 'Course with progress retrieved successfully',
    data: { 
      course,
      enrollment
    }
  });
});

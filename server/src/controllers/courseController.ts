import { Response } from 'express';
import { Course } from '../models/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest, ApiResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

class CourseController {
  /**
   * Get all courses with pagination and filtering
   */
  async getCourses(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = 1, limit = 10, category, level, search } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};
    
    // Only show published courses for non-admin users
    if (!req.user || !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
      filter.isPublished = true;
    }

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Course.countDocuments(filter)
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Courses retrieved successfully',
      data: {
        courses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.status(200).json(response);
  }

  /**
   * Get a single course by ID
   */
  async getCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;

    const course = await Course.findById(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check if user can view unpublished course
    if (!course.isPublished && 
        (!req.user || !['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'].includes(req.user.role))) {
      throw new AppError('Course not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Course retrieved successfully',
      data: course
    };

    res.status(200).json(response);
  }

  /**
   * Create a new course
   */
  async createCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    const courseData = req.body;
    const user = req.user!;

    // Generate slug from title
    const slug = courseData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      throw new AppError('A course with this title already exists', 409);
    }

    const course = await Course.create({
      ...courseData,
      slug,
      instructorId: user.id,
      isPublished: false // Courses start as drafts
    });

    logger.info(`Course created: ${course.title} by ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Course created successfully',
      data: course
    };

    res.status(201).json(response);
  }

  /**
   * Update a course
   */
  async updateCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;
    const user = req.user!;

    const course = await Course.findById(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check permissions
    const canEdit = course.instructorId === user.id || 
                   ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    if (!canEdit) {
      throw new AppError('Access denied', 403);
    }

    // Update slug if title changed
    if (updateData.title && updateData.title !== course.title) {
      const newSlug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const existingCourse = await Course.findOne({ slug: newSlug, _id: { $ne: id } });
      if (existingCourse) {
        throw new AppError('A course with this title already exists', 409);
      }

      updateData.slug = newSlug;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    logger.info(`Course updated: ${updatedCourse!.title} by ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Course updated successfully',
      data: updatedCourse
    };

    res.status(200).json(response);
  }

  /**
   * Delete a course
   */
  async deleteCourse(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const user = req.user!;

    const course = await Course.findById(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check permissions
    const canDelete = course.instructorId === user.id || 
                     ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    if (!canDelete) {
      throw new AppError('Access denied', 403);
    }

    await Course.findByIdAndDelete(id);

    logger.info(`Course deleted: ${course.title} by ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: 'Course deleted successfully'
    };

    res.status(200).json(response);
  }

  /**
   * Publish/unpublish a course
   */
  async togglePublish(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const user = req.user!;

    const course = await Course.findById(id);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // Check permissions
    const canPublish = course.instructorId === user.id || 
                      ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    if (!canPublish) {
      throw new AppError('Access denied', 403);
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { isPublished: !course.isPublished },
      { new: true }
    );

    const action = updatedCourse!.isPublished ? 'published' : 'unpublished';
    logger.info(`Course ${action}: ${course.title} by ${user.email}`);

    const response: ApiResponse = {
      success: true,
      message: `Course ${action} successfully`,
      data: updatedCourse
    };

    res.status(200).json(response);
  }

  /**
   * Get courses for admin dashboard
   */
  async getAdminCourses(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { page = 1, limit = 10, status, instructor } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};

    if (status === 'published') {
      filter.isPublished = true;
    } else if (status === 'draft') {
      filter.isPublished = false;
    }

    if (instructor) {
      filter.instructorId = instructor;
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Course.countDocuments(filter)
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Admin courses retrieved successfully',
      data: {
        courses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.status(200).json(response);
  }
}

export const courseController = new CourseController();

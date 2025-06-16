import Lesson, { ILesson } from '../models/Lesson';
import Module from '../models/Module';
import Course from '../models/Course';
import { moduleService } from './moduleService';
import { AppError } from '../middleware/errorHandler';
import { CreateLessonRequestBody, UpdateLessonRequestBody } from '../types';
import logger from '../utils/logger';

export class LessonService {
  // Get lessons for a module
  async getLessonsByModule(moduleId: string): Promise<ILesson[]> {
    try {
      const lessons = await Lesson.find({ module: moduleId })
        .sort({ order: 1 });

      return lessons;
    } catch (error) {
      logger.error('Failed to get lessons by module:', error);
      throw error;
    }
  }

  // Get lesson by ID
  async getLessonById(lessonId: string): Promise<ILesson | null> {
    try {
      const lesson = await Lesson.findById(lessonId)
        .populate('module', 'title course');

      return lesson;
    } catch (error) {
      logger.error('Failed to get lesson by ID:', error);
      throw error;
    }
  }

  // Create new lesson
  async createLesson(
    courseId: string,
    moduleId: string,
    instructorId: string,
    lessonData: CreateLessonRequestBody
  ): Promise<ILesson> {
    try {
      // Verify course exists and user is the instructor
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });
      if (!course) {
        throw new AppError('Course not found or you are not authorized to add lessons', 404);
      }

      // Verify module exists and belongs to the course
      const module = await Module.findOne({ _id: moduleId, course: courseId });
      if (!module) {
        throw new AppError('Module not found or does not belong to this course', 404);
      }

      // Check if order already exists within the module
      const existingLesson = await Lesson.findOne({ module: moduleId, order: lessonData.order });
      if (existingLesson) {
        throw new AppError(`Lesson with order ${lessonData.order} already exists in this module`, 400);
      }

      const lesson = new Lesson({
        ...lessonData,
        module: moduleId,
        course: courseId,
        isPublished: false
      });

      await lesson.save();

      // Update module lesson count and duration
      await Promise.all([
        moduleService.updateLessonCount(moduleId),
        moduleService.updateModuleDuration(moduleId)
      ]);

      logger.info(`Lesson created: ${lesson.title} in module ${moduleId}`);
      return lesson;
    } catch (error) {
      logger.error('Failed to create lesson:', error);
      throw error;
    }
  }

  // Update lesson
  async updateLesson(
    lessonId: string,
    courseId: string,
    moduleId: string,
    instructorId: string,
    updateData: UpdateLessonRequestBody
  ): Promise<ILesson | null> {
    try {
      // Verify course exists and user is the instructor
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });
      if (!course) {
        throw new AppError('Course not found or you are not authorized to update lessons', 404);
      }

      // If updating order, check for conflicts within the module
      if (updateData.order) {
        const existingLesson = await Lesson.findOne({ 
          module: moduleId, 
          order: updateData.order,
          _id: { $ne: lessonId }
        });
        if (existingLesson) {
          throw new AppError(`Lesson with order ${updateData.order} already exists in this module`, 400);
        }
      }

      const lesson = await Lesson.findOneAndUpdate(
        { _id: lessonId, module: moduleId, course: courseId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!lesson) {
        return null;
      }

      // Update module duration if lesson duration changed
      if (updateData.duration !== undefined) {
        await moduleService.updateModuleDuration(moduleId);
      }

      logger.info(`Lesson updated: ${lesson.title}`);
      return lesson;
    } catch (error) {
      logger.error('Failed to update lesson:', error);
      throw error;
    }
  }

  // Delete lesson
  async deleteLesson(
    lessonId: string,
    courseId: string,
    moduleId: string,
    instructorId: string
  ): Promise<boolean> {
    try {
      // Verify course exists and user is the instructor
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });
      if (!course) {
        throw new AppError('Course not found or you are not authorized to delete lessons', 404);
      }

      const lesson = await Lesson.findOneAndDelete({ 
        _id: lessonId, 
        module: moduleId, 
        course: courseId 
      });
      
      if (lesson) {
        // Update module lesson count and duration
        await Promise.all([
          moduleService.updateLessonCount(moduleId),
          moduleService.updateModuleDuration(moduleId)
        ]);

        logger.info(`Lesson deleted: ${lesson.title}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to delete lesson:', error);
      throw error;
    }
  }

  // Toggle lesson publish status
  async togglePublish(
    lessonId: string,
    courseId: string,
    moduleId: string,
    instructorId: string
  ): Promise<ILesson | null> {
    try {
      // Verify course exists and user is the instructor
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });
      if (!course) {
        throw new AppError('Course not found or you are not authorized to modify lessons', 404);
      }

      const lesson = await Lesson.findOne({
        _id: lessonId,
        module: moduleId,
        course: courseId
      });

      if (!lesson) {
        return null;
      }

      // Toggle the publish status
      const newPublishStatus = !lesson.isPublished;

      const updatedLesson = await Lesson.findByIdAndUpdate(
        lessonId,
        { $set: { isPublished: newPublishStatus } },
        { new: true, runValidators: true }
      );

      logger.info(`Lesson ${lessonId} ${newPublishStatus ? 'published' : 'unpublished'}`);
      return updatedLesson;
    } catch (error) {
      logger.error('Failed to toggle lesson publish status:', error);
      throw error;
    }
  }

  // Bulk publish lessons in a module
  async bulkPublishLessons(
    courseId: string,
    moduleId: string,
    instructorId: string
  ): Promise<{ publishedCount: number; totalLessons: number }> {
    try {
      // Verify course exists and user is the instructor
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });
      if (!course) {
        throw new AppError('Course not found or you are not authorized to modify lessons', 404);
      }

      // Verify module exists and belongs to the course
      const module = await Module.findOne({ _id: moduleId, course: courseId });
      if (!module) {
        throw new AppError('Module not found or does not belong to this course', 404);
      }

      // Get all unpublished lessons in the module
      const unpublishedLessons = await Lesson.find({
        module: moduleId,
        course: courseId,
        isPublished: false
      });

      // Publish all unpublished lessons
      const result = await Lesson.updateMany(
        {
          module: moduleId,
          course: courseId,
          isPublished: false
        },
        { $set: { isPublished: true } }
      );

      const totalLessons = await Lesson.countDocuments({ module: moduleId, course: courseId });

      logger.info(`Bulk published ${result.modifiedCount} lessons in module ${moduleId}`);

      return {
        publishedCount: result.modifiedCount,
        totalLessons
      };
    } catch (error) {
      logger.error('Failed to bulk publish lessons:', error);
      throw error;
    }
  }
}

export const lessonService = new LessonService();

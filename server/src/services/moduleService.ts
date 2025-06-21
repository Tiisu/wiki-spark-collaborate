import Module, { IModule } from '../models/Module';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import { AppError } from '../middleware/errorHandler';
import { CreateModuleRequestBody, UpdateModuleRequestBody } from '../types';
import logger from '../utils/logger';

export class ModuleService {
  // Update course lesson count (utility function to avoid circular dependency)
  private async updateCourseLessonCount(courseId: string): Promise<void> {
    try {
      const totalLessons = await Lesson.countDocuments({ course: courseId });
      const totalModules = await Module.countDocuments({ course: courseId });

      await Course.findByIdAndUpdate(courseId, {
        totalLessons,
        totalModules
      });

      logger.info(`Course ${courseId} lesson count updated: ${totalLessons} lessons, ${totalModules} modules`);
    } catch (error) {
      logger.error('Failed to update course lesson count:', error);
      throw error;
    }
  }

  // Get modules for a course
  async getModulesByCourse(courseId: string): Promise<IModule[]> {
    try {
      const modules = await Module.find({ course: courseId })
        .sort({ order: 1 });

      return modules;
    } catch (error) {
      logger.error('Failed to get modules by course:', error);
      throw error;
    }
  }

  // Get module by ID with lessons
  async getModuleById(moduleId: string): Promise<IModule | null> {
    try {
      const module = await Module.findById(moduleId)
        .populate('course', 'title instructor');

      if (!module) {
        return null;
      }

      // Get lessons for this module
      const lessons = await Lesson.find({ module: moduleId })
        .sort({ order: 1 });

      return { ...module.toJSON(), lessons: lessons.map(l => l.toJSON()) } as IModule;
    } catch (error) {
      logger.error('Failed to get module by ID:', error);
      throw error;
    }
  }

  // Create new module
  async createModule(
    courseId: string, 
    instructorId: string, 
    moduleData: CreateModuleRequestBody
  ): Promise<IModule> {
    try {
      // Verify course exists and user is the instructor
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });
      if (!course) {
        throw new AppError('Course not found or you are not authorized to add modules', 404);
      }

      // Check if order already exists
      const existingModule = await Module.findOne({ course: courseId, order: moduleData.order });
      if (existingModule) {
        throw new AppError(`Module with order ${moduleData.order} already exists`, 400);
      }

      const module = new Module({
        ...moduleData,
        course: courseId,
        isPublished: false
      });

      await module.save();

      // Update course module count
      await this.updateCourseLessonCount(courseId);

      logger.info(`Module created: ${module.title} for course ${courseId}`);
      return module;
    } catch (error) {
      logger.error('Failed to create module:', error);
      throw error;
    }
  }

  // Update module
  async updateModule(
    moduleId: string,
    courseId: string,
    instructorId: string,
    updateData: UpdateModuleRequestBody
  ): Promise<IModule | null> {
    try {
      // Verify course exists and user is the instructor
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });
      if (!course) {
        throw new AppError('Course not found or you are not authorized to update modules', 404);
      }

      // If updating order, check for conflicts
      if (updateData.order) {
        const existingModule = await Module.findOne({ 
          course: courseId, 
          order: updateData.order,
          _id: { $ne: moduleId }
        });
        if (existingModule) {
          throw new AppError(`Module with order ${updateData.order} already exists`, 400);
        }
      }

      const module = await Module.findOneAndUpdate(
        { _id: moduleId, course: courseId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!module) {
        return null;
      }

      logger.info(`Module updated: ${module.title}`);
      return module;
    } catch (error) {
      logger.error('Failed to update module:', error);
      throw error;
    }
  }

  // Delete module
  async deleteModule(moduleId: string, courseId: string, instructorId: string): Promise<boolean> {
    try {
      // Verify course exists and user is the instructor
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });
      if (!course) {
        throw new AppError('Course not found or you are not authorized to delete modules', 404);
      }

      const module = await Module.findOneAndDelete({ _id: moduleId, course: courseId });
      
      if (module) {
        // Also delete all lessons in this module
        await Lesson.deleteMany({ module: moduleId });

        // Update course lesson and module count
        await this.updateCourseLessonCount(courseId);

        logger.info(`Module deleted: ${module.title} and all its lessons`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to delete module:', error);
      throw error;
    }
  }

  // Toggle module publish status
  async togglePublish(moduleId: string, courseId: string, instructorId: string): Promise<IModule | null> {
    try {
      // Verify course exists and user is the instructor
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });
      if (!course) {
        throw new AppError('Course not found or you are not authorized to modify modules', 404);
      }

      const module = await Module.findOne({ _id: moduleId, course: courseId });
      if (!module) {
        return null;
      }

      // Toggle the publish status
      const newPublishStatus = !module.isPublished;

      const updatedModule = await Module.findByIdAndUpdate(
        moduleId,
        { $set: { isPublished: newPublishStatus } },
        { new: true, runValidators: true }
      );

      logger.info(`Module ${moduleId} ${newPublishStatus ? 'published' : 'unpublished'}`);
      return updatedModule;
    } catch (error) {
      logger.error('Failed to toggle module publish status:', error);
      throw error;
    }
  }

  // Update module lesson count (called when lessons are added/removed)
  async updateLessonCount(moduleId: string): Promise<void> {
    try {
      const lessonCount = await Lesson.countDocuments({ module: moduleId });
      await Module.findByIdAndUpdate(moduleId, { lessonCount });
    } catch (error) {
      logger.error('Failed to update module lesson count:', error);
      throw error;
    }
  }

  // Update module duration (called when lesson durations change)
  async updateModuleDuration(moduleId: string): Promise<void> {
    try {
      const lessons = await Lesson.find({ module: moduleId }).select('duration');
      const totalDuration = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
      await Module.findByIdAndUpdate(moduleId, { duration: totalDuration });
    } catch (error) {
      logger.error('Failed to update module duration:', error);
      throw error;
    }
  }
}

export const moduleService = new ModuleService();

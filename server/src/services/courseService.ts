import Course, { ICourse, CourseLevel, CourseStatus } from '../models/Course';
import Module, { IModule } from '../models/Module';
import Lesson, { ILesson } from '../models/Lesson';
import Enrollment, { IEnrollment, EnrollmentStatus } from '../models/Enrollment';
import Progress, { IProgress, ProgressStatus } from '../models/Progress';
import logger from '../utils/logger';
import { CreateCourseRequestBody, UpdateCourseRequestBody } from '../types';

class CourseService {
  // Get all published courses with pagination and filtering
  async getCourses(options: {
    page?: number;
    limit?: number;
    category?: string;
    level?: CourseLevel;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ courses: ICourse[]; total: number; page: number; totalPages: number }> {
    try {
      const {
        page = 1,
        limit = 12,
        category,
        level,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const skip = (page - 1) * limit;
      const query: any = { isPublished: true, status: CourseStatus.PUBLISHED };

      // Add filters
      if (category) {
        query.category = category;
      }
      if (level) {
        query.level = level;
      }
      if (search) {
        query.$text = { $search: search };
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [courses, total] = await Promise.all([
        Course.find(query)
          .populate('instructor', 'firstName lastName username')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Course.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return { courses: courses as ICourse[], total, page, totalPages };
    } catch (error) {
      logger.error('Failed to get courses:', error);
      throw error;
    }
  }

  // Get course by ID with modules and lessons
  async getCourseById(courseId: string, includeUnpublished = false): Promise<ICourse | null> {
    try {
      const query: any = { _id: courseId };
      if (!includeUnpublished) {
        query.isPublished = true;
        query.status = CourseStatus.PUBLISHED;
      }

      const course = await Course.findOne(query)
        .populate('instructor', 'firstName lastName username bio')
        .lean();

      if (!course) {
        return null;
      }

      // Get modules with lessons
      const modules = await Module.find({ 
        course: courseId,
        ...(includeUnpublished ? {} : { isPublished: true })
      })
        .sort({ order: 1 })
        .lean();

      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const lessons = await Lesson.find({ 
            module: module._id,
            ...(includeUnpublished ? {} : { isPublished: true })
          })
            .sort({ order: 1 })
            .lean();

          return { ...module, lessons };
        })
      );

      return { ...course, modules: modulesWithLessons } as ICourse;
    } catch (error) {
      logger.error('Failed to get course by ID:', error);
      throw error;
    }
  }

  // Create new course
  async createCourse(instructorId: string, courseData: CreateCourseRequestBody): Promise<ICourse> {
    try {
      const course = new Course({
        ...courseData,
        instructor: instructorId,
        status: CourseStatus.DRAFT,
        isPublished: false
      });

      await course.save();
      logger.info(`Course created: ${course.title} by instructor ${instructorId}`);
      return course;
    } catch (error) {
      logger.error('Failed to create course:', error);
      throw error;
    }
  }

  // Update course
  async updateCourse(courseId: string, instructorId: string, updateData: UpdateCourseRequestBody): Promise<ICourse | null> {
    try {
      const course = await Course.findOneAndUpdate(
        { _id: courseId, instructor: instructorId },
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (course) {
        logger.info(`Course updated: ${course.title}`);
      }

      return course;
    } catch (error) {
      logger.error('Failed to update course:', error);
      throw error;
    }
  }

  // Delete course
  async deleteCourse(courseId: string, instructorId: string): Promise<boolean> {
    try {
      const course = await Course.findOneAndDelete({ _id: courseId, instructor: instructorId });
      
      if (course) {
        // Also delete related modules, lessons, enrollments, and progress
        await Promise.all([
          Module.deleteMany({ course: courseId }),
          Lesson.deleteMany({ course: courseId }),
          Enrollment.deleteMany({ course: courseId }),
          Progress.deleteMany({ course: courseId })
        ]);

        logger.info(`Course deleted: ${course.title}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to delete course:', error);
      throw error;
    }
  }

  // Get courses by instructor
  async getCoursesByInstructor(instructorId: string): Promise<ICourse[]> {
    try {
      const courses = await Course.find({ instructor: instructorId })
        .sort({ createdAt: -1 })
        .lean();

      return courses as ICourse[];
    } catch (error) {
      logger.error('Failed to get courses by instructor:', error);
      throw error;
    }
  }

  // Enroll user in course
  async enrollInCourse(userId: string, courseId: string): Promise<IEnrollment> {
    try {
      // Check if already enrolled
      const existingEnrollment = await Enrollment.findOne({ user: userId, course: courseId });
      if (existingEnrollment) {
        throw new Error('User is already enrolled in this course');
      }

      // Check if course exists and is published
      const course = await Course.findOne({ _id: courseId, isPublished: true });
      if (!course) {
        throw new Error('Course not found or not published');
      }

      const enrollment = new Enrollment({
        user: userId,
        course: courseId,
        status: EnrollmentStatus.ACTIVE
      });

      await enrollment.save();

      // Update course enrollment count
      await Course.findByIdAndUpdate(courseId, { $inc: { enrollmentCount: 1 } });

      logger.info(`User ${userId} enrolled in course ${courseId}`);
      return enrollment;
    } catch (error) {
      logger.error('Failed to enroll in course:', error);
      throw error;
    }
  }

  // Get user enrollments
  async getUserEnrollments(userId: string): Promise<IEnrollment[]> {
    try {
      const enrollments = await Enrollment.find({ user: userId })
        .populate('course', 'title description thumbnail instructor level category rating duration')
        .sort({ enrolledAt: -1 })
        .lean();

      return enrollments as IEnrollment[];
    } catch (error) {
      logger.error('Failed to get user enrollments:', error);
      throw error;
    }
  }

  // Update lesson progress
  async updateProgress(userId: string, lessonId: string, progressData: {
    timeSpent?: number;
    completionPercentage?: number;
    lastPosition?: number;
    status?: ProgressStatus;
  }): Promise<IProgress> {
    try {
      // Get lesson to find course
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }

      // Check if user is enrolled in the course
      const enrollment = await Enrollment.findOne({ user: userId, course: lesson.course });
      if (!enrollment) {
        throw new Error('User is not enrolled in this course');
      }

      // Update or create progress
      const progress = await Progress.findOneAndUpdate(
        { user: userId, lesson: lessonId },
        {
          $set: {
            ...progressData,
            course: lesson.course,
            ...(progressData.completionPercentage === 100 && { completedAt: new Date() })
          }
        },
        { new: true, upsert: true, runValidators: true }
      );

      // Update enrollment progress
      await this.updateEnrollmentProgress(userId, lesson.course.toString());

      logger.info(`Progress updated for user ${userId} in lesson ${lessonId}`);
      return progress;
    } catch (error) {
      logger.error('Failed to update progress:', error);
      throw error;
    }
  }

  // Update overall enrollment progress
  private async updateEnrollmentProgress(userId: string, courseId: string): Promise<void> {
    try {
      // Get total lessons in course
      const totalLessons = await Lesson.countDocuments({ course: courseId, isPublished: true });
      
      // Get completed lessons
      const completedLessons = await Progress.countDocuments({
        user: userId,
        course: courseId,
        status: ProgressStatus.COMPLETED
      });

      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const status = progress === 100 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE;

      await Enrollment.findOneAndUpdate(
        { user: userId, course: courseId },
        {
          $set: {
            progress,
            status,
            ...(progress === 100 && { completedAt: new Date() })
          }
        }
      );
    } catch (error) {
      logger.error('Failed to update enrollment progress:', error);
    }
  }

  // Get course categories
  async getCategories(): Promise<string[]> {
    try {
      const categories = await Course.distinct('category', { isPublished: true });
      return categories.sort();
    } catch (error) {
      logger.error('Failed to get categories:', error);
      throw error;
    }
  }
}

export default new CourseService();

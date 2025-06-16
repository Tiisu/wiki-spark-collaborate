import Course, { ICourse, CourseLevel, CourseStatus } from '../models/Course';
import Module, { IModule } from '../models/Module';
import Lesson, { ILesson } from '../models/Lesson';
import Enrollment, { IEnrollment, EnrollmentStatus } from '../models/Enrollment';
import Progress, { IProgress, ProgressStatus } from '../models/Progress';
import achievementService from './achievementService';
import certificateService from './certificateService';
import logger from '../utils/logger';
import { CreateCourseRequestBody, UpdateCourseRequestBody } from '../types';

class CourseService {
  // Wikipedia-focused course categories
  private readonly wikipediaCategories = [
    'Wikipedia Basics',
    'Content Creation',
    'Sourcing & Citations',
    'Community & Policy',
    'Sister Projects',
    'Advanced Topics',
    'Special Skills'
  ];
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

  // Toggle course publish status
  async togglePublish(courseId: string, instructorId: string): Promise<ICourse | null> {
    try {
      const course = await Course.findOne({ _id: courseId, instructor: instructorId });

      if (!course) {
        return null;
      }

      // Toggle the publish status
      const newPublishStatus = !course.isPublished;
      const newStatus = newPublishStatus ? CourseStatus.PUBLISHED : CourseStatus.DRAFT;

      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        {
          $set: {
            isPublished: newPublishStatus,
            status: newStatus
          }
        },
        { new: true, runValidators: true }
      ).populate('instructor', 'firstName lastName username bio');

      logger.info(`Course ${courseId} ${newPublishStatus ? 'published' : 'unpublished'} by instructor ${instructorId}`);
      return updatedCourse;
    } catch (error) {
      logger.error('Failed to toggle course publish status:', error);
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
      const wasCompleted = progress === 100;

      const enrollment = await Enrollment.findOneAndUpdate(
        { user: userId, course: courseId },
        {
          $set: {
            progress,
            status,
            ...(wasCompleted && { completedAt: new Date() })
          }
        },
        { new: true }
      );

      // If course was just completed, trigger achievements and certificate generation
      if (wasCompleted && enrollment) {
        try {
          // Check and award achievements
          await achievementService.checkAndAwardAchievements(userId);

          // Check if user is eligible for certificate and generate it
          const eligibility = await certificateService.checkCertificateEligibility(userId, courseId);
          if (eligibility.eligible) {
            // Calculate total time spent on course
            const totalTimeSpent = await this.calculateCourseTimeSpent(userId, courseId);

            await certificateService.generateCertificate({
              userId,
              courseId,
              completionDate: new Date(),
              timeSpent: totalTimeSpent
            });
          }
        } catch (achievementError) {
          logger.error('Failed to process course completion rewards:', achievementError);
          // Don't throw error as the main progress update was successful
        }
      }
    } catch (error) {
      logger.error('Failed to update enrollment progress:', error);
    }
  }

  // Calculate total time spent on course
  private async calculateCourseTimeSpent(userId: string, courseId: string): Promise<number> {
    try {
      const progressRecords = await Progress.find({
        user: userId,
        course: courseId
      });

      return progressRecords.reduce((total, record) => total + (record.timeSpent || 0), 0);
    } catch (error) {
      logger.error('Failed to calculate course time spent:', error);
      return 0;
    }
  }

  // Get instructor analytics
  async getInstructorAnalytics(instructorId: string): Promise<{
    totalCourses: number;
    publishedCourses: number;
    totalStudents: number;
    averageCompletionRate: number;
    totalEnrollments: number;
    recentEnrollments: number;
  }> {
    try {
      // Get instructor's courses
      const instructorCourses = await Course.find({ instructor: instructorId });
      const courseIds = instructorCourses.map(course => course._id);

      const [
        totalCourses,
        publishedCourses,
        enrollmentStats,
        completionStats
      ] = await Promise.all([
        Course.countDocuments({ instructor: instructorId }),
        Course.countDocuments({ instructor: instructorId, isPublished: true }),
        this.getInstructorEnrollmentStats(courseIds),
        this.getInstructorCompletionStats(courseIds)
      ]);

      return {
        totalCourses,
        publishedCourses,
        totalStudents: enrollmentStats.uniqueStudents,
        averageCompletionRate: completionStats.averageCompletionRate,
        totalEnrollments: enrollmentStats.totalEnrollments,
        recentEnrollments: enrollmentStats.recentEnrollments
      };
    } catch (error) {
      logger.error('Failed to get instructor analytics:', error);
      throw error;
    }
  }

  // Get instructor enrollment statistics
  private async getInstructorEnrollmentStats(courseIds: any[]): Promise<{
    totalEnrollments: number;
    uniqueStudents: number;
    recentEnrollments: number;
  }> {
    try {
      if (courseIds.length === 0) {
        return { totalEnrollments: 0, uniqueStudents: 0, recentEnrollments: 0 };
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [enrollmentStats, recentEnrollments] = await Promise.all([
        Enrollment.aggregate([
          { $match: { course: { $in: courseIds } } },
          {
            $group: {
              _id: null,
              totalEnrollments: { $sum: 1 },
              uniqueStudents: { $addToSet: '$user' }
            }
          },
          {
            $project: {
              totalEnrollments: 1,
              uniqueStudents: { $size: '$uniqueStudents' }
            }
          }
        ]),
        Enrollment.countDocuments({
          course: { $in: courseIds },
          enrolledAt: { $gte: thirtyDaysAgo }
        })
      ]);

      const stats = enrollmentStats[0] || { totalEnrollments: 0, uniqueStudents: 0 };

      return {
        totalEnrollments: stats.totalEnrollments,
        uniqueStudents: stats.uniqueStudents,
        recentEnrollments
      };
    } catch (error) {
      logger.error('Failed to get instructor enrollment stats:', error);
      return { totalEnrollments: 0, uniqueStudents: 0, recentEnrollments: 0 };
    }
  }

  // Get instructor completion statistics
  private async getInstructorCompletionStats(courseIds: any[]): Promise<{
    averageCompletionRate: number;
  }> {
    try {
      if (courseIds.length === 0) {
        return { averageCompletionRate: 0 };
      }

      const completionStats = await Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        {
          $group: {
            _id: null,
            averageProgress: { $avg: '$progress' }
          }
        }
      ]);

      const averageCompletionRate = completionStats[0]?.averageProgress || 0;

      return { averageCompletionRate: Math.round(averageCompletionRate) };
    } catch (error) {
      logger.error('Failed to get instructor completion stats:', error);
      return { averageCompletionRate: 0 };
    }
  }

  // Get course categories
  async getCategories(): Promise<string[]> {
    try {
      // Return predefined Wikipedia-focused categories
      return this.wikipediaCategories;
    } catch (error) {
      logger.error('Failed to get categories:', error);
      throw error;
    }
  }
}

export default new CourseService();

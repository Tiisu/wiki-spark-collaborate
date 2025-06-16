import User from '../models/User';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { AppError } from '../middleware/errorHandler';

export class AdminService {
  // Get platform analytics
  async getAnalytics() {
    try {
      // Get total counts
      const [totalUsers, totalCourses, totalEnrollments] = await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Enrollment.countDocuments()
      ]);

      // Get published courses count
      const publishedCourses = await Course.countDocuments({ status: 'published' });

      // Get user growth (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const [newUsersThisMonth, newUsersLastMonth] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        User.countDocuments({ 
          createdAt: { 
            $gte: sixtyDaysAgo, 
            $lt: thirtyDaysAgo 
          } 
        })
      ]);

      const [newCoursesThisMonth, newCoursesLastMonth] = await Promise.all([
        Course.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        Course.countDocuments({ 
          createdAt: { 
            $gte: sixtyDaysAgo, 
            $lt: thirtyDaysAgo 
          } 
        })
      ]);

      // Calculate growth percentages
      const userGrowth = newUsersLastMonth > 0 
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
        : newUsersThisMonth > 0 ? 100 : 0;

      const courseGrowth = newCoursesLastMonth > 0 
        ? ((newCoursesThisMonth - newCoursesLastMonth) / newCoursesLastMonth) * 100 
        : newCoursesThisMonth > 0 ? 100 : 0;

      const publishedPercentage = totalCourses > 0 
        ? (publishedCourses / totalCourses) * 100 
        : 0;

      // Get recent activity
      const [recentUsers, recentCourses] = await Promise.all([
        User.find()
          .select('firstName lastName email createdAt')
          .sort({ createdAt: -1 })
          .limit(5),
        Course.find()
          .select('title createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
      ]);

      return {
        overview: {
          totalUsers,
          totalCourses,
          totalEnrollments,
          publishedCourses,
          userGrowth: Math.round(userGrowth * 100) / 100,
          courseGrowth: Math.round(courseGrowth * 100) / 100,
          publishedPercentage: Math.round(publishedPercentage * 100) / 100
        },
        growth: {
          newUsersThisMonth,
          newUsersLastMonth,
          newCoursesThisMonth,
          newCoursesLastMonth
        },
        recentActivity: {
          users: recentUsers,
          courses: recentCourses
        }
      };
    } catch (error) {
      throw new AppError('Failed to fetch analytics', 500);
    }
  }

  // Get all courses for admin management
  async getCourses(params: {
    page?: number;
    limit?: number;
    status?: string;
    instructor?: string;
  }) {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};
      if (params.status) {
        filter.status = params.status;
      }
      if (params.instructor) {
        filter.instructor = params.instructor;
      }

      // Get courses with instructor details
      const [courses, total] = await Promise.all([
        Course.find(filter)
          .populate('instructor', 'firstName lastName email')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Course.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        courses,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new AppError('Failed to fetch courses', 500);
    }
  }

  // Get all users for admin management
  async getUsers(params: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};
      if (params.role) {
        filter.role = params.role;
      }
      if (params.search) {
        filter.$or = [
          { firstName: { $regex: params.search, $options: 'i' } },
          { lastName: { $regex: params.search, $options: 'i' } },
          { email: { $regex: params.search, $options: 'i' } }
        ];
      }

      // Get users
      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw new AppError('Failed to fetch users', 500);
    }
  }

  // Update user role
  async updateUserRole(userId: string, newRole: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      user.role = newRole as any;
      await user.save();

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update user role', 500);
    }
  }
}

export const adminService = new AdminService();

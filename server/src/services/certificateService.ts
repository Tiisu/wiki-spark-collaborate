import Certificate, { ICertificate } from '../models/Certificate';
import Enrollment from '../models/Enrollment';
import QuizAttempt from '../models/QuizAttempt';
import Course from '../models/Course';
import User from '../models/User';
import Achievement from '../models/Achievement';
import logger from '../utils/logger';

interface CertificateData {
  userId: string;
  courseId: string;
  completionDate: Date;
  finalScore?: number;
  timeSpent: number;
}

class CertificateService {
  // Generate certificate for completed course
  async generateCertificate(data: CertificateData): Promise<ICertificate> {
    try {
      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        user: data.userId,
        course: data.courseId
      });

      if (existingCertificate) {
        throw new Error('Certificate already exists for this user and course');
      }

      // Get course and user details
      const [course, user] = await Promise.all([
        Course.findById(data.courseId).populate('instructor', 'firstName lastName'),
        User.findById(data.userId)
      ]);

      if (!course || !user) {
        throw new Error('Course or user not found');
      }

      // Get course completion statistics
      const stats = await this.getCourseCompletionStats(data.userId, data.courseId);

      // Get user achievements related to this course
      const courseAchievements = await Achievement.find({
        user: data.userId,
        course: data.courseId
      }).select('badgeType');

      const instructor = course.instructor as any;
      const instructorName = `${instructor.firstName} ${instructor.lastName}`;

      const certificate = new Certificate({
        user: data.userId,
        course: data.courseId,
        completionDate: data.completionDate,
        finalScore: data.finalScore,
        timeSpent: data.timeSpent,
        instructorName,
        courseName: course.title,
        courseLevel: course.level,
        metadata: {
          totalLessons: stats.totalLessons,
          completedLessons: stats.completedLessons,
          totalQuizzes: stats.totalQuizzes,
          passedQuizzes: stats.passedQuizzes,
          averageQuizScore: stats.averageQuizScore,
          achievements: courseAchievements.map(a => a.badgeType)
        }
      });

      await certificate.save();

      logger.info(`Certificate generated for user ${data.userId}, course ${data.courseId}`);
      return certificate;
    } catch (error) {
      logger.error('Failed to generate certificate:', error);
      throw error;
    }
  }

  // Get course completion statistics
  private async getCourseCompletionStats(userId: string, courseId: string) {
    try {
      // Get enrollment data
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId
      });

      if (!enrollment) {
        throw new Error('Enrollment not found');
      }

      // Get quiz statistics
      const quizStats = await QuizAttempt.aggregate([
        {
          $match: {
            user: userId,
            course: courseId,
            isCompleted: true
          }
        },
        {
          $group: {
            _id: '$quiz',
            bestScore: { $max: '$score' },
            passed: { $max: '$passed' }
          }
        },
        {
          $group: {
            _id: null,
            totalQuizzes: { $sum: 1 },
            passedQuizzes: { $sum: { $cond: ['$passed', 1, 0] } },
            averageScore: { $avg: '$bestScore' }
          }
        }
      ]);

      const quizData = quizStats[0] || {
        totalQuizzes: 0,
        passedQuizzes: 0,
        averageScore: 0
      };

      return {
        totalLessons: enrollment.completedLessons.length, // This would need to be calculated properly
        completedLessons: enrollment.completedLessons.length,
        totalQuizzes: quizData.totalQuizzes,
        passedQuizzes: quizData.passedQuizzes,
        averageQuizScore: Math.round(quizData.averageScore || 0)
      };
    } catch (error) {
      logger.error('Failed to get course completion stats:', error);
      throw error;
    }
  }

  // Get user certificates
  async getUserCertificates(userId: string): Promise<ICertificate[]> {
    try {
      return await Certificate.find({ 
        user: userId, 
        isValid: true 
      })
        .populate('course', 'title category level thumbnail')
        .sort({ issuedAt: -1 })
        .lean();
    } catch (error) {
      logger.error('Failed to get user certificates:', error);
      throw error;
    }
  }

  // Get certificate by verification code
  async getCertificateByVerificationCode(verificationCode: string): Promise<ICertificate | null> {
    try {
      return await Certificate.findOne({ 
        verificationCode, 
        isValid: true 
      })
        .populate('user', 'firstName lastName username')
        .populate('course', 'title category level')
        .lean();
    } catch (error) {
      logger.error('Failed to get certificate by verification code:', error);
      throw error;
    }
  }

  // Verify certificate
  async verifyCertificate(verificationCode: string): Promise<{
    isValid: boolean;
    certificate?: ICertificate;
    message: string;
  }> {
    try {
      const certificate = await this.getCertificateByVerificationCode(verificationCode);

      if (!certificate) {
        return {
          isValid: false,
          message: 'Certificate not found or invalid verification code'
        };
      }

      if (!certificate.isValid) {
        return {
          isValid: false,
          certificate,
          message: 'Certificate has been revoked'
        };
      }

      return {
        isValid: true,
        certificate,
        message: 'Certificate is valid'
      };
    } catch (error) {
      logger.error('Failed to verify certificate:', error);
      return {
        isValid: false,
        message: 'Error verifying certificate'
      };
    }
  }

  // Revoke certificate
  async revokeCertificate(certificateId: string, reason: string, revokedBy: string): Promise<ICertificate | null> {
    try {
      const certificate = await Certificate.findByIdAndUpdate(
        certificateId,
        {
          isValid: false,
          revokedAt: new Date(),
          revokedReason: reason
        },
        { new: true }
      );

      if (certificate) {
        logger.info(`Certificate revoked: ${certificateId} by ${revokedBy}, reason: ${reason}`);
      }

      return certificate;
    } catch (error) {
      logger.error('Failed to revoke certificate:', error);
      throw error;
    }
  }

  // Get certificate statistics
  async getCertificateStats(): Promise<{
    totalCertificates: number;
    validCertificates: number;
    revokedCertificates: number;
    certificatesByMonth: Array<{ month: string; count: number }>;
  }> {
    try {
      const [totalStats, monthlyStats] = await Promise.all([
        Certificate.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              valid: { $sum: { $cond: ['$isValid', 1, 0] } },
              revoked: { $sum: { $cond: ['$isValid', 0, 1] } }
            }
          }
        ]),
        Certificate.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$issuedAt' },
                month: { $month: '$issuedAt' }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { '_id.year': -1, '_id.month': -1 }
          },
          {
            $limit: 12
          }
        ])
      ]);

      const stats = totalStats[0] || { total: 0, valid: 0, revoked: 0 };
      
      const certificatesByMonth = monthlyStats.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count
      }));

      return {
        totalCertificates: stats.total,
        validCertificates: stats.valid,
        revokedCertificates: stats.revoked,
        certificatesByMonth
      };
    } catch (error) {
      logger.error('Failed to get certificate stats:', error);
      throw error;
    }
  }

  // Check if user is eligible for certificate
  async checkCertificateEligibility(userId: string, courseId: string): Promise<{
    eligible: boolean;
    reason?: string;
    requirements?: {
      courseCompleted: boolean;
      requiredQuizzesPassed: boolean;
      minimumScore?: number;
    };
  }> {
    try {
      // Check if course is completed
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId
      });

      if (!enrollment) {
        return {
          eligible: false,
          reason: 'Not enrolled in course'
        };
      }

      const courseCompleted = enrollment.progress >= 100;

      // Check required quizzes
      const requiredQuizzes = await QuizAttempt.aggregate([
        {
          $match: {
            user: userId,
            course: courseId,
            isCompleted: true
          }
        },
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quiz',
            foreignField: '_id',
            as: 'quizData'
          }
        },
        {
          $unwind: '$quizData'
        },
        {
          $match: {
            'quizData.isRequired': true
          }
        },
        {
          $group: {
            _id: '$quiz',
            passed: { $max: '$passed' }
          }
        }
      ]);

      const requiredQuizzesPassed = requiredQuizzes.every(quiz => quiz.passed);

      const requirements = {
        courseCompleted,
        requiredQuizzesPassed
      };

      const eligible = courseCompleted && requiredQuizzesPassed;

      return {
        eligible,
        reason: eligible ? undefined : 'Course requirements not met',
        requirements
      };
    } catch (error) {
      logger.error('Failed to check certificate eligibility:', error);
      throw error;
    }
  }
}

export default new CertificateService();

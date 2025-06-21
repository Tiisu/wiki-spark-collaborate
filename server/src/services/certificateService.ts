import Certificate, { ICertificate, CertificateStatus, CertificateTemplate } from '../models/Certificate';
import Enrollment from '../models/Enrollment';
import QuizAttempt from '../models/QuizAttempt';
import Course from '../models/Course';
import User from '../models/User';
import Achievement from '../models/Achievement';
import pdfCertificateService from './pdfCertificateService';
import certificateNotificationService from './certificateNotificationService';
import notificationService from './notificationService';
import logger from '../utils/logger';

interface CertificateGenerationData {
  userId: string;
  courseId: string;
  completionDate: Date;
  finalScore?: number;
  timeSpent: number;
  template?: CertificateTemplate;
}

class CertificateService {
  // Generate certificate for completed course with PDF generation
  async generateCertificate(data: CertificateGenerationData): Promise<ICertificate> {
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
      const [course, user, enrollment] = await Promise.all([
        Course.findById(data.courseId).populate('instructor', 'firstName lastName'),
        User.findById(data.userId),
        Enrollment.findOne({ user: data.userId, course: data.courseId })
      ]);

      if (!course || !user || !enrollment) {
        throw new Error('Course, user, or enrollment not found');
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
      const studentName = `${user.firstName} ${user.lastName}`;

      // Generate verification code and certificate ID
      const year = new Date().getFullYear();
      const randomCode = require('crypto').randomBytes(4).toString('hex').toUpperCase();
      const verificationCode = `WWT-${year}-${randomCode}`;
      const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
      const certificateId = `CERT-${year}-${randomNum}`;

      // Create certificate record
      const certificate = new Certificate({
        user: data.userId,
        course: data.courseId,
        verificationCode,
        certificateId,
        status: CertificateStatus.PENDING,
        template: data.template || CertificateTemplate.STANDARD,
        completionDate: data.completionDate,
        finalScore: data.finalScore,
        timeSpent: data.timeSpent,
        instructorName,
        courseName: course.title,
        courseLevel: course.level,
        courseCategory: course.category,
        studentName,
        studentEmail: user.email,
        metadata: {
          totalLessons: stats.totalLessons,
          completedLessons: stats.completedLessons,
          totalQuizzes: stats.totalQuizzes,
          passedQuizzes: stats.passedQuizzes,
          averageQuizScore: stats.averageQuizScore,
          achievements: courseAchievements.map(a => a.badgeType),
          courseDuration: course.estimatedCompletionTime || 0,
          enrollmentDate: enrollment.enrolledAt,
          completionRate: 100,
          skillsAcquired: course.skillsAcquired || [],
          wikipediaProject: course.wikipediaProject || 'GENERAL'
        },
        verification: {
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${verificationCode}`,
          verificationCount: 0
        }
      });

      await certificate.save();

      // Generate PDF certificate
      try {
        await this.generatePDFCertificate(certificate);

        // Send notification email after successful PDF generation
        try {
          await certificateNotificationService.sendCertificateIssuedEmail(certificate);
          logger.info(`Certificate notification email sent for certificate ${certificate.certificateId}`);
        } catch (emailError) {
          logger.error('Failed to send certificate notification email:', emailError);
          // Don't fail the certificate generation if email fails
        }

        // Create in-app notification
        try {
          await notificationService.createCertificateNotification(
            data.userId,
            certificate._id,
            certificate.courseName,
            certificate.verificationCode
          );
          logger.info(`In-app notification created for certificate ${certificate.certificateId}`);
        } catch (notificationError) {
          logger.error('Failed to create in-app notification:', notificationError);
          // Don't fail the certificate generation if notification fails
        }
      } catch (pdfError) {
        logger.error('Failed to generate PDF certificate:', pdfError);
        // Update certificate status to indicate PDF generation failed
        certificate.status = CertificateStatus.PENDING;
        await certificate.save();
      }

      logger.info(`Certificate generated for user ${data.userId}, course ${data.courseId}`);
      return certificate;
    } catch (error) {
      logger.error('Failed to generate certificate:', error);
      throw error;
    }
  }

  // Generate PDF certificate file
  private async generatePDFCertificate(certificate: ICertificate): Promise<void> {
    try {
      const filePath = pdfCertificateService.getCertificateFilePath(certificate.certificateId);

      const certificateData = {
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        courseLevel: certificate.courseLevel,
        courseCategory: certificate.courseCategory,
        instructorName: certificate.instructorName,
        completionDate: certificate.completionDate,
        issuedAt: certificate.issuedAt,
        verificationCode: certificate.verificationCode,
        certificateId: certificate.certificateId,
        finalScore: certificate.finalScore,
        timeSpent: certificate.timeSpent,
        verificationUrl: certificate.verification.verificationUrl,
        metadata: certificate.metadata
      };

      const options = {
        template: certificate.template,
        outputPath: filePath,
        includeQRCode: true,
        includeWatermark: false
      };

      const { fileSize } = await pdfCertificateService.generateCertificate(certificateData, options);

      // Update certificate with PDF information
      certificate.status = CertificateStatus.GENERATED;
      certificate.pdfPath = filePath;
      certificate.pdfSize = fileSize;
      certificate.certificateUrl = `/api/certificates/${certificate.certificateId}/download`;

      await certificate.save();

      logger.info(`PDF certificate generated for certificate ${certificate.certificateId}`);
    } catch (error) {
      logger.error('Failed to generate PDF certificate:', error);
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

  // Enhanced certificate eligibility checking
  async checkCertificateEligibility(userId: string, courseId: string): Promise<{
    eligible: boolean;
    reason?: string;
    requirements: {
      courseCompleted: boolean;
      requiredQuizzesPassed: boolean;
      minimumTimeSpent: boolean;
      minimumScore?: number;
      hasValidEnrollment: boolean;
      noDuplicateCertificate: boolean;
    };
    details: {
      progress: number;
      timeSpent: number;
      averageScore?: number;
      requiredQuizzes: number;
      passedQuizzes: number;
      missingRequirements: string[];
    };
  }> {
    try {
      const missingRequirements: string[] = [];

      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        user: userId,
        course: courseId,
        isValid: true
      });

      const noDuplicateCertificate = !existingCertificate;
      if (existingCertificate) {
        missingRequirements.push('Certificate already issued for this course');
      }

      // Check enrollment
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: courseId
      });

      const hasValidEnrollment = !!enrollment && enrollment.status !== 'DROPPED';
      if (!hasValidEnrollment) {
        missingRequirements.push('Valid enrollment required');
        return {
          eligible: false,
          reason: 'Not enrolled in course or enrollment is invalid',
          requirements: {
            courseCompleted: false,
            requiredQuizzesPassed: false,
            minimumTimeSpent: false,
            hasValidEnrollment: false,
            noDuplicateCertificate
          },
          details: {
            progress: 0,
            timeSpent: 0,
            requiredQuizzes: 0,
            passedQuizzes: 0,
            missingRequirements
          }
        };
      }

      // Check course completion
      const courseCompleted = enrollment.progress >= 100;
      if (!courseCompleted) {
        missingRequirements.push(`Course completion required (${enrollment.progress}% completed)`);
      }

      // Get course details for minimum requirements
      const course = await Course.findById(courseId);
      const minimumTimeRequired = course?.estimatedCompletionTime ? (course.estimatedCompletionTime * 0.5) : 0; // 50% of estimated time

      // Calculate total time spent
      const timeSpentStats = await this.calculateCourseTimeSpent(userId, courseId);
      const minimumTimeSpent = timeSpentStats >= minimumTimeRequired;
      if (!minimumTimeSpent && minimumTimeRequired > 0) {
        missingRequirements.push(`Minimum study time required: ${Math.round(minimumTimeRequired)} minutes (current: ${Math.round(timeSpentStats)} minutes)`);
      }

      // Check required quizzes with detailed analysis
      const quizAnalysis = await this.analyzeQuizRequirements(userId, courseId);
      const requiredQuizzesPassed = quizAnalysis.allRequiredPassed;

      if (!requiredQuizzesPassed) {
        missingRequirements.push(`Required quizzes must be passed (${quizAnalysis.passedCount}/${quizAnalysis.requiredCount} passed)`);
      }

      // Check minimum score requirement if course has one
      let minimumScoreMet = true;
      if (course?.passingScore && quizAnalysis.averageScore < course.passingScore) {
        minimumScoreMet = false;
        missingRequirements.push(`Minimum average score required: ${course.passingScore}% (current: ${Math.round(quizAnalysis.averageScore)}%)`);
      }

      const requirements = {
        courseCompleted,
        requiredQuizzesPassed,
        minimumTimeSpent,
        minimumScore: course?.passingScore,
        hasValidEnrollment,
        noDuplicateCertificate
      };

      const eligible = courseCompleted &&
                      requiredQuizzesPassed &&
                      minimumTimeSpent &&
                      minimumScoreMet &&
                      hasValidEnrollment &&
                      noDuplicateCertificate;

      return {
        eligible,
        reason: eligible ? undefined : missingRequirements.join('; '),
        requirements,
        details: {
          progress: enrollment.progress,
          timeSpent: timeSpentStats,
          averageScore: quizAnalysis.averageScore,
          requiredQuizzes: quizAnalysis.requiredCount,
          passedQuizzes: quizAnalysis.passedCount,
          missingRequirements
        }
      };
    } catch (error) {
      logger.error('Failed to check certificate eligibility:', error);
      throw error;
    }
  }

  // Calculate total time spent on a course by a user
  private async calculateCourseTimeSpent(userId: string, courseId: string): Promise<number> {
    try {
      // Get all progress records for the user in this course
      const progressRecords = await Progress.find({
        user: userId,
        course: courseId
      }).populate('lesson');

      let totalTimeSpent = 0;

      for (const progress of progressRecords) {
        // Add time spent on this lesson
        if (progress.timeSpent) {
          totalTimeSpent += progress.timeSpent;
        }

        // If no time spent recorded but lesson is completed, estimate based on lesson type
        if (!progress.timeSpent && progress.completed && progress.lesson) {
          const lesson = progress.lesson as any;

          // Estimate time based on lesson type and content
          switch (lesson.type) {
            case 'TEXT':
              // Estimate 2-5 minutes for text lessons based on content length
              const textLength = lesson.content?.length || 0;
              totalTimeSpent += Math.max(2, Math.min(5, textLength / 200)); // ~200 chars per minute reading
              break;
            case 'VIDEO':
              // Use video duration if available, otherwise estimate 5-10 minutes
              totalTimeSpent += lesson.videoDuration || 7;
              break;
            case 'QUIZ':
              // Estimate 3-8 minutes for quizzes based on question count
              const questionCount = lesson.questions?.length || 1;
              totalTimeSpent += Math.max(3, Math.min(8, questionCount * 1.5));
              break;
            default:
              // Default estimate for other lesson types
              totalTimeSpent += 5;
          }
        }
      }

      return totalTimeSpent;
    } catch (error) {
      logger.error('Failed to calculate course time spent:', error);
      return 0;
    }
  }

  // Analyze quiz requirements for certificate eligibility
  private async analyzeQuizRequirements(userId: string, courseId: string): Promise<{
    requiredCount: number;
    passedCount: number;
    allRequiredPassed: boolean;
    averageScore: number;
    quizDetails: Array<{
      quizId: string;
      title: string;
      required: boolean;
      passed: boolean;
      bestScore: number;
      attempts: number;
    }>;
  }> {
    try {
      // Get all quizzes for the course
      const quizzes = await QuizAttempt.aggregate([
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
          $group: {
            _id: '$quiz',
            title: { $first: '$quizData.title' },
            isRequired: { $first: '$quizData.isRequired' },
            bestScore: { $max: '$score' },
            passed: { $max: '$passed' },
            attempts: { $sum: 1 }
          }
        }
      ]);

      const requiredQuizzes = quizzes.filter(q => q.isRequired);
      const passedRequiredQuizzes = requiredQuizzes.filter(q => q.passed);

      const averageScore = quizzes.length > 0
        ? quizzes.reduce((sum, q) => sum + q.bestScore, 0) / quizzes.length
        : 0;

      return {
        requiredCount: requiredQuizzes.length,
        passedCount: passedRequiredQuizzes.length,
        allRequiredPassed: requiredQuizzes.length === passedRequiredQuizzes.length,
        averageScore,
        quizDetails: quizzes.map(q => ({
          quizId: q._id.toString(),
          title: q.title,
          required: q.isRequired,
          passed: q.passed,
          bestScore: q.bestScore,
          attempts: q.attempts
        }))
      };
    } catch (error) {
      logger.error('Failed to analyze quiz requirements:', error);
      return {
        requiredCount: 0,
        passedCount: 0,
        allRequiredPassed: false,
        averageScore: 0,
        quizDetails: []
      };
    }
  }

  // Regenerate PDF certificate
  async regeneratePDFCertificate(certificateId: string): Promise<ICertificate | null> {
    try {
      const certificate = await Certificate.findById(certificateId);
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // Delete existing PDF file if it exists
      if (certificate.pdfPath && pdfCertificateService.certificateFileExists(certificate.certificateId)) {
        pdfCertificateService.deleteCertificateFile(certificate.certificateId);
      }

      // Generate new PDF
      await this.generatePDFCertificate(certificate);

      logger.info(`PDF certificate regenerated for certificate ${certificateId}`);
      return certificate;
    } catch (error) {
      logger.error('Failed to regenerate PDF certificate:', error);
      throw error;
    }
  }

  // Get certificate file for download
  async getCertificateFile(certificateId: string, userId?: string): Promise<{
    filePath: string;
    fileName: string;
    mimeType: string;
  } | null> {
    try {
      const certificate = await Certificate.findOne({
        $or: [
          { _id: certificateId },
          { certificateId: certificateId },
          { verificationCode: certificateId }
        ]
      });

      if (!certificate) {
        return null;
      }

      // Check if user owns this certificate (if userId provided)
      if (userId && certificate.user.toString() !== userId) {
        return null;
      }

      // Check if PDF file exists
      if (!certificate.pdfPath || !pdfCertificateService.certificateFileExists(certificate.certificateId)) {
        // Try to regenerate PDF if it doesn't exist
        await this.generatePDFCertificate(certificate);
      }

      // Update download count
      certificate.downloadCount += 1;
      certificate.lastDownloadedAt = new Date();
      await certificate.save();

      return {
        filePath: certificate.pdfPath!,
        fileName: `${certificate.courseName}_Certificate_${certificate.studentName}.pdf`,
        mimeType: 'application/pdf'
      };
    } catch (error) {
      logger.error('Failed to get certificate file:', error);
      throw error;
    }
  }

  // Bulk regenerate certificates
  async bulkRegeneratePDFs(courseId?: string, template?: CertificateTemplate): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const query: any = { isValid: true };
      if (courseId) query.course = courseId;
      if (template) query.template = template;

      const certificates = await Certificate.find(query);

      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const certificate of certificates) {
        try {
          await this.generatePDFCertificate(certificate);
          success++;
        } catch (error) {
          failed++;
          errors.push(`Certificate ${certificate.certificateId}: ${error}`);
        }
      }

      logger.info(`Bulk PDF regeneration completed: ${success} success, ${failed} failed`);
      return { success, failed, errors };
    } catch (error) {
      logger.error('Failed to bulk regenerate PDFs:', error);
      throw error;
    }
  }

  // Automatic certificate generation trigger (called when course is completed)
  async triggerAutomaticCertificateGeneration(userId: string, courseId: string): Promise<{
    generated: boolean;
    certificate?: ICertificate;
    reason?: string;
  }> {
    try {
      // Check eligibility
      const eligibility = await this.checkCertificateEligibility(userId, courseId);

      if (!eligibility.eligible) {
        logger.info(`Certificate not generated for user ${userId}, course ${courseId}: ${eligibility.reason}`);
        return {
          generated: false,
          reason: eligibility.reason
        };
      }

      // Calculate final score
      const quizAnalysis = await this.analyzeQuizRequirements(userId, courseId);
      const finalScore = quizAnalysis.averageScore;

      // Generate certificate
      const certificate = await this.generateCertificate({
        userId,
        courseId,
        completionDate: new Date(),
        finalScore: finalScore > 0 ? finalScore : undefined,
        timeSpent: eligibility.details.timeSpent,
        template: CertificateTemplate.STANDARD
      });

      logger.info(`Certificate automatically generated for user ${userId}, course ${courseId}`);
      return {
        generated: true,
        certificate
      };
    } catch (error) {
      logger.error('Failed to trigger automatic certificate generation:', error);
      return {
        generated: false,
        reason: `Error: ${error}`
      };
    }
  }

  // Validate certificate data before generation
  private async validateCertificateData(data: CertificateGenerationData): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // Validate user exists
      const user = await User.findById(data.userId);
      if (!user) {
        errors.push('User not found');
      }

      // Validate course exists
      const course = await Course.findById(data.courseId);
      if (!course) {
        errors.push('Course not found');
      }

      // Validate completion date
      if (data.completionDate > new Date()) {
        errors.push('Completion date cannot be in the future');
      }

      // Validate final score
      if (data.finalScore !== undefined && (data.finalScore < 0 || data.finalScore > 100)) {
        errors.push('Final score must be between 0 and 100');
      }

      // Validate time spent
      if (data.timeSpent < 0) {
        errors.push('Time spent cannot be negative');
      }

      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({
        user: data.userId,
        course: data.courseId,
        isValid: true
      });

      if (existingCertificate) {
        errors.push('Certificate already exists for this user and course');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error) {
      logger.error('Failed to validate certificate data:', error);
      return {
        valid: false,
        errors: ['Validation error occurred']
      };
    }
  }

  // Retry failed certificate generations
  async retryFailedCertificates(maxRetries: number = 3): Promise<{
    processed: number;
    successful: number;
    failed: number;
    errors: string[];
  }> {
    try {
      // Find certificates with PENDING status (failed PDF generation)
      const failedCertificates = await Certificate.find({
        status: CertificateStatus.PENDING,
        isValid: true
      });

      let processed = 0;
      let successful = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const certificate of failedCertificates) {
        processed++;
        let retryCount = 0;
        let success = false;

        while (retryCount < maxRetries && !success) {
          try {
            await this.generatePDFCertificate(certificate);
            successful++;
            success = true;
            logger.info(`Certificate PDF generated on retry ${retryCount + 1} for ${certificate.certificateId}`);
          } catch (error) {
            retryCount++;
            if (retryCount >= maxRetries) {
              failed++;
              errors.push(`Certificate ${certificate.certificateId}: Failed after ${maxRetries} retries - ${error}`);
            }
          }
        }
      }

      logger.info(`Retry completed: ${processed} processed, ${successful} successful, ${failed} failed`);
      return { processed, successful, failed, errors };
    } catch (error) {
      logger.error('Failed to retry failed certificates:', error);
      throw error;
    }
  }

  // Send reminder emails for undownloaded certificates
  async sendCertificateReminders(daysOld: number = 7): Promise<{
    sent: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Find certificates that are older than cutoff date and haven't been downloaded much
      const certificates = await Certificate.find({
        issuedAt: { $lte: cutoffDate },
        downloadCount: { $lte: 1 }, // Haven't been downloaded or downloaded only once
        isValid: true,
        status: CertificateStatus.GENERATED
      });

      let sent = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const certificate of certificates) {
        try {
          await certificateNotificationService.sendCertificateReminderEmail(certificate);
          sent++;
        } catch (error) {
          failed++;
          errors.push(`Certificate ${certificate.certificateId}: ${error}`);
        }
      }

      logger.info(`Certificate reminders sent: ${sent} successful, ${failed} failed`);
      return { sent, failed, errors };
    } catch (error) {
      logger.error('Failed to send certificate reminders:', error);
      throw error;
    }
  }

  // Send bulk certificate notifications
  async sendBulkNotifications(certificateIds: string[]): Promise<{
    sent: number;
    failed: number;
    errors: string[];
  }> {
    try {
      const certificates = await Certificate.find({
        _id: { $in: certificateIds },
        isValid: true
      });

      return await certificateNotificationService.sendBulkCertificateNotifications(certificates);
    } catch (error) {
      logger.error('Failed to send bulk certificate notifications:', error);
      throw error;
    }
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    try {
      return await certificateNotificationService.testEmailConfiguration();
    } catch (error) {
      logger.error('Failed to test email configuration:', error);
      return false;
    }
  }

  // Get certificate analytics for admin dashboard
  async getCertificateAnalytics(dateRange?: { start: Date; end: Date }): Promise<{
    totalCertificates: number;
    certificatesThisMonth: number;
    certificatesThisWeek: number;
    topCourses: Array<{ courseName: string; count: number }>;
    statusBreakdown: Record<CertificateStatus, number>;
    templateUsage: Record<CertificateTemplate, number>;
    averageGenerationTime: number;
    downloadStats: {
      totalDownloads: number;
      averageDownloadsPerCertificate: number;
      mostDownloadedCertificate: string;
    };
  }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const matchQuery: any = { isValid: true };
      if (dateRange) {
        matchQuery.issuedAt = { $gte: dateRange.start, $lte: dateRange.end };
      }

      const [
        totalStats,
        monthlyStats,
        weeklyStats,
        topCourses,
        statusBreakdown,
        templateUsage,
        downloadStats
      ] = await Promise.all([
        Certificate.countDocuments(matchQuery),
        Certificate.countDocuments({ ...matchQuery, issuedAt: { $gte: startOfMonth } }),
        Certificate.countDocuments({ ...matchQuery, issuedAt: { $gte: startOfWeek } }),
        Certificate.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$courseName', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]),
        Certificate.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Certificate.aggregate([
          { $match: matchQuery },
          { $group: { _id: '$template', count: { $sum: 1 } } }
        ]),
        Certificate.aggregate([
          { $match: matchQuery },
          {
            $group: {
              _id: null,
              totalDownloads: { $sum: '$downloadCount' },
              avgDownloads: { $avg: '$downloadCount' },
              maxDownloads: { $max: '$downloadCount' }
            }
          }
        ])
      ]);

      const statusBreakdownObj = Object.values(CertificateStatus).reduce((acc, status) => {
        acc[status] = 0;
        return acc;
      }, {} as Record<CertificateStatus, number>);

      statusBreakdown.forEach(item => {
        statusBreakdownObj[item._id as CertificateStatus] = item.count;
      });

      const templateUsageObj = Object.values(CertificateTemplate).reduce((acc, template) => {
        acc[template] = 0;
        return acc;
      }, {} as Record<CertificateTemplate, number>);

      templateUsage.forEach(item => {
        templateUsageObj[item._id as CertificateTemplate] = item.count;
      });

      const downloadStatsData = downloadStats[0] || { totalDownloads: 0, avgDownloads: 0, maxDownloads: 0 };

      return {
        totalCertificates: totalStats,
        certificatesThisMonth: monthlyStats,
        certificatesThisWeek: weeklyStats,
        topCourses: topCourses.map(item => ({ courseName: item._id, count: item.count })),
        statusBreakdown: statusBreakdownObj,
        templateUsage: templateUsageObj,
        averageGenerationTime: 0, // This would need to be tracked separately
        downloadStats: {
          totalDownloads: downloadStatsData.totalDownloads,
          averageDownloadsPerCertificate: Math.round(downloadStatsData.avgDownloads * 100) / 100,
          mostDownloadedCertificate: '' // This would need additional query
        }
      };
    } catch (error) {
      logger.error('Failed to get certificate analytics:', error);
      throw error;
    }
  }
}

export default new CertificateService();

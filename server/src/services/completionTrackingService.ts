import mongoose from 'mongoose';
import Lesson, { ILesson, LessonType } from '../models/Lesson';
import Progress, { IProgress, ProgressStatus } from '../models/Progress';
import Enrollment, { IEnrollment, EnrollmentStatus } from '../models/Enrollment';
import Quiz, { IQuiz } from '../models/Quiz';
import QuizAttempt, { IQuizAttempt } from '../models/QuizAttempt';
import Course from '../models/Course';
import logger from '../utils/logger';

export interface LessonCompletionCriteria {
  type: LessonType;
  minimumTimeSpent?: number; // in seconds
  minimumCompletionPercentage?: number;
  requiresQuizPass?: boolean;
  minimumVideoWatchPercentage?: number;
  requiresManualCompletion?: boolean;
}

export interface CompletionResult {
  isComplete: boolean;
  progress: number;
  timeSpent: number;
  completedAt?: Date;
  reason?: string;
  nextRequirements?: string[];
}

class CompletionTrackingService {
  // Define completion criteria for each lesson type
  private readonly completionCriteria: Record<LessonType, LessonCompletionCriteria> = {
    [LessonType.TEXT]: {
      type: LessonType.TEXT,
      minimumTimeSpent: 30, // 30 seconds minimum reading time
      minimumCompletionPercentage: 100,
      requiresManualCompletion: true
    },
    [LessonType.VIDEO]: {
      type: LessonType.VIDEO,
      minimumVideoWatchPercentage: 90, // Must watch 90% of video
      minimumCompletionPercentage: 90,
      requiresManualCompletion: false
    },
    [LessonType.QUIZ]: {
      type: LessonType.QUIZ,
      requiresQuizPass: true,
      minimumCompletionPercentage: 100,
      requiresManualCompletion: false
    }
  };

  // Check if a lesson meets completion criteria
  async checkLessonCompletion(
    userId: string,
    lessonId: string,
    currentProgress?: Partial<IProgress>
  ): Promise<CompletionResult> {
    try {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }

      const criteria = this.completionCriteria[lesson.type];
      const progress = await Progress.findOne({ user: userId, lesson: lessonId });
      
      // Merge current progress with existing progress
      const effectiveProgress = {
        ...progress?.toObject(),
        ...currentProgress
      };

      const result: CompletionResult = {
        isComplete: false,
        progress: effectiveProgress?.completionPercentage || 0,
        timeSpent: effectiveProgress?.timeSpent || 0,
        nextRequirements: []
      };

      switch (lesson.type) {
        case LessonType.TEXT:
          return this.checkTextLessonCompletion(lesson, effectiveProgress, criteria, result);
        
        case LessonType.VIDEO:
          return this.checkVideoLessonCompletion(lesson, effectiveProgress, criteria, result);
        
        case LessonType.QUIZ:
          return await this.checkQuizLessonCompletion(userId, lesson, effectiveProgress, criteria, result);
        
        default:
          result.reason = `Unknown lesson type: ${lesson.type}`;
          return result;
      }
    } catch (error) {
      logger.error('Failed to check lesson completion:', error);
      throw error;
    }
  }

  // Check TEXT lesson completion
  private checkTextLessonCompletion(
    lesson: ILesson,
    progress: any,
    criteria: LessonCompletionCriteria,
    result: CompletionResult
  ): CompletionResult {
    const timeSpent = progress?.timeSpent || 0;
    const completionPercentage = progress?.completionPercentage || 0;

    // Check minimum time requirement
    if (criteria.minimumTimeSpent && timeSpent < criteria.minimumTimeSpent) {
      result.nextRequirements?.push(`Spend at least ${criteria.minimumTimeSpent} seconds reading`);
    }

    // Check completion percentage
    if (criteria.minimumCompletionPercentage && completionPercentage < criteria.minimumCompletionPercentage) {
      result.nextRequirements?.push('Mark lesson as complete');
    }

    // Text lessons require manual completion
    const meetsTimeRequirement = !criteria.minimumTimeSpent || timeSpent >= criteria.minimumTimeSpent;
    const meetsCompletionRequirement = !criteria.minimumCompletionPercentage || 
      completionPercentage >= criteria.minimumCompletionPercentage;

    result.isComplete = meetsTimeRequirement && meetsCompletionRequirement;
    
    if (result.isComplete) {
      result.completedAt = new Date();
      result.progress = 100;
    }

    return result;
  }

  // Check VIDEO lesson completion
  private checkVideoLessonCompletion(
    lesson: ILesson,
    progress: any,
    criteria: LessonCompletionCriteria,
    result: CompletionResult
  ): CompletionResult {
    const completionPercentage = progress?.completionPercentage || 0;
    const lastPosition = progress?.lastPosition || 0;

    // For video lessons, check if user watched enough of the video
    const requiredWatchPercentage = criteria.minimumVideoWatchPercentage || 90;
    
    if (completionPercentage < requiredWatchPercentage) {
      result.nextRequirements?.push(`Watch ${requiredWatchPercentage}% of the video`);
    }

    result.isComplete = completionPercentage >= requiredWatchPercentage;
    
    if (result.isComplete) {
      result.completedAt = new Date();
      result.progress = 100;
    }

    return result;
  }

  // Check QUIZ lesson completion
  private async checkQuizLessonCompletion(
    userId: string,
    lesson: ILesson,
    progress: any,
    criteria: LessonCompletionCriteria,
    result: CompletionResult
  ): Promise<CompletionResult> {
    try {
      // Find the quiz for this lesson
      const quiz = await Quiz.findOne({ lesson: lesson._id });
      if (!quiz) {
        result.reason = 'Quiz not found for this lesson';
        return result;
      }

      // Find the best quiz attempt
      const bestAttempt = await QuizAttempt.findOne({
        user: userId,
        quiz: quiz._id,
        isCompleted: true
      }).sort({ score: -1 });

      if (!bestAttempt) {
        result.nextRequirements?.push('Complete the quiz');
        return result;
      }

      // Check if quiz was passed
      const passed = bestAttempt.passed;
      result.progress = passed ? 100 : bestAttempt.score;

      if (criteria.requiresQuizPass && !passed) {
        result.nextRequirements?.push(`Pass the quiz with at least ${quiz.passingScore}%`);
        result.reason = `Quiz score: ${bestAttempt.score}%, required: ${quiz.passingScore}%`;
      } else {
        result.isComplete = true;
        result.completedAt = bestAttempt.completedAt;
      }

      return result;
    } catch (error) {
      logger.error('Failed to check quiz lesson completion:', error);
      result.reason = 'Error checking quiz completion';
      return result;
    }
  }

  // Update lesson progress and check completion
  async updateLessonProgress(
    userId: string,
    lessonId: string,
    progressData: {
      timeSpent?: number;
      completionPercentage?: number;
      lastPosition?: number;
      status?: ProgressStatus;
    }
  ): Promise<{ progress: IProgress; completionResult: CompletionResult }> {
    try {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        throw new Error('Lesson not found');
      }

      // Check completion with new progress data
      const completionResult = await this.checkLessonCompletion(userId, lessonId, progressData);

      // Prepare progress update data
      const updateData = {
        ...progressData,
        course: lesson.course,
        status: completionResult.isComplete ? ProgressStatus.COMPLETED : 
                (progressData.status || ProgressStatus.IN_PROGRESS),
        ...(completionResult.isComplete && { 
          completedAt: completionResult.completedAt,
          completionPercentage: 100
        })
      };

      // Update or create progress record
      const progress = await Progress.findOneAndUpdate(
        { user: userId, lesson: lessonId },
        { $set: updateData },
        { new: true, upsert: true, runValidators: true }
      );

      logger.info(`Progress updated for user ${userId} in lesson ${lessonId}. Complete: ${completionResult.isComplete}`);

      return { progress, completionResult };
    } catch (error) {
      logger.error('Failed to update lesson progress:', error);
      throw error;
    }
  }

  // Calculate course completion status
  async calculateCourseCompletion(userId: string, courseId: string): Promise<{
    totalLessons: number;
    completedLessons: number;
    progress: number;
    isComplete: boolean;
    completionDetails: {
      textLessons: { total: number; completed: number };
      videoLessons: { total: number; completed: number };
      quizLessons: { total: number; completed: number };
    };
  }> {
    try {
      // Get all published lessons in the course
      const lessons = await Lesson.find({
        course: courseId,
        isPublished: true
      }).select('_id type');

      const totalLessons = lessons.length;

      // Get completed lessons for this user
      const completedProgress = await Progress.find({
        user: userId,
        course: courseId,
        status: ProgressStatus.COMPLETED
      }).select('lesson');

      const completedLessonIds = completedProgress.map(p => p.lesson.toString());
      const completedLessons = completedLessonIds.length;

      // Calculate progress percentage
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const isComplete = progress === 100;

      // Calculate completion details by lesson type
      const completionDetails = {
        textLessons: { total: 0, completed: 0 },
        videoLessons: { total: 0, completed: 0 },
        quizLessons: { total: 0, completed: 0 }
      };

      lessons.forEach(lesson => {
        const isCompleted = completedLessonIds.includes(lesson._id.toString());
        
        switch (lesson.type) {
          case LessonType.TEXT:
            completionDetails.textLessons.total++;
            if (isCompleted) completionDetails.textLessons.completed++;
            break;
          case LessonType.VIDEO:
            completionDetails.videoLessons.total++;
            if (isCompleted) completionDetails.videoLessons.completed++;
            break;
          case LessonType.QUIZ:
            completionDetails.quizLessons.total++;
            if (isCompleted) completionDetails.quizLessons.completed++;
            break;
        }
      });

      return {
        totalLessons,
        completedLessons,
        progress,
        isComplete,
        completionDetails
      };
    } catch (error) {
      logger.error('Failed to calculate course completion:', error);
      throw error;
    }
  }
}

export default new CompletionTrackingService();

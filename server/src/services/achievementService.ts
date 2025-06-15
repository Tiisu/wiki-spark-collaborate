import Achievement, { IAchievement, BadgeType } from '../models/Achievement';
import Enrollment from '../models/Enrollment';
import QuizAttempt from '../models/QuizAttempt';
import Course from '../models/Course';
import logger from '../utils/logger';

interface BadgeDefinition {
  type: BadgeType;
  title: string;
  description: string;
  iconUrl?: string;
  criteria: {
    type: 'course_completion' | 'quiz_score' | 'quiz_count' | 'time_spent' | 'special';
    value?: number;
    courseCategory?: string;
  };
}

class AchievementService {
  // Badge definitions with criteria
  private badgeDefinitions: BadgeDefinition[] = [
    // Wikipedia Basics
    {
      type: BadgeType.FIRST_EDIT,
      title: 'First Edit',
      description: 'Completed your first Wikipedia editing lesson',
      criteria: { type: 'course_completion', courseCategory: 'Wikipedia Basics' }
    },
    {
      type: BadgeType.ACCOUNT_CREATOR,
      title: 'Account Creator',
      description: 'Learned how to create a Wikipedia account',
      criteria: { type: 'course_completion', courseCategory: 'Wikipedia Basics' }
    },
    {
      type: BadgeType.SANDBOX_EXPLORER,
      title: 'Sandbox Explorer',
      description: 'Mastered the Wikipedia sandbox environment',
      criteria: { type: 'course_completion', courseCategory: 'Wikipedia Basics' }
    },

    // Content Creation
    {
      type: BadgeType.ARTICLE_CREATOR,
      title: 'Article Creator',
      description: 'Learned how to create new Wikipedia articles',
      criteria: { type: 'course_completion', courseCategory: 'Content Creation' }
    },
    {
      type: BadgeType.FORMATTING_MASTER,
      title: 'Formatting Master',
      description: 'Mastered Wikipedia formatting and markup',
      criteria: { type: 'course_completion', courseCategory: 'Content Creation' }
    },

    // Sourcing & Citations
    {
      type: BadgeType.CITATION_MASTER,
      title: 'Citation Master',
      description: 'Mastered Wikipedia citation formats',
      criteria: { type: 'course_completion', courseCategory: 'Sourcing & Citations' }
    },
    {
      type: BadgeType.SOURCE_HUNTER,
      title: 'Source Hunter',
      description: 'Expert at finding reliable sources',
      criteria: { type: 'course_completion', courseCategory: 'Sourcing & Citations' }
    },

    // Community & Policy
    {
      type: BadgeType.POLICY_EXPERT,
      title: 'Policy Expert',
      description: 'Understands Wikipedia policies and guidelines',
      criteria: { type: 'course_completion', courseCategory: 'Community & Policy' }
    },
    {
      type: BadgeType.TALK_PAGE_NAVIGATOR,
      title: 'Talk Page Navigator',
      description: 'Skilled in Wikipedia talk page discussions',
      criteria: { type: 'course_completion', courseCategory: 'Community & Policy' }
    },

    // Sister Projects
    {
      type: BadgeType.COMMONS_CONTRIBUTOR,
      title: 'Commons Contributor',
      description: 'Learned to contribute to Wikimedia Commons',
      criteria: { type: 'course_completion', courseCategory: 'Sister Projects' }
    },
    {
      type: BadgeType.WIKTIONARY_EDITOR,
      title: 'Wiktionary Editor',
      description: 'Skilled in editing Wiktionary',
      criteria: { type: 'course_completion', courseCategory: 'Sister Projects' }
    },

    // Learning Milestones
    {
      type: BadgeType.COURSE_COMPLETER,
      title: 'Course Completer',
      description: 'Completed your first course',
      criteria: { type: 'course_completion' }
    },
    {
      type: BadgeType.QUIZ_MASTER,
      title: 'Quiz Master',
      description: 'Passed 10 or more quizzes',
      criteria: { type: 'quiz_count', value: 10 }
    },
    {
      type: BadgeType.PERFECT_SCORE,
      title: 'Perfect Score',
      description: 'Achieved 100% on a quiz',
      criteria: { type: 'quiz_score', value: 100 }
    },
    {
      type: BadgeType.DEDICATED_LEARNER,
      title: 'Dedicated Learner',
      description: 'Spent over 50 hours learning',
      criteria: { type: 'time_spent', value: 3000 } // 50 hours in minutes
    }
  ];

  // Get user achievements
  async getUserAchievements(userId: string): Promise<IAchievement[]> {
    try {
      return await Achievement.find({ user: userId })
        .populate('course', 'title category')
        .populate('quiz', 'title')
        .sort({ earnedAt: -1 })
        .lean();
    } catch (error) {
      logger.error('Failed to get user achievements:', error);
      throw error;
    }
  }

  // Award achievement to user
  async awardAchievement(
    userId: string, 
    badgeType: BadgeType, 
    metadata?: any,
    courseId?: string,
    quizId?: string
  ): Promise<IAchievement | null> {
    try {
      const badgeDefinition = this.badgeDefinitions.find(b => b.type === badgeType);
      if (!badgeDefinition) {
        throw new Error(`Badge definition not found for type: ${badgeType}`);
      }

      // Check if user already has this achievement
      const existingAchievement = await Achievement.findOne({
        user: userId,
        badgeType
      });

      if (existingAchievement) {
        return null; // User already has this achievement
      }

      const achievement = new Achievement({
        user: userId,
        badgeType,
        title: badgeDefinition.title,
        description: badgeDefinition.description,
        iconUrl: badgeDefinition.iconUrl,
        course: courseId,
        quiz: quizId,
        metadata
      });

      await achievement.save();
      logger.info(`Achievement awarded: ${badgeDefinition.title} to user ${userId}`);
      return achievement;
    } catch (error) {
      logger.error('Failed to award achievement:', error);
      throw error;
    }
  }

  // Check and award achievements based on user activity
  async checkAndAwardAchievements(userId: string): Promise<IAchievement[]> {
    try {
      const newAchievements: IAchievement[] = [];

      // Check course completion achievements
      const completedCourses = await Enrollment.find({
        user: userId,
        progress: 100
      }).populate('course', 'title category level');

      for (const enrollment of completedCourses) {
        const course = enrollment.course as any;
        
        // General course completion achievement
        const courseCompleterAchievement = await this.awardAchievement(
          userId,
          BadgeType.COURSE_COMPLETER,
          {
            courseTitle: course.title,
            courseLevel: course.level
          },
          course._id
        );
        if (courseCompleterAchievement) newAchievements.push(courseCompleterAchievement);

        // Category-specific achievements
        const categoryAchievements = this.badgeDefinitions.filter(
          b => b.criteria.type === 'course_completion' && 
               b.criteria.courseCategory === course.category
        );

        for (const badgeDef of categoryAchievements) {
          const achievement = await this.awardAchievement(
            userId,
            badgeDef.type,
            {
              courseTitle: course.title,
              courseCategory: course.category
            },
            course._id
          );
          if (achievement) newAchievements.push(achievement);
        }
      }

      // Check quiz-based achievements
      const passedQuizzes = await QuizAttempt.find({
        user: userId,
        passed: true
      }).populate('quiz', 'title').populate('course', 'title');

      // Quiz master achievement
      if (passedQuizzes.length >= 10) {
        const quizMasterAchievement = await this.awardAchievement(
          userId,
          BadgeType.QUIZ_MASTER,
          {
            totalQuizzesPassed: passedQuizzes.length
          }
        );
        if (quizMasterAchievement) newAchievements.push(quizMasterAchievement);
      }

      // Perfect score achievements
      const perfectScores = passedQuizzes.filter(attempt => attempt.score === 100);
      if (perfectScores.length > 0) {
        const perfectScoreAchievement = await this.awardAchievement(
          userId,
          BadgeType.PERFECT_SCORE,
          {
            perfectScores: perfectScores.length,
            latestPerfectQuiz: perfectScores[perfectScores.length - 1].quiz
          }
        );
        if (perfectScoreAchievement) newAchievements.push(perfectScoreAchievement);
      }

      // Check time-based achievements
      const totalTimeSpent = await this.calculateTotalTimeSpent(userId);
      if (totalTimeSpent >= 3000) { // 50 hours
        const dedicatedLearnerAchievement = await this.awardAchievement(
          userId,
          BadgeType.DEDICATED_LEARNER,
          {
            totalTimeSpent: totalTimeSpent,
            totalHours: Math.round(totalTimeSpent / 60)
          }
        );
        if (dedicatedLearnerAchievement) newAchievements.push(dedicatedLearnerAchievement);
      }

      return newAchievements;
    } catch (error) {
      logger.error('Failed to check and award achievements:', error);
      throw error;
    }
  }

  // Calculate total time spent by user
  private async calculateTotalTimeSpent(userId: string): Promise<number> {
    try {
      // Sum time from quiz attempts and course progress
      const quizTime = await QuizAttempt.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, totalTime: { $sum: '$timeSpent' } } }
      ]);

      // Convert seconds to minutes for quiz time
      const quizTimeMinutes = quizTime.length > 0 ? Math.round(quizTime[0].totalTime / 60) : 0;

      // For now, we'll use quiz time as a proxy for total time
      // In a real implementation, you'd track lesson viewing time separately
      return quizTimeMinutes;
    } catch (error) {
      logger.error('Failed to calculate total time spent:', error);
      return 0;
    }
  }

  // Get achievement statistics
  async getAchievementStats(userId: string): Promise<{
    totalAchievements: number;
    recentAchievements: IAchievement[];
    categoryBreakdown: Record<string, number>;
  }> {
    try {
      const achievements = await this.getUserAchievements(userId);
      
      const categoryBreakdown: Record<string, number> = {};
      achievements.forEach(achievement => {
        const category = this.getAchievementCategory(achievement.badgeType);
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
      });

      const recentAchievements = achievements.slice(0, 5); // Last 5 achievements

      return {
        totalAchievements: achievements.length,
        recentAchievements,
        categoryBreakdown
      };
    } catch (error) {
      logger.error('Failed to get achievement stats:', error);
      throw error;
    }
  }

  // Get achievement category
  private getAchievementCategory(badgeType: BadgeType): string {
    if ([BadgeType.FIRST_EDIT, BadgeType.ACCOUNT_CREATOR, BadgeType.SANDBOX_EXPLORER].includes(badgeType)) {
      return 'Wikipedia Basics';
    }
    if ([BadgeType.ARTICLE_CREATOR, BadgeType.CONTENT_CONTRIBUTOR, BadgeType.FORMATTING_MASTER].includes(badgeType)) {
      return 'Content Creation';
    }
    if ([BadgeType.CITATION_MASTER, BadgeType.SOURCE_HUNTER, BadgeType.REFERENCE_EXPERT].includes(badgeType)) {
      return 'Sourcing & Citations';
    }
    if ([BadgeType.POLICY_EXPERT, BadgeType.TALK_PAGE_NAVIGATOR, BadgeType.CONSENSUS_BUILDER].includes(badgeType)) {
      return 'Community & Policy';
    }
    if ([BadgeType.COMMONS_CONTRIBUTOR, BadgeType.WIKTIONARY_EDITOR, BadgeType.WIKIBOOKS_AUTHOR].includes(badgeType)) {
      return 'Sister Projects';
    }
    if ([BadgeType.COURSE_COMPLETER, BadgeType.QUIZ_MASTER, BadgeType.PERFECT_SCORE].includes(badgeType)) {
      return 'Learning Milestones';
    }
    return 'Other';
  }

  // Get all available badges (for display purposes)
  getBadgeDefinitions(): BadgeDefinition[] {
    return this.badgeDefinitions;
  }
}

export default new AchievementService();

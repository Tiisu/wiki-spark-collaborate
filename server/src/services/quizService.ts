import Quiz, { IQuiz, IQuizQuestion } from '../models/Quiz';
import QuizAttempt, { IQuizAttempt } from '../models/QuizAttempt';
import Achievement, { BadgeType } from '../models/Achievement';
import logger from '../utils/logger';

interface CreateQuizData {
  title: string;
  description?: string;
  lessonId: string;
  courseId: string;
  questions: IQuizQuestion[];
  passingScore: number;
  timeLimit?: number;
  maxAttempts?: number;
  showCorrectAnswers?: boolean;
  showScoreImmediately?: boolean;
  isRequired?: boolean;
  order: number;
}

interface SubmitQuizData {
  answers: Array<{
    questionId: string;
    userAnswer: string | string[];
  }>;
  timeSpent: number;
}

class QuizService {
  // Create new quiz
  async createQuiz(instructorId: string, quizData: CreateQuizData): Promise<IQuiz> {
    try {
      const quiz = new Quiz({
        ...quizData,
        lesson: quizData.lessonId,
        course: quizData.courseId,
        isPublished: false
      });

      await quiz.save();
      logger.info(`Quiz created: ${quiz.title} by instructor ${instructorId}`);
      return quiz;
    } catch (error) {
      logger.error('Failed to create quiz:', error);
      throw error;
    }
  }

  // Get quiz by ID
  async getQuizById(quizId: string, includeAnswers = false): Promise<IQuiz | null> {
    try {
      const quiz = await Quiz.findById(quizId)
        .populate('lesson', 'title')
        .populate('course', 'title')
        .lean();

      if (!quiz) {
        return null;
      }

      // Remove correct answers if not requested (for student view)
      if (!includeAnswers) {
        quiz.questions = quiz.questions.map(q => ({
          ...q,
          correctAnswer: undefined,
          explanation: undefined
        }));
      }

      return quiz;
    } catch (error) {
      logger.error('Failed to get quiz:', error);
      throw error;
    }
  }

  // Get quizzes for a lesson
  async getQuizzesByLesson(lessonId: string): Promise<IQuiz[]> {
    try {
      return await Quiz.find({ 
        lesson: lessonId, 
        isPublished: true 
      })
        .sort({ order: 1 })
        .lean();
    } catch (error) {
      logger.error('Failed to get quizzes by lesson:', error);
      throw error;
    }
  }

  // Submit quiz attempt
  async submitQuiz(userId: string, quizId: string, submissionData: SubmitQuizData): Promise<IQuizAttempt> {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Check if user has exceeded max attempts
      if (quiz.maxAttempts) {
        const attemptCount = await QuizAttempt.countDocuments({
          user: userId,
          quiz: quizId,
          isCompleted: true
        });

        if (attemptCount >= quiz.maxAttempts) {
          throw new Error('Maximum attempts exceeded');
        }
      }

      // Calculate score
      const { answers, score, totalPoints, earnedPoints } = this.calculateScore(
        quiz.questions,
        submissionData.answers
      );

      const passed = score >= quiz.passingScore;
      const attemptNumber = await this.getNextAttemptNumber(userId, quizId);

      const quizAttempt = new QuizAttempt({
        user: userId,
        quiz: quizId,
        course: quiz.course,
        lesson: quiz.lesson,
        answers,
        score,
        totalPoints,
        earnedPoints,
        passed,
        timeSpent: submissionData.timeSpent,
        attemptNumber,
        isCompleted: true,
        completedAt: new Date()
      });

      await quizAttempt.save();

      // Award achievements if applicable
      if (passed) {
        await this.checkAndAwardAchievements(userId, quiz, quizAttempt);
      }

      logger.info(`Quiz attempt submitted: User ${userId}, Quiz ${quizId}, Score: ${score}%`);
      return quizAttempt;
    } catch (error) {
      logger.error('Failed to submit quiz:', error);
      throw error;
    }
  }

  // Calculate quiz score
  private calculateScore(questions: IQuizQuestion[], userAnswers: Array<{ questionId: string; userAnswer: string | string[] }>) {
    let totalPoints = 0;
    let earnedPoints = 0;
    
    const answers = questions.map(question => {
      const userAnswer = userAnswers.find(a => a.questionId === question.id);
      const isCorrect = this.isAnswerCorrect(question, userAnswer?.userAnswer);
      const pointsEarned = isCorrect ? question.points : 0;
      
      totalPoints += question.points;
      earnedPoints += pointsEarned;
      
      return {
        questionId: question.id,
        userAnswer: userAnswer?.userAnswer || '',
        isCorrect,
        pointsEarned
      };
    });

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    return { answers, score, totalPoints, earnedPoints };
  }

  // Check if answer is correct
  private isAnswerCorrect(question: IQuizQuestion, userAnswer: string | string[] | undefined): boolean {
    if (!userAnswer) return false;

    const correctAnswer = question.correctAnswer;
    
    if (Array.isArray(correctAnswer)) {
      // Multiple correct answers
      if (Array.isArray(userAnswer)) {
        return correctAnswer.length === userAnswer.length && 
               correctAnswer.every(answer => userAnswer.includes(answer));
      }
      return correctAnswer.includes(userAnswer as string);
    } else {
      // Single correct answer
      if (Array.isArray(userAnswer)) {
        return userAnswer.length === 1 && userAnswer[0] === correctAnswer;
      }
      return userAnswer === correctAnswer;
    }
  }

  // Get next attempt number for user
  private async getNextAttemptNumber(userId: string, quizId: string): Promise<number> {
    const lastAttempt = await QuizAttempt.findOne({
      user: userId,
      quiz: quizId
    }).sort({ attemptNumber: -1 });

    return lastAttempt ? lastAttempt.attemptNumber + 1 : 1;
  }

  // Check and award achievements
  private async checkAndAwardAchievements(userId: string, quiz: IQuiz, attempt: IQuizAttempt): Promise<void> {
    try {
      const achievements = [];

      // Perfect score achievement
      if (attempt.score === 100) {
        achievements.push({
          user: userId,
          badgeType: BadgeType.PERFECT_SCORE,
          title: 'Perfect Score',
          description: 'Achieved 100% on a quiz',
          quiz: quiz._id,
          metadata: {
            score: attempt.score,
            quizTitle: quiz.title
          }
        });
      }

      // Quiz master achievement (passed 10 quizzes)
      const passedQuizzes = await QuizAttempt.countDocuments({
        user: userId,
        passed: true
      });

      if (passedQuizzes >= 10) {
        achievements.push({
          user: userId,
          badgeType: BadgeType.QUIZ_MASTER,
          title: 'Quiz Master',
          description: 'Passed 10 or more quizzes',
          metadata: {
            totalQuizzesPassed: passedQuizzes
          }
        });
      }

      // Save achievements (ignore duplicates)
      for (const achievement of achievements) {
        try {
          await Achievement.create(achievement);
        } catch (error) {
          // Ignore duplicate key errors (user already has this achievement)
          if (error.code !== 11000) {
            logger.error('Failed to create achievement:', error);
          }
        }
      }
    } catch (error) {
      logger.error('Failed to check achievements:', error);
    }
  }

  // Get user's quiz attempts
  async getUserQuizAttempts(userId: string, quizId?: string): Promise<IQuizAttempt[]> {
    try {
      const query: any = { user: userId };
      if (quizId) {
        query.quiz = quizId;
      }

      return await QuizAttempt.find(query)
        .populate('quiz', 'title passingScore')
        .populate('course', 'title')
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      logger.error('Failed to get user quiz attempts:', error);
      throw error;
    }
  }

  // Update quiz
  async updateQuiz(quizId: string, instructorId: string, updateData: Partial<CreateQuizData>): Promise<IQuiz | null> {
    try {
      const quiz = await Quiz.findOneAndUpdate(
        { _id: quizId },
        updateData,
        { new: true, runValidators: true }
      );

      if (quiz) {
        logger.info(`Quiz updated: ${quiz.title} by instructor ${instructorId}`);
      }

      return quiz;
    } catch (error) {
      logger.error('Failed to update quiz:', error);
      throw error;
    }
  }

  // Delete quiz
  async deleteQuiz(quizId: string, instructorId: string): Promise<boolean> {
    try {
      const result = await Quiz.findByIdAndDelete(quizId);
      
      if (result) {
        // Also delete all attempts for this quiz
        await QuizAttempt.deleteMany({ quiz: quizId });
        logger.info(`Quiz deleted: ${result.title} by instructor ${instructorId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Failed to delete quiz:', error);
      throw error;
    }
  }
}

export default new QuizService();

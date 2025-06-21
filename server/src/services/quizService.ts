import Quiz, { IQuiz, IQuizQuestion, QuestionType } from '../models/Quiz';
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
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  questionsPerAttempt?: number;
  questionBank?: IQuizQuestion[];
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
        quiz.questions = quiz.questions.map(q => {
          const { correctAnswer, explanation, ...questionWithoutAnswers } = q;
          return questionWithoutAnswers;
        }) as any;
      }

      return quiz;
    } catch (error) {
      logger.error('Failed to get quiz:', error);
      throw error;
    }
  }

  // Get randomized quiz for attempt
  async getRandomizedQuiz(quizId: string, userId: string, includeAnswers: boolean = false): Promise<IQuiz | null> {
    try {
      const quiz = await Quiz.findById(quizId)
        .populate('lesson', 'title')
        .populate('course', 'title')
        .lean();

      if (!quiz) return null;

      let questions = [...quiz.questions];

      // Use question bank if available and questionsPerAttempt is set
      if (quiz.questionBank && quiz.questionBank.length > 0 && quiz.questionsPerAttempt) {
        questions = this.selectRandomQuestions(quiz.questionBank, quiz.questionsPerAttempt);
      }

      // Randomize question order if enabled
      if (quiz.randomizeQuestions) {
        questions = this.shuffleArray(questions);
      }

      // Randomize options for multiple choice questions if enabled
      if (quiz.randomizeOptions) {
        questions = questions.map(question => {
          if (question.type === QuestionType.MULTIPLE_CHOICE && question.options) {
            const shuffledOptions = this.shuffleArray([...question.options]);
            return { ...question, options: shuffledOptions };
          }
          return question;
        });
      }

      // Remove correct answers if not requested
      if (!includeAnswers) {
        questions = questions.map(q => {
          const { correctAnswer, explanation, ...questionWithoutAnswers } = q;
          return questionWithoutAnswers;
        }) as any;
      }

      return { ...quiz, questions };
    } catch (error) {
      logger.error('Failed to get randomized quiz:', error);
      throw error;
    }
  }

  // Select random questions from question bank
  private selectRandomQuestions(questionBank: IQuizQuestion[], count: number): IQuizQuestion[] {
    if (questionBank.length <= count) {
      return [...questionBank];
    }

    const shuffled = this.shuffleArray([...questionBank]);
    return shuffled.slice(0, count);
  }

  // Shuffle array using Fisher-Yates algorithm
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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
          throw new Error(`Maximum attempts exceeded. You have already completed ${attemptCount} attempts out of ${quiz.maxAttempts} allowed.`);
        }
      }

      // Validate time limit if set
      if (quiz.timeLimit && submissionData.timeSpent) {
        const timeLimitSeconds = quiz.timeLimit * 60;
        const gracePeriodSeconds = 30; // Allow 30 seconds grace period for network delays

        if (submissionData.timeSpent > timeLimitSeconds + gracePeriodSeconds) {
          throw new Error(`Time limit exceeded. Quiz must be completed within ${quiz.timeLimit} minutes.`);
        }
      }

      // Calculate score
      const {
        answers,
        score,
        rawScore,
        totalPoints,
        earnedPoints,
        totalWeightedPoints,
        earnedWeightedPoints
      } = this.calculateScore(quiz.questions, submissionData.answers);

      const passed = score >= quiz.passingScore;
      const attemptNumber = await this.getNextAttemptNumber(userId, quizId);

      const quizAttempt = new QuizAttempt({
        user: userId,
        quiz: quizId,
        course: quiz.course,
        lesson: quiz.lesson,
        answers,
        score,
        rawScore,
        totalPoints,
        earnedPoints,
        totalWeightedPoints,
        earnedWeightedPoints,
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

  // Calculate quiz score with weighted scoring and partial credit
  private calculateScore(questions: IQuizQuestion[], userAnswers: Array<{ questionId: string; userAnswer: string | string[] }>) {
    let totalWeightedPoints = 0;
    let earnedWeightedPoints = 0;
    let totalRawPoints = 0;
    let earnedRawPoints = 0;

    const answers = questions.map(question => {
      const userAnswer = userAnswers.find(a => a.questionId === question.id);
      const weight = question.weight || 1;
      const rawPoints = question.points;
      const weightedPoints = rawPoints * weight;

      // Calculate points earned (with partial credit support)
      const { isCorrect, pointsEarned, partialCredit } = this.calculateQuestionScore(question, userAnswer?.userAnswer);
      const weightedPointsEarned = pointsEarned * weight;

      totalRawPoints += rawPoints;
      earnedRawPoints += pointsEarned;
      totalWeightedPoints += weightedPoints;
      earnedWeightedPoints += weightedPointsEarned;

      return {
        questionId: question.id,
        userAnswer: userAnswer?.userAnswer || '',
        isCorrect,
        pointsEarned,
        maxPoints: rawPoints,
        weight,
        weightedPointsEarned,
        partialCredit
      };
    });

    const score = totalWeightedPoints > 0 ? Math.round((earnedWeightedPoints / totalWeightedPoints) * 100) : 0;
    const rawScore = totalRawPoints > 0 ? Math.round((earnedRawPoints / totalRawPoints) * 100) : 0;

    return {
      answers,
      score,
      rawScore,
      totalPoints: totalRawPoints,
      earnedPoints: earnedRawPoints,
      totalWeightedPoints,
      earnedWeightedPoints
    };
  }

  // Calculate score for individual question with partial credit support
  private calculateQuestionScore(question: IQuizQuestion, userAnswer: string | string[] | undefined): {
    isCorrect: boolean;
    pointsEarned: number;
    partialCredit?: number;
  } {
    if (!userAnswer) {
      return { isCorrect: false, pointsEarned: 0 };
    }

    const maxPoints = question.points;

    switch (question.type) {
      case QuestionType.SHORT_ANSWER:
        return this.calculateShortAnswerScore(question, userAnswer as string, maxPoints);

      case QuestionType.ESSAY:
      case QuestionType.MATCHING:
      case QuestionType.ORDERING:
        // These require manual grading
        return { isCorrect: false, pointsEarned: 0 };

      case QuestionType.MULTIPLE_CHOICE:
      case QuestionType.TRUE_FALSE:
      case QuestionType.FILL_IN_BLANK:
        const isCorrect = this.isAnswerCorrect(question, userAnswer);
        return {
          isCorrect,
          pointsEarned: isCorrect ? maxPoints : 0
        };

      default:
        const correct = this.isAnswerCorrect(question, userAnswer);
        return {
          isCorrect: correct,
          pointsEarned: correct ? maxPoints : 0
        };
    }
  }

  // Calculate short answer score with partial credit
  private calculateShortAnswerScore(question: IQuizQuestion, userAnswer: string, maxPoints: number): {
    isCorrect: boolean;
    pointsEarned: number;
    partialCredit?: number;
  } {
    if (!userAnswer || typeof userAnswer !== 'string') {
      return { isCorrect: false, pointsEarned: 0 };
    }

    const answer = question.caseSensitive ? userAnswer.trim() : userAnswer.trim().toLowerCase();
    const correctAnswer = question.correctAnswer as string;
    const normalizedCorrect = question.caseSensitive ? correctAnswer.trim() : correctAnswer.trim().toLowerCase();

    // Exact match - full points
    if (answer === normalizedCorrect) {
      return { isCorrect: true, pointsEarned: maxPoints };
    }

    // Keyword matching with partial credit
    if (question.allowPartialCredit && question.keywords && question.keywords.length > 0) {
      const keywords = question.keywords.map(k =>
        question.caseSensitive ? k.trim() : k.trim().toLowerCase()
      );

      const matchedKeywords = keywords.filter(keyword => answer.includes(keyword));
      const partialCreditPercentage = matchedKeywords.length / keywords.length;

      if (matchedKeywords.length > 0) {
        const pointsEarned = Math.round(maxPoints * partialCreditPercentage);
        return {
          isCorrect: partialCreditPercentage === 1,
          pointsEarned,
          partialCredit: partialCreditPercentage
        };
      }
    }

    return { isCorrect: false, pointsEarned: 0 };
  }

  // Check if answer is correct
  private isAnswerCorrect(question: IQuizQuestion, userAnswer: string | string[] | undefined): boolean {
    if (!userAnswer) return false;

    const correctAnswer = question.correctAnswer;

    // Handle different question types
    switch (question.type) {
      case QuestionType.SHORT_ANSWER:
        return this.checkShortAnswer(question, userAnswer as string);

      case QuestionType.ESSAY:
        // Essays require manual grading, return false for auto-grading
        return false;

      case QuestionType.MATCHING:
      case QuestionType.ORDERING:
        // These require manual grading, return false for auto-grading
        return false;

      default:
        // Handle traditional question types
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
  }

  // Check short answer with keyword matching
  private checkShortAnswer(question: IQuizQuestion, userAnswer: string): boolean {
    if (!userAnswer || typeof userAnswer !== 'string') return false;

    const answer = question.caseSensitive ? userAnswer.trim() : userAnswer.trim().toLowerCase();
    const correctAnswer = question.correctAnswer as string;
    const normalizedCorrect = question.caseSensitive ? correctAnswer.trim() : correctAnswer.trim().toLowerCase();

    // Exact match
    if (answer === normalizedCorrect) return true;

    // Keyword matching if keywords are provided
    if (question.keywords && question.keywords.length > 0) {
      const keywords = question.keywords.map(k =>
        question.caseSensitive ? k.trim() : k.trim().toLowerCase()
      );

      // Check if answer contains all required keywords
      return keywords.every(keyword => answer.includes(keyword));
    }

    return false;
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
        } catch (error: any) {
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

  // Start a new quiz attempt (for timed quizzes)
  async startQuizAttempt(userId: string, quizId: string): Promise<{ attemptId: string; timeLimit?: number; expiresAt?: Date }> {
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
          throw new Error(`Maximum attempts exceeded. You have already completed ${attemptCount} attempts out of ${quiz.maxAttempts} allowed.`);
        }
      }

      // Check for existing incomplete attempt
      const existingAttempt = await QuizAttempt.findOne({
        user: userId,
        quiz: quizId,
        isCompleted: false
      });

      if (existingAttempt) {
        // Check if existing attempt has expired
        if (quiz.timeLimit) {
          const timeLimitMs = quiz.timeLimit * 60 * 1000;
          const expiresAt = new Date(existingAttempt.startedAt.getTime() + timeLimitMs);

          if (new Date() > expiresAt) {
            // Mark as completed with 0 score due to timeout
            existingAttempt.isCompleted = true;
            existingAttempt.completedAt = new Date();
            existingAttempt.score = 0;
            existingAttempt.passed = false;
            await existingAttempt.save();
          } else {
            // Return existing attempt
            return {
              attemptId: existingAttempt._id,
              timeLimit: quiz.timeLimit,
              expiresAt
            };
          }
        } else {
          // No time limit, return existing attempt
          return {
            attemptId: existingAttempt._id
          };
        }
      }

      // Create new attempt
      const attemptNumber = await this.getNextAttemptNumber(userId, quizId);
      const newAttempt = new QuizAttempt({
        user: userId,
        quiz: quizId,
        course: quiz.course,
        lesson: quiz.lesson,
        answers: [],
        score: 0,
        totalPoints: 0,
        earnedPoints: 0,
        passed: false,
        timeSpent: 0,
        attemptNumber,
        isCompleted: false,
        startedAt: new Date()
      });

      await newAttempt.save();

      const result: { attemptId: string; timeLimit?: number; expiresAt?: Date } = {
        attemptId: newAttempt._id
      };

      if (quiz.timeLimit) {
        result.timeLimit = quiz.timeLimit;
        result.expiresAt = new Date(newAttempt.startedAt.getTime() + quiz.timeLimit * 60 * 1000);
      }

      logger.info(`Quiz attempt started: User ${userId}, Quiz ${quizId}, Attempt ${attemptNumber}`);
      return result;
    } catch (error) {
      logger.error('Failed to start quiz attempt:', error);
      throw error;
    }
  }

  // Check if quiz attempt is still valid (not expired)
  async validateQuizAttempt(userId: string, quizId: string, attemptId: string): Promise<{ valid: boolean; timeRemaining?: number; expired?: boolean }> {
    try {
      const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        user: userId,
        quiz: quizId,
        isCompleted: false
      });

      if (!attempt) {
        return { valid: false };
      }

      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return { valid: false };
      }

      if (quiz.timeLimit) {
        const timeLimitMs = quiz.timeLimit * 60 * 1000;
        const expiresAt = new Date(attempt.startedAt.getTime() + timeLimitMs);
        const now = new Date();

        if (now > expiresAt) {
          // Mark as completed with timeout
          attempt.isCompleted = true;
          attempt.completedAt = now;
          attempt.score = 0;
          attempt.passed = false;
          attempt.timeSpent = Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000);
          await attempt.save();

          return { valid: false, expired: true };
        }

        const timeRemaining = Math.max(0, Math.round((expiresAt.getTime() - now.getTime()) / 1000));
        return { valid: true, timeRemaining };
      }

      return { valid: true };
    } catch (error) {
      logger.error('Failed to validate quiz attempt:', error);
      return { valid: false };
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

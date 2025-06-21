import QuizAttempt, { IQuizAttempt } from '../models/QuizAttempt';
import Quiz, { IQuiz } from '../models/Quiz';
import User from '../models/User';
import logger from '../utils/logger';

interface QuizAnalytics {
  totalAttempts: number;
  uniqueStudents: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  scoreDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  questionAnalytics: {
    questionId: string;
    question: string;
    correctRate: number;
    averagePoints: number;
    totalAttempts: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }[];
  timeAnalytics: {
    averageTime: number;
    fastestTime: number;
    slowestTime: number;
    timeDistribution: {
      range: string;
      count: number;
    }[];
  };
  trends: {
    period: string;
    attempts: number;
    averageScore: number;
    passRate: number;
  }[];
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  attempts: number;
  bestScore: number;
  latestScore: number;
  averageScore: number;
  totalTimeSpent: number;
  passed: boolean;
  improvement: number;
  weakAreas: string[];
  strengths: string[];
}

class QuizAnalyticsService {
  // Get comprehensive quiz analytics
  async getQuizAnalytics(quizId: string, dateRange?: { start: Date; end: Date }): Promise<QuizAnalytics> {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      // Build query with optional date range
      const query: any = { quiz: quizId, isCompleted: true };
      if (dateRange) {
        query.completedAt = {
          $gte: dateRange.start,
          $lte: dateRange.end
        };
      }

      const attempts = await QuizAttempt.find(query)
        .populate('user', 'firstName lastName')
        .sort({ completedAt: -1 });

      // Basic statistics
      const totalAttempts = attempts.length;
      const uniqueStudents = new Set(attempts.map(a => a.user.toString())).size;
      const averageScore = totalAttempts > 0 
        ? attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts 
        : 0;
      const passedAttempts = attempts.filter(a => a.passed).length;
      const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
      const averageTimeSpent = totalAttempts > 0
        ? attempts.reduce((sum, a) => sum + a.timeSpent, 0) / totalAttempts
        : 0;

      // Score distribution
      const scoreDistribution = this.calculateScoreDistribution(attempts);

      // Question analytics
      const questionAnalytics = this.calculateQuestionAnalytics(quiz, attempts);

      // Time analytics
      const timeAnalytics = this.calculateTimeAnalytics(attempts);

      // Trends (last 30 days by week)
      const trends = await this.calculateTrends(quizId, 30);

      return {
        totalAttempts,
        uniqueStudents,
        averageScore,
        passRate,
        averageTimeSpent,
        scoreDistribution,
        questionAnalytics,
        timeAnalytics,
        trends
      };
    } catch (error) {
      logger.error('Failed to get quiz analytics:', error);
      throw error;
    }
  }

  // Get student progress analytics
  async getStudentProgress(quizId: string, studentId?: string): Promise<StudentProgress[]> {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }

      const query: any = { quiz: quizId, isCompleted: true };
      if (studentId) {
        query.user = studentId;
      }

      const attempts = await QuizAttempt.find(query)
        .populate('user', 'firstName lastName')
        .sort({ user: 1, completedAt: 1 });

      // Group attempts by student
      const studentAttempts = new Map<string, IQuizAttempt[]>();
      attempts.forEach(attempt => {
        const userId = attempt.user._id.toString();
        if (!studentAttempts.has(userId)) {
          studentAttempts.set(userId, []);
        }
        studentAttempts.get(userId)!.push(attempt);
      });

      // Calculate progress for each student
      const progress: StudentProgress[] = [];
      for (const [userId, userAttempts] of studentAttempts) {
        const user = userAttempts[0].user;
        const scores = userAttempts.map(a => a.score);
        const bestScore = Math.max(...scores);
        const latestScore = scores[scores.length - 1];
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const totalTimeSpent = userAttempts.reduce((sum, a) => sum + a.timeSpent, 0);
        const passed = userAttempts.some(a => a.passed);
        const improvement = scores.length > 1 ? latestScore - scores[0] : 0;

        // Analyze weak areas and strengths
        const { weakAreas, strengths } = this.analyzeStudentPerformance(quiz, userAttempts);

        progress.push({
          studentId: userId,
          studentName: `${user.firstName} ${user.lastName}`,
          attempts: userAttempts.length,
          bestScore,
          latestScore,
          averageScore,
          totalTimeSpent,
          passed,
          improvement,
          weakAreas,
          strengths
        });
      }

      return progress.sort((a, b) => b.bestScore - a.bestScore);
    } catch (error) {
      logger.error('Failed to get student progress:', error);
      throw error;
    }
  }

  // Calculate score distribution
  private calculateScoreDistribution(attempts: IQuizAttempt[]) {
    const ranges = [
      { min: 0, max: 20, label: '0-20%' },
      { min: 21, max: 40, label: '21-40%' },
      { min: 41, max: 60, label: '41-60%' },
      { min: 61, max: 80, label: '61-80%' },
      { min: 81, max: 100, label: '81-100%' }
    ];

    const total = attempts.length;
    return ranges.map(range => {
      const count = attempts.filter(a => a.score >= range.min && a.score <= range.max).length;
      return {
        range: range.label,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      };
    });
  }

  // Calculate question-level analytics
  private calculateQuestionAnalytics(quiz: IQuiz, attempts: IQuizAttempt[]) {
    return quiz.questions.map(question => {
      const questionAttempts = attempts.flatMap(attempt => 
        attempt.answers.filter(answer => answer.questionId === question.id)
      );
      
      const correctCount = questionAttempts.filter(a => a.isCorrect).length;
      const totalAttempts = questionAttempts.length;
      const correctRate = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
      const averagePoints = totalAttempts > 0 
        ? questionAttempts.reduce((sum, a) => sum + a.pointsEarned, 0) / totalAttempts 
        : 0;

      // Determine difficulty based on performance
      let difficulty: 'easy' | 'medium' | 'hard';
      if (correctRate >= 80) difficulty = 'easy';
      else if (correctRate >= 50) difficulty = 'medium';
      else difficulty = 'hard';

      return {
        questionId: question.id,
        question: question.question,
        correctRate,
        averagePoints,
        totalAttempts,
        difficulty
      };
    });
  }

  // Calculate time analytics
  private calculateTimeAnalytics(attempts: IQuizAttempt[]) {
    if (attempts.length === 0) {
      return {
        averageTime: 0,
        fastestTime: 0,
        slowestTime: 0,
        timeDistribution: []
      };
    }

    const times = attempts.map(a => a.timeSpent);
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const fastestTime = Math.min(...times);
    const slowestTime = Math.max(...times);

    // Time distribution in minutes
    const timeRanges = [
      { min: 0, max: 300, label: '0-5 min' },
      { min: 301, max: 600, label: '5-10 min' },
      { min: 601, max: 900, label: '10-15 min' },
      { min: 901, max: 1200, label: '15-20 min' },
      { min: 1201, max: Infinity, label: '20+ min' }
    ];

    const timeDistribution = timeRanges.map(range => ({
      range: range.label,
      count: attempts.filter(a => a.timeSpent >= range.min && a.timeSpent <= range.max).length
    }));

    return {
      averageTime,
      fastestTime,
      slowestTime,
      timeDistribution
    };
  }

  // Calculate trends over time
  private async calculateTrends(quizId: string, days: number) {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const attempts = await QuizAttempt.find({
      quiz: quizId,
      isCompleted: true,
      completedAt: { $gte: startDate, $lte: endDate }
    });

    // Group by week
    const weeks = Math.ceil(days / 7);
    const trends = [];

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekAttempts = attempts.filter(a => 
        a.completedAt >= weekStart && a.completedAt < weekEnd
      );

      const averageScore = weekAttempts.length > 0
        ? weekAttempts.reduce((sum, a) => sum + a.score, 0) / weekAttempts.length
        : 0;
      
      const passRate = weekAttempts.length > 0
        ? (weekAttempts.filter(a => a.passed).length / weekAttempts.length) * 100
        : 0;

      trends.push({
        period: `Week ${i + 1}`,
        attempts: weekAttempts.length,
        averageScore,
        passRate
      });
    }

    return trends;
  }

  // Analyze student performance to identify weak areas and strengths
  private analyzeStudentPerformance(quiz: IQuiz, attempts: IQuizAttempt[]) {
    const questionPerformance = new Map<string, { correct: number; total: number }>();

    // Aggregate performance across all attempts
    attempts.forEach(attempt => {
      attempt.answers.forEach(answer => {
        if (!questionPerformance.has(answer.questionId)) {
          questionPerformance.set(answer.questionId, { correct: 0, total: 0 });
        }
        const perf = questionPerformance.get(answer.questionId)!;
        perf.total++;
        if (answer.isCorrect) perf.correct++;
      });
    });

    const weakAreas: string[] = [];
    const strengths: string[] = [];

    quiz.questions.forEach((question, index) => {
      const perf = questionPerformance.get(question.id);
      if (perf) {
        const correctRate = (perf.correct / perf.total) * 100;
        const questionLabel = `Question ${index + 1}`;
        
        if (correctRate < 50) {
          weakAreas.push(questionLabel);
        } else if (correctRate >= 80) {
          strengths.push(questionLabel);
        }
      }
    });

    return { weakAreas, strengths };
  }
}

export default new QuizAnalyticsService();

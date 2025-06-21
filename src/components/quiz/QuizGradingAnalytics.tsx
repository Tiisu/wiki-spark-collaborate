import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizAttempt {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  score: number;
  rawScore?: number;
  totalPoints: number;
  earnedPoints: number;
  totalWeightedPoints?: number;
  earnedWeightedPoints?: number;
  passed: boolean;
  timeSpent: number;
  attemptNumber: number;
  answers: Array<{
    questionId: string;
    userAnswer: string | string[];
    isCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
    weight?: number;
    weightedPointsEarned?: number;
    partialCredit?: number;
  }>;
  createdAt: string;
}

interface QuizGradingAnalyticsProps {
  attempts: QuizAttempt[];
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    questions: Array<{
      id: string;
      question: string;
      type: string;
      points: number;
      weight?: number;
      difficulty?: string;
    }>;
  };
  className?: string;
}

export function QuizGradingAnalytics({ attempts, quiz, className }: QuizGradingAnalyticsProps) {
  // Calculate overall statistics
  const totalAttempts = attempts.length;
  const uniqueStudents = new Set(attempts.map(a => a.user.id)).size;
  const passedAttempts = attempts.filter(a => a.passed).length;
  const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;
  
  const averageScore = totalAttempts > 0 
    ? attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts 
    : 0;
  
  const averageTime = totalAttempts > 0
    ? attempts.reduce((sum, a) => sum + a.timeSpent, 0) / totalAttempts
    : 0;

  // Question-level analytics
  const questionAnalytics = quiz.questions.map(question => {
    const questionAttempts = attempts.flatMap(attempt => 
      attempt.answers.filter(answer => answer.questionId === question.id)
    );
    
    const correctCount = questionAttempts.filter(a => a.isCorrect).length;
    const partialCreditCount = questionAttempts.filter(a => a.partialCredit && a.partialCredit > 0 && a.partialCredit < 1).length;
    const totalAttempts = questionAttempts.length;
    
    const correctRate = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
    const averagePoints = totalAttempts > 0 
      ? questionAttempts.reduce((sum, a) => sum + a.pointsEarned, 0) / totalAttempts 
      : 0;
    
    return {
      ...question,
      correctCount,
      partialCreditCount,
      totalAttempts,
      correctRate,
      averagePoints,
      difficulty: correctRate > 80 ? 'easy' : correctRate > 50 ? 'medium' : 'hard'
    };
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{uniqueStudents}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{totalAttempts}</p>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{passRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{formatTime(averageTime)}</p>
                <p className="text-sm text-muted-foreground">Avg. Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Score Distribution</span>
          </CardTitle>
          <CardDescription>
            Average score: {averageScore.toFixed(1)}% | Passing score: {quiz.passingScore}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Performance</span>
              <Badge className={averageScore >= quiz.passingScore ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {averageScore >= quiz.passingScore ? 'Above Passing' : 'Below Passing'}
              </Badge>
            </div>
            <Progress value={averageScore} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span className="font-medium">Passing: {quiz.passingScore}%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question-Level Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Question Performance</span>
          </CardTitle>
          <CardDescription>
            Detailed breakdown of performance by question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionAnalytics.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Question {index + 1}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {question.question}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    {question.weight && question.weight !== 1 && (
                      <Badge variant="outline">
                        Weight: {question.weight}x
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Correct Rate</span>
                      <span className="text-sm">{question.correctRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={question.correctRate} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avg. Points</span>
                      <span className="text-sm">
                        {question.averagePoints.toFixed(1)} / {question.points}
                      </span>
                    </div>
                    <Progress 
                      value={(question.averagePoints / question.points) * 100} 
                      className="h-2" 
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{question.correctCount} correct</span>
                    </div>
                    {question.partialCreditCount > 0 && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">{question.partialCreditCount} partial</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questionAnalytics
              .filter(q => q.correctRate < 50)
              .map((question, index) => (
                <div key={question.id} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Question {questionAnalytics.indexOf(question) + 1} needs attention</p>
                    <p className="text-sm text-muted-foreground">
                      Only {question.correctRate.toFixed(1)}% of students answered correctly. 
                      Consider reviewing the question or providing additional instruction on this topic.
                    </p>
                  </div>
                </div>
              ))}
            
            {passRate < 70 && (
              <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Low overall pass rate</p>
                  <p className="text-sm text-muted-foreground">
                    Consider reviewing the quiz difficulty or providing additional study materials.
                  </p>
                </div>
              </div>
            )}
            
            {questionAnalytics.filter(q => q.correctRate < 50).length === 0 && passRate >= 70 && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Quiz performing well</p>
                  <p className="text-sm text-muted-foreground">
                    Students are performing well on this quiz. Good job!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target, 
  Clock, 
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  timeSpent: number;
  attemptNumber: number;
  createdAt: string;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
    partialCredit?: number;
  }>;
}

interface QuizProgressTrackingProps {
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    questions: Array<{
      id: string;
      question: string;
      points: number;
      difficulty?: string;
    }>;
  };
  attempts: QuizAttempt[];
  className?: string;
}

export function QuizProgressTracking({ quiz, attempts, className }: QuizProgressTrackingProps) {
  const completedAttempts = attempts.filter(a => a.score !== undefined);
  
  if (completedAttempts.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No quiz attempts yet</p>
            <p className="text-sm">Complete the quiz to see your progress analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate statistics
  const scores = completedAttempts.map(a => a.score);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const bestScore = Math.max(...scores);
  const latestScore = scores[scores.length - 1];
  const improvementTrend = scores.length > 1 ? latestScore - scores[scores.length - 2] : 0;
  
  const averageTime = completedAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / completedAttempts.length;
  const bestTime = Math.min(...completedAttempts.map(a => a.timeSpent));
  
  const passedAttempts = completedAttempts.filter(a => a.passed).length;
  const passRate = (passedAttempts / completedAttempts.length) * 100;

  // Question-level analytics
  const questionStats = quiz.questions.map(question => {
    const questionAttempts = completedAttempts.flatMap(attempt => 
      attempt.answers.filter(answer => answer.questionId === question.id)
    );
    
    const correctCount = questionAttempts.filter(a => a.isCorrect).length;
    const totalAttempts = questionAttempts.length;
    const correctRate = totalAttempts > 0 ? (correctCount / totalAttempts) * 100 : 0;
    
    const averagePoints = totalAttempts > 0 
      ? questionAttempts.reduce((sum, a) => sum + a.pointsEarned, 0) / totalAttempts 
      : 0;

    return {
      ...question,
      correctCount,
      totalAttempts,
      correctRate,
      averagePoints,
      trend: questionAttempts.length > 1 ? 
        (questionAttempts[questionAttempts.length - 1].isCorrect ? 'up' : 'down') : 'stable'
    };
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Score</p>
                <p className="text-2xl font-bold">{bestScore}%</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{averageScore.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Best Time</p>
                <p className="text-2xl font-bold">{formatTime(bestTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold">{passRate.toFixed(0)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Score Progress</span>
          </CardTitle>
          <CardDescription>
            Your performance across all attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Latest Trend</span>
              <div className={cn("flex items-center space-x-1", getTrendColor(improvementTrend))}>
                {getTrendIcon(improvementTrend)}
                <span className="text-sm font-medium">
                  {improvementTrend > 0 ? '+' : ''}{improvementTrend.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Passing Score</span>
                <span>{Math.min(100, (latestScore / quiz.passingScore) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(100, (latestScore / quiz.passingScore) * 100)} 
                className="h-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{completedAttempts.length}</p>
                <p className="text-xs text-muted-foreground">Total Attempts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{passedAttempts}</p>
                <p className="text-xs text-muted-foreground">Passed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{formatTime(averageTime)}</p>
                <p className="text-xs text-muted-foreground">Avg. Time</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Question Performance</span>
          </CardTitle>
          <CardDescription>
            Your performance on individual questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionStats.map((question, index) => (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Question {index + 1}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {question.question}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {question.difficulty && (
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {question.points} pts
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm">{question.correctRate.toFixed(0)}%</span>
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
                      {question.correctRate >= 80 ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm">
                        {question.correctCount} / {question.totalAttempts} correct
                      </span>
                    </div>
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
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questionStats
              .filter(q => q.correctRate < 60)
              .map((question, index) => (
                <div key={question.id} className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Focus on Question {questionStats.indexOf(question) + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      You've answered this correctly {question.correctRate.toFixed(0)}% of the time. 
                      Review the topic and try again.
                    </p>
                  </div>
                </div>
              ))}
            
            {latestScore < quiz.passingScore && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Keep practicing!</p>
                  <p className="text-sm text-muted-foreground">
                    You need {quiz.passingScore - latestScore}% more to pass. 
                    Focus on the questions you're struggling with.
                  </p>
                </div>
              </div>
            )}
            
            {questionStats.filter(q => q.correctRate < 60).length === 0 && latestScore >= quiz.passingScore && (
              <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Great job!</p>
                  <p className="text-sm text-muted-foreground">
                    You're performing well on this quiz. Keep up the good work!
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

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  Target, 
  RotateCcw, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Trophy,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  timeSpent: number;
  attemptNumber: number;
  createdAt: string;
  completedAt?: string;
}

interface QuizAttemptStatusProps {
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    maxAttempts?: number;
    timeLimit?: number;
  };
  attempts: QuizAttempt[];
  canRetake: boolean;
  onStartQuiz: () => void;
  onRetakeQuiz?: () => void;
  className?: string;
}

export function QuizAttemptStatus({
  quiz,
  attempts,
  canRetake,
  onStartQuiz,
  onRetakeQuiz,
  className
}: QuizAttemptStatusProps) {
  const completedAttempts = attempts.filter(a => a.completedAt);
  const bestAttempt = completedAttempts.reduce((best, current) => 
    current.score > (best?.score || 0) ? current : best, 
    null as QuizAttempt | null
  );
  const latestAttempt = completedAttempts[completedAttempts.length - 1];
  const hasPassedAttempt = completedAttempts.some(a => a.passed);
  
  const attemptsUsed = completedAttempts.length;
  const attemptsRemaining = quiz.maxAttempts ? quiz.maxAttempts - attemptsUsed : null;
  const canTakeQuiz = !quiz.maxAttempts || attemptsUsed < quiz.maxAttempts;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAttemptStatusIcon = (attempt: QuizAttempt) => {
    if (attempt.passed) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getAttemptStatusColor = (attempt: QuizAttempt) => {
    if (attempt.passed) {
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    }
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Quiz Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <CardDescription className="flex items-center space-x-4 mt-2">
                <span className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>Passing Score: {quiz.passingScore}%</span>
                </span>
                {quiz.timeLimit && (
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Time Limit: {quiz.timeLimit} minutes</span>
                  </span>
                )}
                {quiz.maxAttempts && (
                  <span className="flex items-center space-x-1">
                    <RotateCcw className="h-4 w-4" />
                    <span>Max Attempts: {quiz.maxAttempts}</span>
                  </span>
                )}
              </CardDescription>
            </div>
            
            {hasPassedAttempt && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <Trophy className="h-3 w-3 mr-1" />
                Passed
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Attempt Progress */}
          {quiz.maxAttempts && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attempts Used</span>
                <span>{attemptsUsed} of {quiz.maxAttempts}</span>
              </div>
              <Progress 
                value={(attemptsUsed / quiz.maxAttempts) * 100} 
                className="h-2"
              />
              {attemptsRemaining !== null && (
                <p className="text-xs text-muted-foreground">
                  {attemptsRemaining > 0 
                    ? `${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining`
                    : 'No attempts remaining'
                  }
                </p>
              )}
            </div>
          )}

          {/* Best Score */}
          {bestAttempt && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Best Score</p>
                <p className="text-xs text-muted-foreground">
                  Attempt {bestAttempt.attemptNumber} • {formatDate(bestAttempt.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-2xl font-bold",
                  bestAttempt.passed ? "text-green-600" : "text-red-600"
                )}>
                  {bestAttempt.score}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTime(bestAttempt.timeSpent)}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {completedAttempts.length === 0 ? (
              <Button onClick={onStartQuiz} className="flex items-center space-x-2">
                <span>Start Quiz</span>
              </Button>
            ) : canTakeQuiz && canRetake ? (
              <Button onClick={onRetakeQuiz} className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
                <span>Retake Quiz</span>
              </Button>
            ) : !canTakeQuiz ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have used all available attempts for this quiz.
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Attempt History */}
      {completedAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attempt History</CardTitle>
            <CardDescription>
              Your previous quiz attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getAttemptStatusIcon(attempt)}
                    <div>
                      <p className="font-medium text-sm">
                        Attempt {attempt.attemptNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(attempt.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className={cn(
                        "font-bold",
                        attempt.passed ? "text-green-600" : "text-red-600"
                      )}>
                        {attempt.score}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(attempt.timeSpent)}
                      </p>
                    </div>
                    
                    <Badge className={getAttemptStatusColor(attempt)}>
                      {attempt.passed ? 'Passed' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings and Information */}
      {!hasPassedAttempt && attemptsRemaining === 1 && (
        <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            <strong>Last attempt!</strong> This is your final chance to pass this quiz.
          </AlertDescription>
        </Alert>
      )}

      {!hasPassedAttempt && !canTakeQuiz && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>No more attempts available.</strong> You have used all {quiz.maxAttempts} attempts for this quiz. 
            Contact your instructor if you need additional attempts.
          </AlertDescription>
        </Alert>
      )}

      {hasPassedAttempt && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Congratulations!</strong> You have successfully passed this quiz with a score of {bestAttempt?.score}%.
            {canRetake && " You can retake the quiz to improve your score."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

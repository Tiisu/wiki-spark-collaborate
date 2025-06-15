import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Target, 
  CheckCircle, 
  Play, 
  RotateCcw,
  AlertTriangle,
  Trophy
} from 'lucide-react';
import { Quiz, QuizAttempt } from '@/lib/api';

interface QuizCardProps {
  quiz: Quiz;
  attempts?: QuizAttempt[];
  onStart: () => void;
  onViewResults?: (attempt: QuizAttempt) => void;
  className?: string;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  attempts = [],
  onStart,
  onViewResults,
  className = ''
}) => {
  const bestAttempt = attempts.length > 0 
    ? attempts.reduce((best, current) => 
        current.score > best.score ? current : best
      )
    : null;

  const hasPassedAttempt = attempts.some(attempt => attempt.passed);
  const canRetake = !quiz.maxAttempts || attempts.length < quiz.maxAttempts;
  const isCompleted = hasPassedAttempt;

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    }
    if (attempts.length > 0) {
      return <Badge variant="secondary">In Progress</Badge>;
    }
    if (quiz.isRequired) {
      return <Badge variant="destructive">Required</Badge>;
    }
    return <Badge variant="outline">Optional</Badge>;
  };

  const getActionButton = () => {
    if (attempts.length === 0) {
      return (
        <Button onClick={onStart} className="w-full">
          <Play className="h-4 w-4 mr-2" />
          Start Quiz
        </Button>
      );
    }

    if (isCompleted) {
      return (
        <div className="space-y-2">
          {bestAttempt && onViewResults && (
            <Button 
              variant="outline" 
              onClick={() => onViewResults(bestAttempt)}
              className="w-full"
            >
              View Results
            </Button>
          )}
          {canRetake && (
            <Button variant="outline" onClick={onStart} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {bestAttempt && onViewResults && (
          <Button 
            variant="outline" 
            onClick={() => onViewResults(bestAttempt)}
            className="w-full"
          >
            View Last Attempt
          </Button>
        )}
        {canRetake ? (
          <Button onClick={onStart} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        ) : (
          <Button disabled className="w-full">
            Max Attempts Reached
          </Button>
        )}
      </div>
    );
  };

  return (
    <Card className={`relative ${className}`}>
      {isCompleted && (
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            {quiz.description && (
              <CardDescription className="mt-1">
                {quiz.description}
              </CardDescription>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-2">
          {getStatusBadge()}
          {quiz.isRequired && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Required
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quiz Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span>{quiz.questions.length} questions</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span>{quiz.passingScore}% to pass</span>
          </div>
          {quiz.timeLimit && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{quiz.timeLimit} minutes</span>
            </div>
          )}
          {quiz.maxAttempts && (
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <span>{attempts.length}/{quiz.maxAttempts} attempts</span>
            </div>
          )}
        </div>

        {/* Progress/Results */}
        {bestAttempt && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Best Score</span>
              <span className={`font-medium ${
                bestAttempt.passed ? 'text-green-600' : 'text-red-600'
              }`}>
                {bestAttempt.score}%
              </span>
            </div>
            <Progress 
              value={bestAttempt.score} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {bestAttempt.passed ? 'Passed' : 'Failed'} • 
              Attempt #{bestAttempt.attemptNumber} • 
              {new Date(bestAttempt.completedAt || bestAttempt.createdAt).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Attempts Summary */}
        {attempts.length > 1 && (
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Attempts: {attempts.length}</span>
              <span>
                Passed: {attempts.filter(a => a.passed).length}
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        {getActionButton()}

        {/* Quiz Features */}
        <div className="flex flex-wrap gap-1 text-xs">
          {quiz.showCorrectAnswers && (
            <Badge variant="outline" className="text-xs">
              Shows Answers
            </Badge>
          )}
          {quiz.showScoreImmediately && (
            <Badge variant="outline" className="text-xs">
              Instant Results
            </Badge>
          )}
          {!quiz.timeLimit && (
            <Badge variant="outline" className="text-xs">
              Untimed
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

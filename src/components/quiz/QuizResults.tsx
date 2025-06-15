import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  Target, 
  RotateCcw,
  Download,
  Share2
} from 'lucide-react';
import { QuizAttempt, Quiz } from '@/lib/api';

interface QuizResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetake?: () => void;
  onContinue: () => void;
  canRetake?: boolean;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  quiz,
  attempt,
  onRetake,
  onContinue,
  canRetake = false
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  const getPerformanceMessage = (score: number, passed: boolean): string => {
    if (score === 100) return "Perfect! You got every question right! 🎉";
    if (score >= 90) return "Excellent work! You've mastered this topic! 🌟";
    if (score >= 80) return "Great job! You have a strong understanding! 👏";
    if (passed) return "Well done! You passed the quiz! ✅";
    return "Keep studying and try again! You can do it! 💪";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Results Header */}
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            {attempt.passed ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">
            {attempt.passed ? 'Congratulations!' : 'Quiz Complete'}
          </CardTitle>
          <CardDescription className="text-lg">
            {getPerformanceMessage(attempt.score, attempt.passed)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-4xl font-bold">
              <span className={getScoreColor(attempt.score)}>
                {attempt.score}%
              </span>
            </div>
            <Badge 
              variant={getScoreBadgeVariant(attempt.score)}
              className="text-lg px-4 py-2"
            >
              {attempt.passed ? 'PASSED' : 'NOT PASSED'}
            </Badge>
            <div className="text-sm text-muted-foreground">
              Passing score: {quiz.passingScore}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {attempt.earnedPoints}
              </div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">
                {attempt.totalPoints}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold flex items-center justify-center">
                <Clock className="h-5 w-5 mr-2" />
                {formatTime(attempt.timeSpent)}
              </div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{attempt.earnedPoints} / {attempt.totalPoints} points</span>
            </div>
            <Progress value={(attempt.earnedPoints / attempt.totalPoints) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      {quiz.showCorrectAnswers && (
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>
              Review your answers and see the correct solutions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = attempt.answers.find(a => a.questionId === question.id);
              const isCorrect = userAnswer?.isCorrect || false;
              
              return (
                <div key={question.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline">Question {index + 1}</Badge>
                        <Badge variant={isCorrect ? "default" : "destructive"}>
                          {question.points} points
                        </Badge>
                        {isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="font-medium mb-2">{question.question}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Your answer: </span>
                      <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                        {Array.isArray(userAnswer?.userAnswer) 
                          ? userAnswer.userAnswer.join(', ')
                          : userAnswer?.userAnswer || 'No answer'
                        }
                      </span>
                    </div>
                    
                    {!isCorrect && (
                      <div>
                        <span className="font-medium">Correct answer: </span>
                        <span className="text-green-600">
                          {Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.join(', ')
                            : question.correctAnswer
                          }
                        </span>
                      </div>
                    )}
                    
                    {question.explanation && (
                      <div className="bg-muted p-3 rounded">
                        <span className="font-medium">Explanation: </span>
                        {question.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quiz Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">#{attempt.attemptNumber}</div>
              <div className="text-sm text-muted-foreground">Attempt</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {attempt.answers.filter(a => a.isCorrect).length}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {attempt.answers.filter(a => !a.isCorrect).length}
              </div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{quiz.questions.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {canRetake && onRetake && (
          <Button variant="outline" onClick={onRetake} className="flex items-center">
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        )}
        
        <Button onClick={onContinue} className="flex items-center">
          Continue Learning
        </Button>
        
        <Button variant="outline" className="flex items-center">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
      </div>

      {/* Next Steps */}
      {attempt.passed && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-green-800 font-medium">
                🎉 Great job! You've completed this quiz successfully.
              </div>
              <div className="text-green-700 text-sm">
                Continue to the next lesson to keep building your Wikipedia skills!
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

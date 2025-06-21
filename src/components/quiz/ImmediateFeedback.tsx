import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  ArrowRight,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizQuestion } from './QuizQuestion';

interface ImmediateFeedbackProps {
  question: QuizQuestion;
  userAnswer: string | string[];
  isCorrect: boolean;
  showExplanation?: boolean;
  onContinue: () => void;
  onShowExplanation?: () => void;
  timeSpent?: number;
  className?: string;
}

export function ImmediateFeedback({
  question,
  userAnswer,
  isCorrect,
  showExplanation = true,
  onContinue,
  onShowExplanation,
  timeSpent,
  className
}: ImmediateFeedbackProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getFeedbackMessage = () => {
    switch (question.type) {
      case 'ESSAY':
        return {
          title: 'Essay Submitted',
          message: 'Your essay has been submitted for manual review by the instructor.',
          icon: HelpCircle,
          color: 'blue'
        };
      case 'MATCHING':
      case 'ORDERING':
        return {
          title: 'Answer Submitted',
          message: 'Your answer has been submitted for manual review by the instructor.',
          icon: HelpCircle,
          color: 'blue'
        };
      default:
        if (isCorrect) {
          return {
            title: 'Correct!',
            message: 'Well done! You got this question right.',
            icon: CheckCircle,
            color: 'green'
          };
        } else {
          return {
            title: 'Incorrect',
            message: 'That\'s not quite right. Review the explanation below.',
            icon: XCircle,
            color: 'red'
          };
        }
    }
  };

  const feedback = getFeedbackMessage();
  const IconComponent = feedback.icon;

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6 space-y-4">
        {/* Feedback Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              feedback.color === 'green' && "bg-green-100 dark:bg-green-900/20",
              feedback.color === 'red' && "bg-red-100 dark:bg-red-900/20",
              feedback.color === 'blue' && "bg-blue-100 dark:bg-blue-900/20"
            )}>
              <IconComponent className={cn(
                "h-5 w-5",
                feedback.color === 'green' && "text-green-600 dark:text-green-400",
                feedback.color === 'red' && "text-red-600 dark:text-red-400",
                feedback.color === 'blue' && "text-blue-600 dark:text-blue-400"
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{feedback.title}</h3>
              <p className="text-sm text-muted-foreground">{feedback.message}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={cn(
              feedback.color === 'green' && "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
              feedback.color === 'red' && "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
              feedback.color === 'blue' && "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
            )}>
              {question.points} point{question.points !== 1 ? 's' : ''}
            </Badge>
            {timeSpent && (
              <Badge variant="outline" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{formatTime(timeSpent)}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Your Answer */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Your Answer:</h4>
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            {Array.isArray(userAnswer) ? (
              <ul className="list-disc list-inside space-y-1">
                {userAnswer.map((answer, index) => (
                  <li key={index} className="text-sm">{answer}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">{userAnswer || 'No answer provided'}</p>
            )}
          </div>
        </div>

        {/* Correct Answer (for auto-graded questions) */}
        {question.type !== 'ESSAY' && question.type !== 'MATCHING' && question.type !== 'ORDERING' && !isCorrect && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Correct Answer:</h4>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              {Array.isArray(question.correctAnswer) ? (
                <ul className="list-disc list-inside space-y-1">
                  {question.correctAnswer.map((answer, index) => (
                    <li key={index} className="text-sm text-green-800 dark:text-green-200">{answer}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-800 dark:text-green-200">{question.correctAnswer}</p>
              )}
            </div>
          </div>
        )}

        {/* Keywords for Short Answer */}
        {question.type === 'SHORT_ANSWER' && question.keywords && question.keywords.length > 0 && !isCorrect && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Key Terms:</h4>
            <div className="flex flex-wrap gap-2">
              {question.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && question.explanation && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Explanation:</h4>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-2">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800 dark:text-blue-200">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rubric for Essay Questions */}
        {question.type === 'ESSAY' && question.rubric && question.rubric.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Grading Rubric:</h4>
            <div className="space-y-2">
              {question.rubric.map((criterion, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{criterion.criteria}</h5>
                      {criterion.description && (
                        <p className="text-xs text-muted-foreground mt-1">{criterion.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {criterion.points} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={onContinue} className="flex items-center space-x-2">
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

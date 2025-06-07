import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'multiple_select';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
}

interface QuizQuestionProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  userAnswer?: string | string[];
  onAnswerChange: (questionId: string, answer: string | string[]) => void;
  showResult?: boolean;
  isCorrect?: boolean;
  className?: string;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswerChange,
  showResult = false,
  isCorrect,
  className
}: QuizQuestionProps) {
  const [localAnswer, setLocalAnswer] = useState<string | string[]>(userAnswer || '');

  const handleAnswerChange = (answer: string | string[]) => {
    setLocalAnswer(answer);
    onAnswerChange(question.id, answer);
  };

  const handleMultipleChoiceChange = (value: string) => {
    handleAnswerChange(value);
  };

  const handleMultipleSelectChange = (option: string, checked: boolean) => {
    const currentAnswers = Array.isArray(localAnswer) ? localAnswer : [];
    let newAnswers: string[];
    
    if (checked) {
      newAnswers = [...currentAnswers, option];
    } else {
      newAnswers = currentAnswers.filter(answer => answer !== option);
    }
    
    handleAnswerChange(newAnswers);
  };

  const handleShortAnswerChange = (value: string) => {
    handleAnswerChange(value);
  };

  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <RadioGroup
            value={typeof localAnswer === 'string' ? localAnswer : ''}
            onValueChange={handleMultipleChoiceChange}
            disabled={showResult}
            className="space-y-3"
          >
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label 
                  htmlFor={`${question.id}-${index}`}
                  className={cn(
                    "flex-1 cursor-pointer",
                    showResult && {
                      "text-green-600 font-medium": Array.isArray(question.correctAnswer) 
                        ? question.correctAnswer.includes(option)
                        : question.correctAnswer === option,
                      "text-red-600": localAnswer === option && !isCorrect
                    }
                  )}
                >
                  {option}
                  {showResult && (Array.isArray(question.correctAnswer) 
                    ? question.correctAnswer.includes(option)
                    : question.correctAnswer === option) && (
                    <CheckCircle className="inline h-4 w-4 ml-2 text-green-600" />
                  )}
                  {showResult && localAnswer === option && !isCorrect && (
                    <XCircle className="inline h-4 w-4 ml-2 text-red-600" />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multiple_select':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${index}`}
                  checked={Array.isArray(localAnswer) && localAnswer.includes(option)}
                  onCheckedChange={(checked) => handleMultipleSelectChange(option, checked as boolean)}
                  disabled={showResult}
                />
                <Label 
                  htmlFor={`${question.id}-${index}`}
                  className={cn(
                    "flex-1 cursor-pointer",
                    showResult && {
                      "text-green-600 font-medium": Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option),
                      "text-red-600": Array.isArray(localAnswer) && localAnswer.includes(option) && 
                        !(Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option))
                    }
                  )}
                >
                  {option}
                  {showResult && Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option) && (
                    <CheckCircle className="inline h-4 w-4 ml-2 text-green-600" />
                  )}
                </Label>
              </div>
            ))}
          </div>
        );

      case 'true_false':
        return (
          <RadioGroup
            value={typeof localAnswer === 'string' ? localAnswer : ''}
            onValueChange={handleMultipleChoiceChange}
            disabled={showResult}
            className="space-y-3"
          >
            {['True', 'False'].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label 
                  htmlFor={`${question.id}-${option}`}
                  className={cn(
                    "flex-1 cursor-pointer",
                    showResult && {
                      "text-green-600 font-medium": question.correctAnswer === option,
                      "text-red-600": localAnswer === option && !isCorrect
                    }
                  )}
                >
                  {option}
                  {showResult && question.correctAnswer === option && (
                    <CheckCircle className="inline h-4 w-4 ml-2 text-green-600" />
                  )}
                  {showResult && localAnswer === option && !isCorrect && (
                    <XCircle className="inline h-4 w-4 ml-2 text-red-600" />
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'short_answer':
        return (
          <div className="space-y-3">
            <Textarea
              value={typeof localAnswer === 'string' ? localAnswer : ''}
              onChange={(e) => handleShortAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              disabled={showResult}
              className={cn(
                showResult && {
                  "border-green-500": isCorrect,
                  "border-red-500": !isCorrect
                }
              )}
              rows={3}
            />
            {showResult && (
              <div className="text-sm text-muted-foreground">
                <strong>Correct answer:</strong> {question.correctAnswer}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                Question {questionNumber} of {totalQuestions}
              </Badge>
              <Badge variant="secondary">
                {question.points} point{question.points !== 1 ? 's' : ''}
              </Badge>
              {showResult && (
                <Badge className={isCorrect ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}>
                  {isCorrect ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Incorrect
                    </>
                  )}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-relaxed">
              {question.question}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {renderQuestionContent()}
        
        {/* Explanation (shown after answering) */}
        {showResult && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-2">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Explanation</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">{question.explanation}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

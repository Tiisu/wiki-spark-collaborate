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
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'MATCHING' | 'ORDERING' | 'SHORT_ANSWER' | 'ESSAY';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;

  // Additional fields for new question types
  maxLength?: number;
  minLength?: number;
  keywords?: string[];
  rubric?: {
    criteria: string;
    points: number;
    description: string;
  }[];
  caseSensitive?: boolean;
  allowPartialCredit?: boolean;
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
      case 'MULTIPLE_CHOICE':
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

      case 'FILL_IN_BLANK':
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

      case 'TRUE_FALSE':
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

      case 'SHORT_ANSWER':
        return (
          <div className="space-y-3">
            <Input
              value={typeof localAnswer === 'string' ? localAnswer : ''}
              onChange={(e) => handleShortAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              disabled={showResult}
              maxLength={question.maxLength}
              className={cn(
                showResult && {
                  "border-green-500": isCorrect,
                  "border-red-500": !isCorrect
                }
              )}
            />
            {question.maxLength && (
              <div className="text-xs text-muted-foreground">
                {typeof localAnswer === 'string' ? localAnswer.length : 0} / {question.maxLength} characters
              </div>
            )}
            {showResult && (
              <div className="text-sm text-muted-foreground">
                <strong>Expected answer:</strong> {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                {question.keywords && question.keywords.length > 0 && (
                  <div className="mt-1">
                    <strong>Key terms:</strong> {question.keywords.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'ESSAY':
        return (
          <div className="space-y-3">
            <Textarea
              value={typeof localAnswer === 'string' ? localAnswer : ''}
              onChange={(e) => handleShortAnswerChange(e.target.value)}
              placeholder="Write your essay response here..."
              disabled={showResult}
              maxLength={question.maxLength}
              className={cn(
                "min-h-[200px]",
                showResult && {
                  "border-green-500": isCorrect,
                  "border-red-500": !isCorrect
                }
              )}
              rows={8}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <div>
                {question.minLength && (
                  <span>Minimum {question.minLength} characters required</span>
                )}
              </div>
              <div>
                {typeof localAnswer === 'string' ? localAnswer.length : 0}
                {question.maxLength && ` / ${question.maxLength}`} characters
              </div>
            </div>
            {showResult && question.rubric && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border">
                <h4 className="font-medium mb-2">Grading Rubric:</h4>
                <div className="space-y-2">
                  {question.rubric.map((criterion, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{criterion.criteria}</span>
                        <span>{criterion.points} points</span>
                      </div>
                      {criterion.description && (
                        <p className="text-muted-foreground mt-1">{criterion.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'MATCHING':
        // For matching questions, options should be pairs
        const pairs = question.options || [];
        const leftItems = pairs.filter((_, index) => index % 2 === 0);
        const rightItems = pairs.filter((_, index) => index % 2 === 1);

        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Match the items from the left column with the correct items from the right column.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Column A</h4>
                {leftItems.map((item, index) => (
                  <div key={index} className="p-2 border rounded bg-gray-50 dark:bg-gray-900">
                    {item}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Column B</h4>
                {rightItems.map((item, index) => (
                  <div key={index} className="p-2 border rounded bg-gray-50 dark:bg-gray-900">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Note: Matching questions require manual grading by the instructor.
            </div>
          </div>
        );

      case 'ORDERING':
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Arrange the following items in the correct order.</p>
            <div className="space-y-2">
              {question.options?.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                  <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Note: Ordering questions require manual grading by the instructor.
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-muted-foreground py-8">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Unsupported question type: {question.type}</p>
          </div>
        );
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

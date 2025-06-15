import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Quiz, QuizQuestion, quizApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (attempt: any) => void;
  onExit: () => void;
}

interface UserAnswer {
  questionId: string;
  userAnswer: string | string[];
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onComplete, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [startTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  // Timer effect
  useEffect(() => {
    if (!timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get current user answer
  const getCurrentAnswer = (): string | string[] => {
    const answer = userAnswers.find(a => a.questionId === currentQuestion.id);
    return answer?.userAnswer || (currentQuestion.type === 'MULTIPLE_CHOICE' ? '' : []);
  };

  // Update user answer
  const updateAnswer = (answer: string | string[]) => {
    setUserAnswers(prev => {
      const existing = prev.find(a => a.questionId === currentQuestion.id);
      if (existing) {
        return prev.map(a => 
          a.questionId === currentQuestion.id 
            ? { ...a, userAnswer: answer }
            : a
        );
      } else {
        return [...prev, { questionId: currentQuestion.id, userAnswer: answer }];
      }
    });
  };

  // Handle single choice answer
  const handleSingleChoice = (value: string) => {
    updateAnswer(value);
  };

  // Handle multiple choice answer
  const handleMultipleChoice = (option: string, checked: boolean) => {
    const currentAnswers = getCurrentAnswer() as string[];
    if (checked) {
      updateAnswer([...currentAnswers, option]);
    } else {
      updateAnswer(currentAnswers.filter(a => a !== option));
    }
  };

  // Handle text input
  const handleTextInput = (value: string) => {
    updateAnswer(value);
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Submit quiz
  const handleSubmitQuiz = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
      const attempt = await quizApi.submitQuiz(quiz._id, userAnswers, timeSpent);
      
      toast({
        title: "Quiz Submitted!",
        description: `You scored ${attempt.score}%`,
      });

      onComplete(attempt);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = () => {
    const answer = getCurrentAnswer();
    if (Array.isArray(answer)) {
      return answer.length > 0;
    }
    return answer !== '';
  };

  // Render question based on type
  const renderQuestion = () => {
    const currentAnswer = getCurrentAnswer();

    switch (currentQuestion.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <RadioGroup 
            value={currentAnswer as string} 
            onValueChange={handleSingleChoice}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'TRUE_FALSE':
        return (
          <RadioGroup 
            value={currentAnswer as string} 
            onValueChange={handleSingleChoice}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="True" id="true" />
              <Label htmlFor="true" className="cursor-pointer">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="False" id="false" />
              <Label htmlFor="false" className="cursor-pointer">False</Label>
            </div>
          </RadioGroup>
        );

      case 'FILL_IN_BLANK':
        return (
          <Input
            value={currentAnswer as string}
            onChange={(e) => handleTextInput(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full"
          />
        );

      case 'MATCHING':
        return (
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  checked={(currentAnswer as string[]).includes(option)}
                  onCheckedChange={(checked) => handleMultipleChoice(option, checked as boolean)}
                  id={`match-${index}`}
                />
                <Label htmlFor={`match-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Question type not supported</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-4">
              {timeRemaining && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className={`font-mono ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              )}
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Current Question */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {currentQuestionIndex + 1}</span>
            <Badge variant="secondary">{currentQuestion.points} points</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">{currentQuestion.question}</div>
          {renderQuestion()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={onExit}>
            Exit Quiz
          </Button>
          
          {isLastQuestion ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={!isCurrentQuestionAnswered() || isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered()}
            >
              Next
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-10 gap-2">
            {quiz.questions.map((_, index) => {
              const isAnswered = userAnswers.some(a => a.questionId === quiz.questions[index].id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <Button
                  key={index}
                  variant={isCurrent ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`relative ${isAnswered ? 'bg-green-100 border-green-300' : ''}`}
                >
                  {index + 1}
                  {isAnswered && (
                    <CheckCircle className="h-3 w-3 absolute -top-1 -right-1 text-green-600" />
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { QuizQuestion, QuizQuestion as QuizQuestionComponent } from './QuizQuestion';
import { ImmediateFeedback } from './ImmediateFeedback';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
  lessonId: string;
  showCorrectAnswers?: boolean;
  showScoreImmediately?: boolean;
}

interface QuizAttempt {
  id: string;
  answers: Record<string, string | string[]>;
  score: number;
  passed: boolean;
  timeSpent: number;
  createdAt: string;
}

interface QuizWithFeedbackProps {
  quiz: Quiz;
  onComplete: (attempt: QuizAttempt) => void;
  onRetry?: () => void;
  previousAttempt?: QuizAttempt;
  className?: string;
}

export function QuizWithFeedback({ quiz, onComplete, onRetry, previousAttempt, className }: QuizWithFeedbackProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [startTime] = useState(Date.now());

  // Timer effect
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isSubmitted]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleAnswerSubmit = () => {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    
    setQuestionTimes(prev => ({
      ...prev,
      [currentQuestion.id]: timeSpent
    }));
    
    setShowFeedback(true);
  };

  const handleContinueFromFeedback = () => {
    setShowFeedback(false);
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    } else {
      handleSubmit();
    }
  };

  const calculateScore = () => {
    let totalPoints = 0;
    let earnedPoints = 0;

    quiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (isAnswerCorrect(question, userAnswer)) {
        earnedPoints += question.points;
      }
    });

    return Math.round((earnedPoints / totalPoints) * 100);
  };

  const isAnswerCorrect = (question: QuizQuestion, userAnswer: string | string[]) => {
    if (!userAnswer) return false;

    switch (question.type) {
      case 'FILL_IN_BLANK':
        const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
        
        return correctAnswers.length === userAnswers.length &&
               correctAnswers.every(answer => userAnswers.includes(answer));
      
      case 'SHORT_ANSWER':
        const correct = Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer;
        const user = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
        
        if (question.caseSensitive) {
          return user.trim() === correct.trim();
        } else {
          return user.toLowerCase().trim() === correct.toLowerCase().trim();
        }
      
      case 'ESSAY':
      case 'MATCHING':
      case 'ORDERING':
        // These require manual grading
        return false;
      
      default:
        const correctAnswer = Array.isArray(question.correctAnswer) ? question.correctAnswer[0] : question.correctAnswer;
        const userAnswerValue = Array.isArray(userAnswer) ? userAnswer[0] : userAnswer;
        
        return userAnswerValue === correctAnswer;
    }
  };

  const handleSubmit = () => {
    const score = calculateScore();
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    const passed = score >= quiz.passingScore;

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      answers,
      score,
      passed,
      timeSpent,
      createdAt: new Date().toISOString()
    };

    setQuizResult(attempt);
    setIsSubmitted(true);
    onComplete(attempt);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(questionId => {
      const answer = answers[questionId];
      return answer && (Array.isArray(answer) ? answer.length > 0 : answer.trim() !== '');
    }).length;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = getAnsweredCount();
  const progressPercentage = ((currentQuestionIndex + (showFeedback ? 1 : 0)) / quiz.questions.length) * 100;
  const hasAnswered = currentQuestion && answers[currentQuestion.id] && 
    (Array.isArray(answers[currentQuestion.id]) ? 
      (answers[currentQuestion.id] as string[]).length > 0 : 
      (answers[currentQuestion.id] as string).trim() !== '');

  // Show results if submitted
  if (isSubmitted && quizResult) {
    // Return the same results view as the original Quiz component
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="text-center">
          <div className="space-y-4">
            <div className={cn(
              "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
              quizResult.passed ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
            )}>
              {quizResult.passed ? (
                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
            </div>
            
            <div>
              <CardTitle className="text-2xl mb-2">
                {quizResult.passed ? 'Congratulations!' : 'Quiz Complete'}
              </CardTitle>
              <p className="text-muted-foreground">
                {quizResult.passed 
                  ? 'You have successfully passed the quiz!'
                  : `You need ${quiz.passingScore}% to pass. Try again to improve your score.`
                }
              </p>
            </div>

            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className={cn(
                  "text-3xl font-bold",
                  quizResult.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {quizResult.score}%
                </div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {formatTime(quizResult.timeSpent)}
                </div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              <Badge className={quizResult.passed ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}>
                {quizResult.passed ? 'Passed' : 'Failed'}
              </Badge>
              <Badge variant="outline">
                {answeredCount} of {quiz.questions.length} answered
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center space-x-4">
            {!quizResult.passed && onRetry && (
              <Button onClick={onRetry} className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
                <span>Retake Quiz</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show feedback for current question
  if (showFeedback && currentQuestion) {
    return (
      <ImmediateFeedback
        question={currentQuestion}
        userAnswer={answers[currentQuestion.id]}
        isCorrect={isAnswerCorrect(currentQuestion, answers[currentQuestion.id])}
        onContinue={handleContinueFromFeedback}
        timeSpent={questionTimes[currentQuestion.id]}
        className={className}
      />
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{quiz.title}</CardTitle>
            {timeRemaining !== null && (
              <Badge 
                variant={timeRemaining < 300 ? "destructive" : "outline"}
                className="flex items-center space-x-1"
              >
                <Clock className="h-3 w-3" />
                <span>{formatTime(timeRemaining)}</span>
              </Badge>
            )}
          </div>

          {quiz.description && (
            <p className="text-muted-foreground">{quiz.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Passing Score: {quiz.passingScore}%</span>
            <span>Immediate feedback enabled</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Question */}
        <QuizQuestionComponent
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={quiz.questions.length}
          userAnswer={answers[currentQuestion.id]}
          onAnswerChange={handleAnswerChange}
        />

        {/* Submit Answer Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleAnswerSubmit}
            disabled={!hasAnswered}
            className="flex items-center space-x-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Submit Answer</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

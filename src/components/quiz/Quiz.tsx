import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { QuizQuestion, QuizQuestion as QuizQuestionComponent } from './QuizQuestion';
import {
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  HelpCircle
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
}

interface QuizAttempt {
  id: string;
  answers: Record<string, string | string[]>;
  score: number;
  passed: boolean;
  timeSpent: number;
  createdAt: string;
}

interface QuizProps {
  quiz: Quiz;
  onComplete: (attempt: QuizAttempt) => void;
  onRetry?: () => void;
  previousAttempt?: QuizAttempt;
  className?: string;
}

export function Quiz({ quiz, onComplete, onRetry, previousAttempt, className }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [startTime, setStartTime] = useState(Date.now());

  // Reset quiz state when starting fresh (no previousAttempt)
  useEffect(() => {
    if (!previousAttempt) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : null);
      setIsSubmitted(false);
      setQuizResult(null);
      setStartTime(Date.now());
    }
  }, [previousAttempt, quiz.timeLimit]);

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

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : null);
    setIsSubmitted(false);
    setQuizResult(null);
    setStartTime(Date.now());
  };

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
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
        // Essays require manual grading, so we can't determine correctness automatically
        return false;

      case 'MATCHING':
      case 'ORDERING':
        // These require manual grading, so we can't determine correctness automatically
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

  const getAnsweredCount = (answersToCheck = answers) => {
    return Object.keys(answersToCheck).filter(questionId => {
      const answer = answersToCheck[questionId];
      return answer && (Array.isArray(answer) ? answer.length > 0 : answer.trim() !== '');
    }).length;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = getAnsweredCount();
  const progressPercentage = (answeredCount / quiz.questions.length) * 100;

  // Show results if submitted or if there's a previous attempt to review
  if (isSubmitted || previousAttempt) {
    const result = quizResult || previousAttempt!;
    
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="text-center">
          <div className="space-y-4">
            <div className={cn(
              "mx-auto w-16 h-16 rounded-full flex items-center justify-center",
              result.passed ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"
            )}>
              {result.passed ? (
                <Trophy className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
            </div>
            
            <div>
              <CardTitle className="text-2xl mb-2">
                {result.passed ? 'Congratulations!' : 'Quiz Complete'}
              </CardTitle>
              <p className="text-muted-foreground">
                {result.passed 
                  ? 'You have successfully passed the quiz!'
                  : `You need ${quiz.passingScore}% to pass. Try again to improve your score.`
                }
              </p>
            </div>

            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className={cn(
                  "text-3xl font-bold",
                  result.passed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {result.score}%
                </div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">
                  {formatTime(result.timeSpent)}
                </div>
                <div className="text-sm text-muted-foreground">Time Spent</div>
              </div>
            </div>

            <div className="flex justify-center space-x-2">
              <Badge className={result.passed ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}>
                {result.passed ? 'Passed' : 'Failed'}
              </Badge>
              <Badge variant="outline">
                {getAnsweredCount(result.answers)} of {quiz.questions.length} answered
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Review Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review Your Answers</h3>
            {quiz.questions.map((question, index) => (
              <QuizQuestionComponent
                key={question.id}
                question={question}
                questionNumber={index + 1}
                totalQuestions={quiz.questions.length}
                userAnswer={result.answers[question.id]}
                onAnswerChange={() => {}} // Read-only
                showResult={true}
                isCorrect={isAnswerCorrect(question, result.answers[question.id])}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            {!result.passed && onRetry && (
              <Button onClick={() => {
                resetQuiz();
                onRetry();
              }} className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
                <span>Retake Quiz</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-lg">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {quiz.title}
                </CardTitle>
                {quiz.description && (
                  <p className="text-muted-foreground mt-1">{quiz.description}</p>
                )}
              </div>
            </div>
            {timeRemaining !== null && (
              <div className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-xl font-mono text-lg font-semibold shadow-sm",
                timeRemaining <= 300
                  ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  : "bg-white/80 text-muted-foreground dark:bg-gray-800/80"
              )}>
                <Clock className="h-5 w-5" />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Quiz Progress</span>
              <span className="text-sm font-semibold text-foreground">
                {answeredCount} of {quiz.questions.length} completed
              </span>
            </div>
            <div className="relative">
              <Progress value={progressPercentage} className="h-3 bg-gray-200 dark:bg-gray-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white drop-shadow-sm">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Passing Score: {quiz.passingScore}%</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            </div>
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

        {/* Navigation */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-6 py-3 h-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-4">
            {/* Question indicators */}
            <div className="hidden md:flex items-center space-x-1">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full transition-all duration-200",
                    index === currentQuestionIndex
                      ? "bg-blue-500 scale-125"
                      : answers[quiz.questions[index].id]
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              ))}
            </div>

            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                disabled={!answers[currentQuestion.id] || answers[currentQuestion.id] === '' || (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)}
                className="flex items-center space-x-2 px-6 py-3 h-auto bg-blue-600 hover:bg-blue-700"
              >
                <span>Next Question</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-6 py-3 h-auto bg-green-600 hover:bg-green-700"
                disabled={answeredCount === 0}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Submit Quiz</span>
              </Button>
            )}
          </div>
        </div>

        {/* Warning for unanswered current question */}
        {currentQuestionIndex < quiz.questions.length - 1 && (!answers[currentQuestion.id] || answers[currentQuestion.id] === '' || (Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].length === 0)) && (
          <div className="flex items-start space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Answer Required</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Please answer this question before proceeding to the next one.
              </p>
            </div>
          </div>
        )}

        {/* Warning for unanswered questions at final question */}
        {currentQuestionIndex === quiz.questions.length - 1 && answeredCount < quiz.questions.length && (
          <div className="flex items-start space-x-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Incomplete Quiz</h4>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You have {quiz.questions.length - answeredCount} unanswered question{quiz.questions.length - answeredCount !== 1 ? 's' : ''}.
                You can still submit, but unanswered questions will be marked as incorrect.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

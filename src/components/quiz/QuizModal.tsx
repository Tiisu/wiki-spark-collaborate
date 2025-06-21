import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Quiz } from './Quiz';
import { QuizQuestion } from './QuizQuestion';
import { 
  BookOpen, 
  Clock, 
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface QuizData {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number;
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

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizData;
  lessonTitle: string;
  onQuizComplete: (attempt: QuizAttempt) => void;
  onProceedToNext?: () => void;
  previousAttempt?: QuizAttempt;
}

export function QuizModal({
  isOpen,
  onClose,
  quiz,
  lessonTitle,
  onQuizComplete,
  onProceedToNext,
  previousAttempt
}: QuizModalProps) {
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [showQuiz, setShowQuiz] = useState(!previousAttempt);
  const [showReview, setShowReview] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);

  const handleQuizComplete = (attempt: QuizAttempt) => {
    setCurrentAttempt(attempt);
    setIsRetaking(false);
    onQuizComplete(attempt);
  };

  const handleRetry = () => {
    setCurrentAttempt(null);
    setShowQuiz(true);
    setShowReview(false);
    setIsRetaking(true);
  };

  const handleReview = () => {
    setShowQuiz(false);
    setShowReview(true);
  };

  const handleProceed = () => {
    onClose();
    if (onProceedToNext) {
      onProceedToNext();
    }
  };

  const latestAttempt = currentAttempt || previousAttempt;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Quiz: {lessonTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quiz Introduction (shown before starting or if there's a previous attempt) */}
          {!showQuiz && (
            <div className="space-y-6">
              {/* Previous Attempt Summary */}
              {latestAttempt && (
                <div className="p-6 bg-muted/50 rounded-lg border">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Previous Attempt</h3>
                    <Badge className={latestAttempt.passed ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}>
                      {latestAttempt.passed ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Passed
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </>
                      )}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className={`text-2xl font-bold ${latestAttempt.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {latestAttempt.score}%
                      </div>
                      <div className="text-sm text-muted-foreground">Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {Math.floor(latestAttempt.timeSpent / 60)}:{(latestAttempt.timeSpent % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm text-muted-foreground">Time Spent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {quiz.passingScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Required</div>
                    </div>
                  </div>

                  {!latestAttempt.passed && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          You need {quiz.passingScore}% to pass this quiz. Review the lesson content and try again.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Quiz Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-muted-foreground">{quiz.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">{quiz.questions.length}</div>
                    <div className="text-sm text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">{quiz.passingScore}%</div>
                    <div className="text-sm text-muted-foreground">Passing Score</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">
                      {quiz.timeLimit ? `${quiz.timeLimit}m` : 'No Limit'}
                    </div>
                    <div className="text-sm text-muted-foreground">Time Limit</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-lg font-semibold text-foreground">
                      {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Points</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between">
                <div className="space-x-2">
                  {latestAttempt && latestAttempt.passed && onProceedToNext && (
                    <Button onClick={handleProceed} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>Continue to Next Lesson</span>
                    </Button>
                  )}
                </div>
                
                <div className="space-x-2">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  {latestAttempt && latestAttempt.passed && (
                    <Button onClick={handleReview} variant="outline" className="flex items-center space-x-2">
                      <BookOpen className="h-4 w-4" />
                      <span>Review Quiz</span>
                    </Button>
                  )}
                  {(!latestAttempt || !latestAttempt.passed) && (
                    <Button onClick={handleRetry} className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4" />
                      <span>{latestAttempt ? 'Retake Quiz' : 'Start Quiz'}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Quiz Instructions</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Read each question carefully before answering</li>
                  <li>• You can navigate between questions using the Previous/Next buttons</li>
                  <li>• You can change your answers before submitting</li>
                  {quiz.timeLimit && <li>• You have {quiz.timeLimit} minutes to complete the quiz</li>}
                  <li>• You need {quiz.passingScore}% to pass this quiz</li>
                  {!latestAttempt?.passed && <li>• You can retake the quiz if you don't pass</li>}
                </ul>
              </div>
            </div>
          )}

          {/* Quiz Component */}
          {showQuiz && (
            <Quiz
              quiz={quiz}
              onComplete={handleQuizComplete}
              onRetry={handleRetry}
              previousAttempt={isRetaking ? undefined : previousAttempt}
            />
          )}

          {/* Review Mode */}
          {showReview && latestAttempt && (
            <Quiz
              quiz={quiz}
              onComplete={() => {}} // No-op since this is review mode
              onRetry={handleRetry}
              previousAttempt={latestAttempt}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

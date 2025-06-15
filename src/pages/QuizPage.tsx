import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Target, 
  AlertTriangle, 
  Play, 
  RotateCcw,
  ArrowLeft,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { QuizPlayer } from '@/components/quiz/QuizPlayer';
import { QuizResults } from '@/components/quiz/QuizResults';
import { Quiz, QuizAttempt, quizApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (quizId) {
      loadQuizData();
    }
  }, [quizId]);

  const loadQuizData = async () => {
    if (!quizId) return;

    try {
      const [quizResponse, attemptsResponse] = await Promise.all([
        quizApi.getQuiz(quizId),
        quizApi.getMyAttempts(quizId)
      ]);

      setQuiz(quizResponse);
      setAttempts(attemptsResponse.attempts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load quiz",
        variant: "destructive",
      });
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!quiz) return;

    try {
      await quizApi.startQuiz(quiz._id);
      setGameState('playing');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start quiz",
        variant: "destructive",
      });
    }
  };

  const handleQuizComplete = (attempt: QuizAttempt) => {
    setCurrentAttempt(attempt);
    setGameState('results');
    loadQuizData(); // Refresh attempts
  };

  const handleRetakeQuiz = () => {
    setCurrentAttempt(null);
    setGameState('intro');
  };

  const handleExitQuiz = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    navigate(-1);
  };

  const getBestAttempt = (): QuizAttempt | null => {
    if (attempts.length === 0) return null;
    return attempts.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  };

  const canRetake = (): boolean => {
    if (!quiz) return false;
    return !quiz.maxAttempts || attempts.length < quiz.maxAttempts;
  };

  const hasPassedAttempt = (): boolean => {
    return attempts.some(attempt => attempt.passed);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Target className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Quiz Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The quiz you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/courses')}>
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <QuizPlayer
        quiz={quiz}
        onComplete={handleQuizComplete}
        onExit={handleExitQuiz}
      />
    );
  }

  if (gameState === 'results' && currentAttempt) {
    return (
      <QuizResults
        quiz={quiz}
        attempt={currentAttempt}
        onRetake={canRetake() ? handleRetakeQuiz : undefined}
        onContinue={handleContinue}
        canRetake={canRetake()}
      />
    );
  }

  const bestAttempt = getBestAttempt();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Quiz Introduction */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{quiz.title}</CardTitle>
              {quiz.description && (
                <CardDescription className="mt-2 text-base">
                  {quiz.description}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col items-end space-y-2">
              {quiz.isRequired && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Required
                </Badge>
              )}
              {hasPassedAttempt() && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Passed
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiz Information */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-lg font-bold">{quiz.questions.length}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-lg font-bold">{quiz.passingScore}%</div>
              <div className="text-sm text-muted-foreground">To Pass</div>
            </div>
            
            {quiz.timeLimit && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <div className="text-lg font-bold">{quiz.timeLimit}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
            )}
            
            {quiz.maxAttempts && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <div className="text-lg font-bold">
                  {attempts.length}/{quiz.maxAttempts}
                </div>
                <div className="text-sm text-muted-foreground">Attempts</div>
              </div>
            )}
          </div>

          {/* Quiz Features */}
          <div className="flex flex-wrap gap-2">
            {quiz.showCorrectAnswers && (
              <Badge variant="outline">Shows Correct Answers</Badge>
            )}
            {quiz.showScoreImmediately && (
              <Badge variant="outline">Instant Results</Badge>
            )}
            {!quiz.timeLimit && (
              <Badge variant="outline">Untimed</Badge>
            )}
            {!quiz.maxAttempts && (
              <Badge variant="outline">Unlimited Attempts</Badge>
            )}
          </div>

          {/* Previous Attempts */}
          {bestAttempt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Your Best Score</h4>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-blue-600">
                    {bestAttempt.score}%
                  </span>
                  <span className="text-blue-700 ml-2">
                    ({bestAttempt.passed ? 'Passed' : 'Failed'})
                  </span>
                </div>
                <div className="text-sm text-blue-700">
                  Attempt #{bestAttempt.attemptNumber} • {' '}
                  {new Date(bestAttempt.completedAt || bestAttempt.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {attempts.length === 0 ? (
              <Button onClick={handleStartQuiz} size="lg" className="flex-1">
                <Play className="h-5 w-5 mr-2" />
                Start Quiz
              </Button>
            ) : canRetake() ? (
              <Button onClick={handleStartQuiz} size="lg" className="flex-1">
                <RotateCcw className="h-5 w-5 mr-2" />
                Retake Quiz
              </Button>
            ) : (
              <Button disabled size="lg" className="flex-1">
                Maximum Attempts Reached
              </Button>
            )}

            {bestAttempt && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentAttempt(bestAttempt);
                  setGameState('results');
                }}
                size="lg"
              >
                View Last Results
              </Button>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Instructions</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Read each question carefully before selecting your answer</li>
              <li>• You can navigate between questions using the navigation buttons</li>
              {quiz.timeLimit && (
                <li>• You have {quiz.timeLimit} minutes to complete the quiz</li>
              )}
              <li>• Make sure to submit your quiz before the time runs out</li>
              {quiz.showCorrectAnswers && (
                <li>• You'll see correct answers and explanations after submission</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizPage;

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Quiz } from '@/components/quiz/Quiz';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import Header from '@/components/Header';
import { Trophy, BookOpen, RotateCcw } from 'lucide-react';

interface QuizAttempt {
  id: string;
  answers: Record<string, string | string[]>;
  score: number;
  passed: boolean;
  timeSpent: number;
  createdAt: string;
}

const QuizDemo = () => {
  const [currentQuiz, setCurrentQuiz] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Record<string, QuizAttempt>>({});

  const sampleQuizzes = [
    {
      id: 'wikipedia-basics',
      title: 'Wikipedia Basics',
      description: 'Test your understanding of Wikipedia fundamentals and core concepts.',
      passingScore: 70,
      timeLimit: 10,
      lessonId: 'lesson-1',
      questions: [
        {
          id: 'q1',
          question: 'What is Wikipedia?',
          type: 'multiple_choice' as const,
          options: [
            'A paid encyclopedia service',
            'A free, open-content encyclopedia',
            'A social media platform',
            'A news website'
          ],
          correctAnswer: 'A free, open-content encyclopedia',
          explanation: 'Wikipedia is indeed a free, open-content encyclopedia that anyone can edit.',
          points: 10
        },
        {
          id: 'q2',
          question: 'Can anyone edit Wikipedia articles?',
          type: 'true_false' as const,
          correctAnswer: 'True',
          explanation: 'Yes, Wikipedia is designed to be editable by anyone, though some articles may have protection levels.',
          points: 10
        },
        {
          id: 'q3',
          question: 'Which of the following are Wikipedia\'s core content policies? (Select all that apply)',
          type: 'multiple_select' as const,
          options: [
            'Neutral Point of View (NPOV)',
            'Verifiability',
            'No Original Research',
            'Be Bold',
            'Assume Good Faith'
          ],
          correctAnswer: ['Neutral Point of View (NPOV)', 'Verifiability', 'No Original Research'],
          explanation: 'The three core content policies are NPOV, Verifiability, and No Original Research. The others are guidelines or behavioral policies.',
          points: 15
        },
        {
          id: 'q4',
          question: 'What does "Verifiability" mean in the context of Wikipedia?',
          type: 'short_answer' as const,
          correctAnswer: 'Information must be supported by reliable sources',
          explanation: 'Verifiability means that information in Wikipedia must be supported by reliable, published sources that readers can verify.',
          points: 15
        }
      ]
    },
    {
      id: 'editing-policies',
      title: 'Wikipedia Editing Policies',
      description: 'Advanced quiz on Wikipedia policies and editing guidelines.',
      passingScore: 80,
      timeLimit: 15,
      lessonId: 'lesson-2',
      questions: [
        {
          id: 'q1',
          question: 'What is the purpose of the "Neutral Point of View" policy?',
          type: 'multiple_choice' as const,
          options: [
            'To ensure articles are written from a single perspective',
            'To present all significant viewpoints fairly and without bias',
            'To avoid controversial topics',
            'To promote Wikipedia\'s own viewpoint'
          ],
          correctAnswer: 'To present all significant viewpoints fairly and without bias',
          explanation: 'NPOV requires that articles present all significant viewpoints fairly, proportionately, and without editorial bias.',
          points: 20
        },
        {
          id: 'q2',
          question: 'When should you cite sources in Wikipedia articles?',
          type: 'multiple_choice' as const,
          options: [
            'Only for controversial statements',
            'Only at the end of articles',
            'For all material that is likely to be challenged',
            'Sources are not required in Wikipedia'
          ],
          correctAnswer: 'For all material that is likely to be challenged',
          explanation: 'Wikipedia requires citations for all material that is likely to be challenged, and for all quotations.',
          points: 20
        },
        {
          id: 'q3',
          question: 'What constitutes "Original Research" that should be avoided?',
          type: 'multiple_select' as const,
          options: [
            'Unpublished facts, arguments, speculation, and ideas',
            'Personal analysis or synthesis of published material',
            'Citing reliable sources',
            'Any conclusion not explicitly stated by sources'
          ],
          correctAnswer: [
            'Unpublished facts, arguments, speculation, and ideas',
            'Personal analysis or synthesis of published material',
            'Any conclusion not explicitly stated by sources'
          ],
          explanation: 'Original research includes unpublished material, personal analysis, and conclusions not explicitly stated in sources.',
          points: 20
        }
      ]
    }
  ];

  const handleQuizComplete = (attempt: QuizAttempt) => {
    if (currentQuiz) {
      setAttempts(prev => ({
        ...prev,
        [currentQuiz]: attempt
      }));
    }
  };

  const handleRetry = () => {
    if (currentQuiz) {
      setAttempts(prev => {
        const newAttempts = { ...prev };
        delete newAttempts[currentQuiz];
        return newAttempts;
      });
    }
  };

  const selectedQuiz = sampleQuizzes.find(q => q.id === currentQuiz);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {!currentQuiz ? (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Quiz Demo
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Experience our interactive quiz system. Test your Wikipedia knowledge 
                with these sample quizzes that demonstrate the quiz functionality.
              </p>
            </div>

            {/* Quiz Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {sampleQuizzes.map((quiz) => {
                const attempt = attempts[quiz.id];
                return (
                  <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center space-x-2">
                            <Trophy className="h-5 w-5 text-blue-600" />
                            <span>{quiz.title}</span>
                          </CardTitle>
                          <p className="text-muted-foreground text-sm">
                            {quiz.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Quiz Stats */}
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="font-semibold text-foreground">{quiz.questions.length}</div>
                          <div className="text-muted-foreground">Questions</div>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{quiz.passingScore}%</div>
                          <div className="text-muted-foreground">Pass Score</div>
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{quiz.timeLimit}m</div>
                          <div className="text-muted-foreground">Time Limit</div>
                        </div>
                      </div>

                      {/* Previous Attempt */}
                      {attempt && (
                        <div className="p-3 bg-muted/50 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Previous Attempt</span>
                            <span className={`text-sm font-semibold ${
                              attempt.passed ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {attempt.score}% {attempt.passed ? '(Passed)' : '(Failed)'}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Time: {Math.floor(attempt.timeSpent / 60)}:{(attempt.timeSpent % 60).toString().padStart(2, '0')}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button 
                        onClick={() => setCurrentQuiz(quiz.id)}
                        className="w-full"
                        variant={attempt?.passed ? "outline" : "default"}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        {attempt ? (attempt.passed ? 'Review Quiz' : 'Retake Quiz') : 'Start Quiz'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Instructions */}
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>How to Use the Quiz System</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Quiz Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Multiple question types (Multiple choice, True/False, Short answer, Multiple select)</li>
                      <li>• Timed quizzes with countdown</li>
                      <li>• Progress tracking</li>
                      <li>• Instant feedback with explanations</li>
                      <li>• Retake capability for failed attempts</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Navigation</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Navigate between questions using Previous/Next buttons</li>
                      <li>• Change answers before submitting</li>
                      <li>• Review all answers after completion</li>
                      <li>• See detailed explanations for each question</li>
                      <li>• Track your score and time spent</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <Button 
              variant="outline" 
              onClick={() => setCurrentQuiz(null)}
              className="mb-4"
            >
              ← Back to Quiz Selection
            </Button>

            {/* Quiz Component */}
            {selectedQuiz && (
              <div className="max-w-4xl mx-auto">
                <Quiz
                  quiz={selectedQuiz}
                  onComplete={handleQuizComplete}
                  onRetry={handleRetry}
                  previousAttempt={attempts[currentQuiz]}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDemo;

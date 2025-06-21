import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { VideoPlayer } from '@/components/ui/video-player';
import { QuizModal } from '@/components/quiz/QuizModal';
import { QuizQuestion } from '@/components/quiz/QuizQuestion';
import {
  Play,
  CheckCircle,
  Clock,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

export enum LessonType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  QUIZ = 'QUIZ'
}

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

interface Lesson {
  id: string;
  title: string;
  content: string;
  type: LessonType;
  videoUrl?: string;
  duration?: number;
  order: number;
  isCompleted: boolean;
  progress: number;
  quiz?: QuizData;
  quizAttempt?: QuizAttempt;
  resources?: {
    title: string;
    url: string;
    type: 'pdf' | 'doc' | 'link';
  }[];
}

interface LessonViewerProps {
  lesson: Lesson;
  onComplete: (lessonId: string) => void;
  onProgress: (lessonId: string, timeSpent: number) => void;
  onQuizComplete?: (lessonId: string, attempt: QuizAttempt) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  className?: string;
}

export function LessonViewer({
  lesson,
  onComplete,
  onProgress,
  onQuizComplete,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  className
}: LessonViewerProps) {
  const [currentProgress, setCurrentProgress] = useState(lesson.progress);
  const [isCompleted, setIsCompleted] = useState(lesson.isCompleted);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | undefined>(lesson.quizAttempt);
  const [startTime] = useState(Date.now());
  const [lastProgressUpdate, setLastProgressUpdate] = useState(Date.now());

  useEffect(() => {
    setCurrentProgress(lesson.progress);
    setIsCompleted(lesson.isCompleted);
  }, [lesson]);

  // Track time spent and update progress periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSpent = Math.floor((now - startTime) / 1000); // in seconds

      // Update progress every 30 seconds
      if (now - lastProgressUpdate > 30000) {
        onProgress(lesson.id, timeSpent);
        setLastProgressUpdate(now);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [lesson.id, onProgress, startTime, lastProgressUpdate]);

  const handleVideoProgress = (progress: number) => {
    setVideoProgress(progress);
    const newProgress = Math.max(currentProgress, progress);
    setCurrentProgress(newProgress);

    // Auto-complete when video reaches 90%
    if (progress >= 90 && !isCompleted) {
      handleComplete();
    }
  };

  const handleVideoComplete = () => {
    if (!isCompleted) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    setCurrentProgress(100);

    // Show quiz modal if lesson has a quiz and it hasn't been passed yet
    if (lesson.quiz && (!quizAttempt || !quizAttempt.passed)) {
      setShowQuizModal(true);
    } else {
      onComplete(lesson.id);
    }
  };

  const handleQuizComplete = (attempt: QuizAttempt) => {
    setQuizAttempt(attempt);
    if (onQuizComplete) {
      onQuizComplete(lesson.id, attempt);
    }

    // Complete the lesson if quiz is passed
    if (attempt.passed) {
      onComplete(lesson.id);
    }
  };

  const handleQuizModalClose = () => {
    setShowQuizModal(false);
    // If quiz was passed, complete the lesson
    if (quizAttempt?.passed) {
      onComplete(lesson.id);
    }
  };

  const handleProceedToNext = () => {
    setShowQuizModal(false);
    if (onNext) {
      onNext();
    }
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case LessonType.VIDEO:
        return <Video className="h-5 w-5" />;
      case LessonType.TEXT:
        return <FileText className="h-5 w-5" />;
      case LessonType.QUIZ:
        return <HelpCircle className="h-5 w-5" />;
      case LessonType.INTERACTIVE:
        return <Play className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  const getLessonTypeColor = (type: LessonType) => {
    switch (type) {
      case LessonType.VIDEO:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case LessonType.TEXT:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case LessonType.QUIZ:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case LessonType.INTERACTIVE:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Lesson Header */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20 pb-8">
          <div className="flex items-start justify-between">
            <div className="space-y-4 flex-1">
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <Badge className={cn(
                  "px-3 py-1.5 text-sm font-medium shadow-sm",
                  getLessonTypeColor(lesson.type)
                )}>
                  {getLessonIcon(lesson.type)}
                  <span className="ml-2">{lesson.type}</span>
                </Badge>
                {lesson.duration && (
                  <Badge variant="outline" className="flex items-center space-x-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{formatDuration(lesson.duration)}</span>
                  </Badge>
                )}
                {lesson.quiz && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "flex items-center space-x-2 px-3 py-1.5 backdrop-blur-sm",
                      quizAttempt?.passed
                        ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        : "bg-white/80 dark:bg-gray-800/80"
                    )}
                  >
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">
                      {quizAttempt?.passed ? 'Quiz Passed' : 'Has Quiz'}
                    </span>
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 shadow-lg">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Completed</span>
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                  {lesson.title}
                </CardTitle>
                {lesson.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                    {lesson.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="space-y-3 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Lesson Progress</span>
              <span className="text-sm font-bold text-foreground bg-white/80 dark:bg-gray-800/80 px-3 py-1 rounded-full backdrop-blur-sm">
                {Math.round(currentProgress)}% Complete
              </span>
            </div>
            <div className="relative">
              <Progress value={currentProgress} className="h-3 bg-gray-200 dark:bg-gray-700" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white drop-shadow-sm">
                  {Math.round(currentProgress)}%
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Video Content */}
      {lesson.type === LessonType.VIDEO && lesson.videoUrl && (
        <Card>
          <CardContent className="p-0">
            <VideoPlayer
              src={lesson.videoUrl}
              title={lesson.title}
              onProgress={handleVideoProgress}
              onComplete={handleVideoComplete}
              className="aspect-video w-full"
              startTime={lesson.progress ? (lesson.progress / 100) * (lesson.duration || 0) * 60 : 0}
            />
          </CardContent>
        </Card>
      )}

      {/* Lesson Content - Different formats based on type */}
      {lesson.type === LessonType.QUIZ ? (
        // Quiz Lesson - Interactive Quiz Interface
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>Interactive Quiz</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Don't display raw JSON content for quiz lessons */}
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold mb-2">Ready to Test Your Knowledge?</h3>
                <p className="text-muted-foreground mb-4">
                  Complete this interactive quiz to demonstrate your understanding of the lesson material.
                </p>
                <Button
                  onClick={() => setShowQuizModal(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {quizAttempt?.passed ? 'Review Quiz' : quizAttempt ? 'Retake Quiz' : 'Start Quiz'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : lesson.type === LessonType.VIDEO ? (
        // Video Lesson - Video Content with Player
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="h-5 w-5" />
              <span>Video Lesson</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lesson.videoUrl && (
                <VideoPlayer
                  src={lesson.videoUrl}
                  title={lesson.title}
                  onProgress={(progress) => {
                    // Handle video progress
                    console.log('Video progress:', progress);
                  }}
                />
              )}
              <div
                className="prose prose-slate dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        // Text/Default Lesson - Standard Content
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Lesson Content</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-slate dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Resources */}
      {lesson.resources && lesson.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Additional Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lesson.resources.map((resource, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-muted rounded">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      <p className="text-sm text-muted-foreground">{resource.type.toUpperCase()}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {hasPrevious && (
                <Button variant="outline" onClick={onPrevious}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              {/* Quiz lessons - handled by the quiz interface above */}
              {lesson.type === LessonType.QUIZ && lesson.quiz && (
                <Button
                  variant={quizAttempt?.passed ? "outline" : "default"}
                  onClick={() => setShowQuizModal(true)}
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {quizAttempt?.passed ? 'Review Quiz' : quizAttempt ? 'Retake Quiz' : 'Take Quiz'}
                </Button>
              )}



              {/* Assignment lessons - special completion */}
              {lesson.type === LessonType.ASSIGNMENT && !isCompleted && (
                <Button onClick={handleComplete} className="bg-blue-600 hover:bg-blue-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Assignment
                </Button>
              )}

              {/* Text lessons and other types - standard completion */}
              {!isCompleted &&
               lesson.type !== LessonType.VIDEO &&
               lesson.type !== LessonType.QUIZ &&
               lesson.type !== LessonType.INTERACTIVE &&
               lesson.type !== LessonType.ASSIGNMENT &&
               !lesson.quiz && (
                <Button onClick={handleComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              )}

              {hasNext && (
                <Button
                  onClick={onNext}
                  disabled={
                    (lesson.quiz && !quizAttempt?.passed) ||
                    (lesson.type === LessonType.QUIZ && !isCompleted)
                  }
                >
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Modal */}
      {lesson.quiz && (
        <QuizModal
          isOpen={showQuizModal}
          onClose={handleQuizModalClose}
          quiz={lesson.quiz}
          lessonTitle={lesson.title}
          onQuizComplete={handleQuizComplete}
          onProceedToNext={hasNext ? handleProceedToNext : undefined}
          previousAttempt={quizAttempt}
        />
      )}
    </div>
  );
}

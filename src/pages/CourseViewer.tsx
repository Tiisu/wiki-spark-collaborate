import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LessonViewer, LessonType } from '@/components/course/LessonViewer';
import Header from '@/components/Header';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  ChevronLeft,
  Play,
  CheckCircle,
  Video,
  FileText,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { courseApi, learningApi } from '@/lib/api';
import { getInstructorName } from '@/utils/instructorUtils';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string | {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  thumbnail?: string;
  totalLessons: number;
  completedLessons: number;
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  rating: number;
  progress: number;
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface QuizData {
  id: string;
  title: string;
  description?: string;
  questions: any[];
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
  moduleId: string;
  quiz?: QuizData;
  quizAttempt?: QuizAttempt;
  resources?: {
    title: string;
    url: string;
    type: 'pdf' | 'doc' | 'link';
  }[];
}

const CourseViewer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);



  // Fetch course data
  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('Course ID is required');
      try {
        return await courseApi.getCourse(courseId);
      } catch (error) {
        // If API fails, return mock data for development
        console.warn('API call failed, using mock data:', error);
        return getMockCourse(courseId);
      }
    },
    enabled: !!courseId
  });

  // Mock course data function for development fallback
  const getMockCourse = (courseId: string): Course => {
    return {
        id: courseId!,
        title: 'Introduction to Wikipedia Editing',
        description: 'Learn the fundamentals of editing Wikipedia articles, understanding policies, and contributing to the world\'s largest encyclopedia.',
        instructor: 'Dr. Sarah Johnson',
        thumbnail: '/api/placeholder/400/225',
        totalLessons: 8,
        completedLessons: 3,
        estimatedHours: 6,
        difficulty: 'Beginner',
        category: 'Editing',
        rating: 4.8,
        progress: 37.5,
        modules: [
          {
            id: 'module-1',
            title: 'Getting Started',
            description: 'Introduction to Wikipedia and basic concepts',
            order: 1,
            lessons: [
              {
                id: 'lesson-1',
                title: 'Welcome to Wikipedia',
                content: '<h2>Welcome to Wikipedia Editing</h2><p>Wikipedia is the world\'s largest encyclopedia, created and maintained by volunteers like you. In this lesson, you\'ll learn the basics of how Wikipedia works and why your contributions matter.</p><h3>What is Wikipedia?</h3><p>Wikipedia is a free, open-content encyclopedia that anyone can edit. It contains over 6 million articles in English alone and is available in hundreds of languages.</p>',
                type: LessonType.VIDEO,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                duration: 15,
                order: 1,
                isCompleted: true,
                progress: 100,
                moduleId: 'module-1',
                quiz: {
                  id: 'quiz-1',
                  title: 'Wikipedia Basics Quiz',
                  description: 'Test your understanding of Wikipedia fundamentals',
                  passingScore: 70,
                  timeLimit: 10,
                  lessonId: 'lesson-1',
                  questions: [
                    {
                      id: 'q1',
                      question: 'What is Wikipedia?',
                      type: 'multiple_choice',
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
                      type: 'true_false',
                      correctAnswer: 'True',
                      explanation: 'Yes, Wikipedia is designed to be editable by anyone, though some articles may have protection levels.',
                      points: 10
                    }
                  ]
                },
                quizAttempt: {
                  id: 'attempt-1',
                  answers: { 'q1': 'A free, open-content encyclopedia', 'q2': 'True' },
                  score: 100,
                  passed: true,
                  timeSpent: 120,
                  createdAt: '2024-01-20T10:00:00Z'
                },
                resources: [
                  {
                    title: 'Wikipedia Policies Overview',
                    url: '/resources/wikipedia-policies.pdf',
                    type: 'pdf'
                  }
                ]
              },
              {
                id: 'lesson-2',
                title: 'Creating Your Account',
                content: '<h2>Creating Your Wikipedia Account</h2><p>While you can edit Wikipedia without an account, having one provides many benefits including the ability to track your contributions and communicate with other editors.</p>',
                type: LessonType.VIDEO,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                duration: 10,
                order: 2,
                isCompleted: true,
                progress: 100,
                moduleId: 'module-1'
              },
              {
                id: 'lesson-3',
                title: 'Understanding Wikipedia Policies',
                content: '<h2>Core Wikipedia Policies</h2><p>Wikipedia has several core policies that guide all editing. Understanding these is crucial for successful contributions.</p>',
                type: LessonType.TEXT,
                duration: 20,
                order: 3,
                isCompleted: false,
                progress: 60,
                moduleId: 'module-1',
                quiz: {
                  id: 'quiz-3',
                  title: 'Wikipedia Policies Quiz',
                  description: 'Test your knowledge of Wikipedia\'s core policies',
                  passingScore: 80,
                  timeLimit: 15,
                  lessonId: 'lesson-3',
                  questions: [
                    {
                      id: 'q1',
                      question: 'Which of the following are core Wikipedia policies? (Select all that apply)',
                      type: 'multiple_select',
                      options: [
                        'Neutral Point of View (NPOV)',
                        'Verifiability',
                        'No Original Research',
                        'Be Bold'
                      ],
                      correctAnswer: ['Neutral Point of View (NPOV)', 'Verifiability', 'No Original Research'],
                      explanation: 'The three core content policies are NPOV, Verifiability, and No Original Research. "Be Bold" is a guideline, not a policy.',
                      points: 15
                    },
                    {
                      id: 'q2',
                      question: 'What does "Verifiability" mean in Wikipedia?',
                      type: 'short_answer',
                      correctAnswer: 'Information must be supported by reliable sources',
                      explanation: 'Verifiability means that information in Wikipedia must be supported by reliable, published sources.',
                      points: 10
                    }
                  ]
                }
              }
            ]
          },
          {
            id: 'module-2',
            title: 'Basic Editing',
            description: 'Learn how to make your first edits',
            order: 2,
            lessons: [
              {
                id: 'lesson-4',
                title: 'Your First Edit',
                content: '<h2>Making Your First Edit</h2><p>Learn how to make simple edits to Wikipedia articles safely and effectively.</p>',
                type: LessonType.VIDEO,
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                duration: 25,
                order: 1,
                isCompleted: false,
                progress: 0,
                moduleId: 'module-2'
              }
            ]
          }
        ]
      };
    };

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return courseApi.enrollInCourse(courseId);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Successfully enrolled in course!',
      });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update lesson progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ lessonId, timeSpent }: { lessonId: string; timeSpent?: number }) => {
      await learningApi.updateLessonProgress(lessonId, { timeSpent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
    }
  });

  // Complete lesson mutation
  const completeLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      await learningApi.markLessonComplete(lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      toast({
        title: 'Lesson completed!',
        description: 'Great job! You\'ve completed this lesson.',
      });
    }
  });

  // Get all lessons in order
  const allLessons = course?.modules?.flatMap(module => module.lessons)?.sort((a, b) => {
    if (a.moduleId !== b.moduleId) {
      const moduleA = course?.modules?.find(m => m.id === a.moduleId);
      const moduleB = course?.modules?.find(m => m.id === b.moduleId);
      return (moduleA?.order || 0) - (moduleB?.order || 0);
    }
    return a.order - b.order;
  }) || [];

  const selectedLesson = allLessons.find(lesson => lesson.id === selectedLessonId);
  const selectedLessonIndex = allLessons.findIndex(lesson => lesson.id === selectedLessonId);

  // Auto-select first lesson if none selected
  useEffect(() => {
    if (allLessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(allLessons[0].id);
    }
  }, [allLessons, selectedLessonId]);

  const handleLessonProgress = (lessonId: string, timeSpent: number) => {
    updateProgressMutation.mutate({ lessonId, timeSpent });
  };

  const handleLessonComplete = (lessonId: string) => {
    completeLessonMutation.mutate(lessonId);
  };

  const handleQuizComplete = (lessonId: string, attempt: QuizAttempt) => {
    // Mock API call to save quiz attempt
    console.log('Quiz completed for lesson:', lessonId, 'Attempt:', attempt);

    // Update the lesson's quiz attempt in the cache
    queryClient.setQueryData(['course', courseId], (oldData: any) => {
      if (!oldData || !oldData.modules) return oldData;

      const updatedModules = oldData.modules.map((module: any) => ({
        ...module,
        lessons: module.lessons?.map((lesson: any) =>
          lesson.id === lessonId
            ? { ...lesson, quizAttempt: attempt }
            : lesson
        ) || []
      }));

      return { ...oldData, modules: updatedModules };
    });

    toast({
      title: attempt.passed ? 'Quiz passed!' : 'Quiz completed',
      description: attempt.passed
        ? `Great job! You scored ${attempt.score}%`
        : `You scored ${attempt.score}%. You need ${course?.modules?.find(m => m.lessons?.find(l => l.id === lessonId))?.lessons?.find(l => l.id === lessonId)?.quiz?.passingScore || 70}% to pass.`,
    });
  };

  const handleNextLesson = () => {
    if (selectedLessonIndex < allLessons.length - 1) {
      setSelectedLessonId(allLessons[selectedLessonIndex + 1].id);
    }
  };

  const handlePreviousLesson = () => {
    if (selectedLessonIndex > 0) {
      setSelectedLessonId(allLessons[selectedLessonIndex - 1].id);
    }
  };

  const getLessonIcon = (type: LessonType) => {
    switch (type) {
      case LessonType.VIDEO:
        return <Video className="h-4 w-4" />;
      case LessonType.TEXT:
        return <FileText className="h-4 w-4" />;
      case LessonType.QUIZ:
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Course not found</h1>
            <Button onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Course Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <p className="text-muted-foreground">{course.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{getInstructorName(course.instructor)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.estimatedHours}h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {course.difficulty}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Course Progress</span>
                  <span>{course.completedLessons}/{course.totalLessons} lessons completed</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Course Content */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Course Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                {course?.modules?.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No modules available</h3>
                    <p className="text-muted-foreground">This course doesn't have any modules yet.</p>
                  </div>
                ) : (
                  course?.modules?.map((module) => (
                    <div key={module.id} className="space-y-2">
                      <h4 className="font-semibold text-sm text-foreground">{module.title}</h4>
                      <div className="space-y-1">
                        {module.lessons?.length === 0 ? (
                          <div className="text-center py-4 border border-dashed rounded-lg">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No lessons available in this module</p>
                            <p className="text-xs text-muted-foreground mt-1">Content may not be published yet</p>
                          </div>
                        ) : (
                          module.lessons?.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => setSelectedLessonId(lesson.id)}
                              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                selectedLessonId === lesson.id
                                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {getLessonIcon(lesson.type)}
                                  <span className="text-sm font-medium truncate">{lesson.title}</span>
                                  {lesson.quiz && (
                                    <Trophy className={`h-3 w-3 flex-shrink-0 ${
                                      lesson.quizAttempt?.passed
                                        ? 'text-green-600'
                                        : 'text-muted-foreground'
                                    }`} />
                                  )}
                                </div>
                                {lesson.isCompleted && (
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                )}
                              </div>
                              {lesson.duration && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {lesson.duration}m
                                  {lesson.quiz && (
                                    <span className="ml-2">
                                      • Quiz: {lesson.quizAttempt?.passed ? 'Passed' : 'Required'}
                                    </span>
                                  )}
                                </div>
                              )}
                              {lesson.progress > 0 && lesson.progress < 100 && (
                                <Progress value={lesson.progress} className="h-1 mt-2" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Lesson Viewer */}
          <div className="lg:col-span-3">
            {selectedLesson ? (
              <LessonViewer
                lesson={selectedLesson}
                onComplete={handleLessonComplete}
                onProgress={handleLessonProgress}
                onQuizComplete={handleQuizComplete}
                onNext={selectedLessonIndex < allLessons.length - 1 ? handleNextLesson : undefined}
                onPrevious={selectedLessonIndex > 0 ? handlePreviousLesson : undefined}
                hasNext={selectedLessonIndex < allLessons.length - 1}
                hasPrevious={selectedLessonIndex > 0}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a lesson to start</h3>
                    <p className="text-muted-foreground">Choose a lesson from the sidebar to begin learning.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;

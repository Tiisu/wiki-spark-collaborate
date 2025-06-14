import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Lock, 
  Play, 
  Clock, 
  BookOpen, 
  Award,
  ArrowDown,
  Globe,
  Target
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  category: string;
  estimatedHours: number;
  totalLessons: number;
  isCompleted: boolean;
  isEnrolled: boolean;
  isLocked: boolean;
  progress: number;
  hasAssessment: boolean;
  wikipediaProject: string;
}

interface LearningPathVisualizationProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  onContinue: (courseId: string) => void;
}

const LearningPathVisualization: React.FC<LearningPathVisualizationProps> = ({
  courses,
  onEnroll,
  onContinue
}) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProjectIcon = (project: string) => {
    switch (project) {
      case 'WIKIPEDIA':
        return <Globe className="h-4 w-4" />;
      case 'WIKIDATA':
        return <Target className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const groupedCourses = courses.reduce((acc, course) => {
    if (!acc[course.level]) {
      acc[course.level] = [];
    }
    acc[course.level].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  const levelOrder = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">Your Wikipedia Learning Journey</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Follow this structured path to master Wikipedia editing skills. Each level builds upon the previous one.
        </p>
      </div>

      {levelOrder.map((level, levelIndex) => {
        const levelCourses = groupedCourses[level] || [];
        if (levelCourses.length === 0) return null;

        const completedCourses = levelCourses.filter(course => course.isCompleted).length;
        const totalCourses = levelCourses.length;
        const levelProgress = (completedCourses / totalCourses) * 100;

        return (
          <div key={level} className="space-y-6">
            {/* Level Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Badge className={`${getLevelColor(level)} px-4 py-2 text-lg font-semibold`}>
                  {level} LEVEL
                </Badge>
                <div className="text-sm text-muted-foreground">
                  {completedCourses} of {totalCourses} completed
                </div>
              </div>
              <div className="max-w-md mx-auto">
                <Progress value={levelProgress} className="h-3" />
                <div className="text-sm text-muted-foreground mt-1">
                  {Math.round(levelProgress)}% complete
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {levelCourses.map((course, courseIndex) => (
                <Card 
                  key={course.id} 
                  className={`relative transition-all duration-200 ${
                    course.isCompleted 
                      ? 'border-green-200 bg-green-50/50' 
                      : course.isLocked 
                      ? 'border-gray-200 bg-gray-50/50 opacity-60' 
                      : 'hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="absolute -top-2 -right-2 z-10">
                    {course.isCompleted ? (
                      <div className="bg-green-600 text-white rounded-full p-2">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    ) : course.isLocked ? (
                      <div className="bg-gray-400 text-white rounded-full p-2">
                        <Lock className="h-4 w-4" />
                      </div>
                    ) : course.isEnrolled ? (
                      <div className="bg-blue-600 text-white rounded-full p-2">
                        <Play className="h-4 w-4" />
                      </div>
                    ) : null}
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {getProjectIcon(course.wikipediaProject)}
                          <Badge variant="outline" className="text-xs">
                            {course.wikipediaProject}
                          </Badge>
                          {course.hasAssessment && (
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg line-clamp-2">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-3">
                          {course.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Course Stats */}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.estimatedHours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.totalLessons} lessons</span>
                      </div>
                    </div>

                    {/* Progress Bar (if enrolled) */}
                    {course.isEnrolled && !course.isCompleted && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-2">
                      {course.isCompleted ? (
                        <Button variant="outline" className="w-full" disabled>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </Button>
                      ) : course.isLocked ? (
                        <Button variant="outline" className="w-full" disabled>
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </Button>
                      ) : course.isEnrolled ? (
                        <Button 
                          className="w-full" 
                          onClick={() => onContinue(course.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => onEnroll(course.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Course
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Level Connector */}
            {levelIndex < levelOrder.length - 1 && groupedCourses[levelOrder[levelIndex + 1]]?.length > 0 && (
              <div className="flex justify-center py-4">
                <div className="flex flex-col items-center space-y-2">
                  <ArrowDown className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground text-center">
                    Complete {level.toLowerCase()} courses to unlock {levelOrder[levelIndex + 1].toLowerCase()} level
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Learning Path Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Complete Your Wikipedia Journey</h3>
            <p className="text-muted-foreground">
              Master all courses to become a confident Wikipedia contributor and earn your certification
            </p>
            <div className="flex justify-center gap-8 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {courses.filter(c => c.isCompleted).length}
                </div>
                <div className="text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {courses.filter(c => c.isEnrolled && !c.isCompleted).length}
                </div>
                <div className="text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {courses.filter(c => !c.isEnrolled && !c.isLocked).length}
                </div>
                <div className="text-muted-foreground">Available</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LearningPathVisualization;

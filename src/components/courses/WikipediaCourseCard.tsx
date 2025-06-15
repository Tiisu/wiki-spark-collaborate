import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Users, 
  BookOpen, 
  Star, 
  Trophy, 
  CheckCircle,
  Play,
  Award,
  Globe,
  Edit,
  Link
} from 'lucide-react';
import { Course, Enrollment } from '@/lib/api';
import { Link as RouterLink } from 'react-router-dom';

interface WikipediaCourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  onEnroll?: () => void;
  className?: string;
}

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Wikipedia Basics': <Edit className="h-4 w-4" />,
    'Content Creation': <BookOpen className="h-4 w-4" />,
    'Sourcing & Citations': <Link className="h-4 w-4" />,
    'Community & Policy': <Users className="h-4 w-4" />,
    'Sister Projects': <Globe className="h-4 w-4" />,
    'Advanced Topics': <Star className="h-4 w-4" />,
    'Special Skills': <Award className="h-4 w-4" />
  };
  return iconMap[category] || <BookOpen className="h-4 w-4" />;
};

const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    'Wikipedia Basics': 'bg-blue-100 text-blue-800 border-blue-200',
    'Content Creation': 'bg-green-100 text-green-800 border-green-200',
    'Sourcing & Citations': 'bg-purple-100 text-purple-800 border-purple-200',
    'Community & Policy': 'bg-orange-100 text-orange-800 border-orange-200',
    'Sister Projects': 'bg-teal-100 text-teal-800 border-teal-200',
    'Advanced Topics': 'bg-red-100 text-red-800 border-red-200',
    'Special Skills': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };
  return colorMap[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800';
    case 'advanced':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${remainingMinutes}m`;
};

export const WikipediaCourseCard: React.FC<WikipediaCourseCardProps> = ({
  course,
  enrollment,
  onEnroll,
  className = ''
}) => {
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.status === 'COMPLETED';
  const progress = enrollment?.progress || 0;

  const getActionButton = () => {
    if (isCompleted) {
      return (
        <Button asChild className="w-full">
          <RouterLink to={`/courses/${course._id}`}>
            <Trophy className="h-4 w-4 mr-2" />
            View Certificate
          </RouterLink>
        </Button>
      );
    }

    if (isEnrolled) {
      return (
        <Button asChild className="w-full">
          <RouterLink to={`/courses/${course._id}`}>
            <Play className="h-4 w-4 mr-2" />
            Continue Learning
          </RouterLink>
        </Button>
      );
    }

    return (
      <Button onClick={onEnroll} className="w-full">
        <BookOpen className="h-4 w-4 mr-2" />
        Enroll Now
      </Button>
    );
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${className}`}>
      {/* Course Image/Header */}
      <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
        {course.thumbnail ? (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              {getCategoryIcon(course.category)}
              <div className="mt-2 text-sm font-medium">{course.category}</div>
            </div>
          </div>
        )}
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex space-x-2">
          <Badge className="bg-white/90 text-gray-800">
            FREE
          </Badge>
          {isCompleted && (
            <Badge className="bg-green-500 text-white">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        {/* Progress Overlay */}
        {isEnrolled && !isCompleted && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2">
            <div className="flex justify-between items-center text-xs mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight group-hover:text-blue-600 transition-colors">
              {course.title}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {course.description}
            </CardDescription>
          </div>
        </div>

        {/* Category and Level Badges */}
        <div className="flex items-center space-x-2 mt-3">
          <Badge className={getCategoryColor(course.category)}>
            {getCategoryIcon(course.category)}
            <span className="ml-1">{course.category}</span>
          </Badge>
          <Badge variant="outline" className={getLevelColor(course.level)}>
            {course.level}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Course Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
            </div>
            <div className="font-medium mt-1">
              {formatDuration(course.duration || 0)}
            </div>
            <div className="text-xs text-muted-foreground">Duration</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="font-medium mt-1">
              {course.totalLessons || 0}
            </div>
            <div className="text-xs text-muted-foreground">Lessons</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 text-muted-foreground">
              <Users className="h-4 w-4" />
            </div>
            <div className="font-medium mt-1">
              {course.enrollmentCount || 0}
            </div>
            <div className="text-xs text-muted-foreground">Students</div>
          </div>
        </div>

        {/* Course Rating */}
        {course.rating && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(course.rating!)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              ({course.reviewCount || 0} reviews)
            </span>
          </div>
        )}

        {/* Wikipedia Skills Tags */}
        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Instructor */}
        {course.instructor && (
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-3 w-3 text-blue-600" />
            </div>
            <span className="text-muted-foreground">by</span>
            <span className="font-medium">
              {typeof course.instructor === 'object' 
                ? `${course.instructor.firstName} ${course.instructor.lastName}`
                : 'WikiWalkthrough Instructor'
              }
            </span>
          </div>
        )}

        {/* Action Button */}
        {getActionButton()}

        {/* Wikipedia Learning Path */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 text-blue-800 text-sm">
            <Globe className="h-4 w-4" />
            <span className="font-medium">Wikipedia Learning Path</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Master Wikipedia editing skills and contribute to the world's largest encyclopedia
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

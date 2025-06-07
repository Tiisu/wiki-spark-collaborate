import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BookOpen, 
  Clock, 
  Play, 
  CheckCircle, 
  MoreHorizontal,
  Search,
  Filter,
  Calendar,
  User,
  Star,
  BarChart3
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LoadingSkeleton from '@/components/ui/loading-skeleton';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail?: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  enrolledAt: string;
  lastAccessed?: string;
  rating: number;
  isCompleted: boolean;
}

const EnrolledCourses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['enrolled-courses', searchTerm, filterStatus, sortBy],
    queryFn: async () => {
      // Mock data - replace with actual API call
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Introduction to Wikipedia Editing',
          description: 'Learn the basics of editing Wikipedia articles, understanding policies, and contributing to the world\'s largest encyclopedia.',
          instructor: 'Dr. Sarah Johnson',
          progress: 75,
          totalLessons: 12,
          completedLessons: 9,
          estimatedHours: 8,
          difficulty: 'Beginner',
          category: 'Editing',
          enrolledAt: '2024-01-15',
          lastAccessed: '2024-01-20',
          rating: 4.8,
          isCompleted: false,
        },
        {
          id: '2',
          title: 'Wikipedia Research Methods',
          description: 'Advanced techniques for researching and verifying information for Wikipedia articles.',
          instructor: 'Prof. Michael Chen',
          progress: 100,
          totalLessons: 15,
          completedLessons: 15,
          estimatedHours: 12,
          difficulty: 'Intermediate',
          category: 'Research',
          enrolledAt: '2024-01-10',
          lastAccessed: '2024-01-18',
          rating: 4.9,
          isCompleted: true,
        },
        {
          id: '3',
          title: 'Advanced Wikipedia Administration',
          description: 'Learn about Wikipedia\'s administrative tools, policies, and community management.',
          instructor: 'Admin Lisa Rodriguez',
          progress: 30,
          totalLessons: 20,
          completedLessons: 6,
          estimatedHours: 15,
          difficulty: 'Advanced',
          category: 'Administration',
          enrolledAt: '2024-01-20',
          lastAccessed: '2024-01-21',
          rating: 4.7,
          isCompleted: false,
        },
      ];

      // Apply filters
      let filteredCourses = mockCourses;

      if (searchTerm) {
        filteredCourses = filteredCourses.filter(course =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (filterStatus !== 'all') {
        filteredCourses = filteredCourses.filter(course => {
          switch (filterStatus) {
            case 'completed':
              return course.isCompleted;
            case 'in-progress':
              return !course.isCompleted && course.progress > 0;
            case 'not-started':
              return course.progress === 0;
            default:
              return true;
          }
        });
      }

      // Apply sorting
      filteredCourses.sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return new Date(b.lastAccessed || b.enrolledAt).getTime() - new Date(a.lastAccessed || a.enrolledAt).getTime();
          case 'progress':
            return b.progress - a.progress;
          case 'title':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });

      return filteredCourses;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <LoadingSkeleton className="h-10 flex-1" />
          <LoadingSkeleton className="h-10 w-full sm:w-32" />
          <LoadingSkeleton className="h-10 w-full sm:w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          <LoadingSkeleton variant="card" count={3} />
        </div>
      </div>
    );
  }

  const courses = coursesData || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400';
      case 'Intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400';
      case 'Advanced':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">My Courses</h2>
          <p className="text-sm text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <BookOpen className="h-4 w-4 mr-2" />
          Browse More Courses
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[140px] h-10">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="not-started">Not Started</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[120px] h-10">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="title">Title</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Start your learning journey by enrolling in a course'
              }
            </p>
            <Button>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1 line-clamp-2">
                      {course.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Continue Learning
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Progress
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {course.completedLessons} / {course.totalLessons} lessons
                    </span>
                    {course.isCompleted && (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Course Info */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.estimatedHours}h
                  </Badge>
                </div>

                {/* Instructor & Rating */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <User className="h-3 w-3" />
                    {course.instructor}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-gray-600">{course.rating}</span>
                  </div>
                </div>

                {/* Last Accessed */}
                {course.lastAccessed && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Last accessed {formatDate(course.lastAccessed)}
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  className="w-full" 
                  variant={course.isCompleted ? "outline" : "default"}
                  size="sm"
                >
                  {course.isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Review Course
                    </>
                  ) : course.progress > 0 ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Continue Learning
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Course
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledCourses;

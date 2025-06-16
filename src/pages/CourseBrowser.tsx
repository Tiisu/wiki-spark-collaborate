import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  ChevronLeft,
  Play
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { courseApi } from '@/lib/api';
import Header from '@/components/Header';
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
  estimatedHours: number;
  difficulty: string;
  category: string;
  rating: number;
  level: string;
  tags: string[];
  isPublished: boolean;
}

const CourseBrowser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['available-courses', searchTerm, categoryFilter, levelFilter, currentPage],
    queryFn: async () => {
      return courseApi.getCourses({
        page: currentPage,
        limit: 12,
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(levelFilter !== 'all' && { level: levelFilter }),
        ...(searchTerm && { search: searchTerm })
      });
    }
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return courseApi.enrollInCourse(courseId);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Successfully enrolled in course!',
      });
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to enroll in course',
        variant: 'destructive',
      });
    }
  });

  // Transform courses to ensure they have an id field
  const courses = (coursesData?.courses || []).map(course => ({
    ...course,
    id: course.id || (course as any)._id // Handle both id and _id from backend
  }));
  const pagination = coursesData?.pagination;

  const getDifficultyColor = (difficulty: string | undefined) => {
    if (!difficulty) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }

    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Browse Courses</h1>
              <p className="text-muted-foreground">
                Discover and enroll in courses to enhance your Wikipedia editing skills
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Wikipedia Editing">Wikipedia Editing</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Citations">Citations</SelectItem>
                  <SelectItem value="Community">Community</SelectItem>
                </SelectContent>
              </Select>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria or check back later for new courses.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="group hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="mt-2 line-clamp-3">
                        {course.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-0 space-y-4">
                  {/* Course Info */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge className={getDifficultyColor(course.difficulty)}>
                      {course.difficulty || 'Unknown'}
                    </Badge>
                    <Badge variant="outline">
                      {course.category}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {course.estimatedHours}h
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.totalLessons} lessons
                    </Badge>
                  </div>

                  {/* Instructor and Rating */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{getInstructorName(course.instructor)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  {/* Free Access Badge */}
                  <div className="flex items-center gap-2 text-green-600">
                    <span className="text-lg font-bold">✓ Free</span>
                    <span className="text-sm text-muted-foreground">Open to everyone</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => {
                        if (!course.id) {
                          console.error('Course ID is missing:', course);
                          return;
                        }
                        enrollMutation.mutate(course.id);
                      }}
                      disabled={enrollMutation.isPending || !course.id}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Enroll Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (course.id) {
                          navigate(`/course/${course.id}`);
                        }
                      }}
                      disabled={!course.id}
                    >
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {pagination.pages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
              disabled={currentPage === pagination.pages}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseBrowser;

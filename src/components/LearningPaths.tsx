
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Users, Clock, Star, ArrowRight, AlertCircle } from 'lucide-react';
import { courseApi, Course } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const FeaturedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses with limit of 6 for featured section
        const response = await courseApi.getCourses({
          limit: 6,
          page: 1
        });

        setCourses(response.courses || []);
      } catch (err) {
        console.error('Error fetching featured courses:', err);
        setError('Failed to load courses. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load featured courses",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, [toast]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const getLevelColor = (level: string): string => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'intermediate':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'advanced':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getCategoryIcon = (category: string) => {
    // Simple mapping for common categories
    if (category?.toLowerCase().includes('basic') || category?.toLowerCase().includes('fundamental')) {
      return <BookOpen className="h-4 w-4" />;
    }
    if (category?.toLowerCase().includes('community') || category?.toLowerCase().includes('policy')) {
      return <Users className="h-4 w-4" />;
    }
    return <BookOpen className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <section id="featured-courses" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Courses</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start your Wikipedia journey with our most popular courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="h-48 bg-gray-200">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="featured-courses" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Featured Courses</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Start your Wikipedia journey with our most popular courses
            </p>
          </div>

          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Unable to Load Courses</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-courses" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Featured Courses</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start your Wikipedia journey with our most popular courses designed by expert contributors
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {courses.map((course) => (
            <Card key={course._id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
              {/* Course Image/Header */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
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

                {/* Free Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-green-500 text-white shadow-lg">
                    FREE
                  </Badge>
                </div>
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

                {/* Level Badge */}
                <div className="flex items-center space-x-2 mt-3">
                  <Badge variant="outline" className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  {course.category && (
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                  )}
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
                              ? 'text-yellow-500 fill-current'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">{course.rating.toFixed(1)}</span>
                  </div>
                )}

                {/* Action Button - Redirect to Register */}
                <Link to="/register" className="block">
                  <Button className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Courses Button */}
        <div className="text-center">
          <Link to="/register">
            <Button size="lg" variant="outline" className="px-8">
              View All Courses <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;

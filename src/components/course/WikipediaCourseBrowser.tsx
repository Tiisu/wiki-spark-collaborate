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
  Award,
  Target,
  Globe,
  ChevronRight,
  Play,
  CheckCircle,
  Lock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { courseApi } from '@/lib/api';

interface WikipediaCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail?: string;
  totalLessons: number;
  estimatedHours: number;
  difficulty: string;
  category: string;
  rating: number;
  level: string;
  tags: string[];
  isPublished: boolean;
  wikipediaProject: string;
  prerequisites: string[];
  learningObjectives: string[];
  skillsAcquired: string[];
  difficultyRating: number;
  hasAssessment: boolean;
  passingScore: number;
  enrollmentCount: number;
}

const WikipediaCourseBrowser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('all');

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['wikipedia-courses', searchTerm, categoryFilter, levelFilter, projectFilter, currentPage],
    queryFn: async () => {
      return courseApi.getCourses({
        page: currentPage,
        limit: 12,
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(levelFilter !== 'all' && { level: levelFilter }),
        ...(projectFilter !== 'all' && { wikipediaProject: projectFilter }),
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

  const courses = coursesData?.courses || [];
  const pagination = coursesData?.pagination;

  const getDifficultyColor = (difficulty: string) => {
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

  const getProjectIcon = (project: string) => {
    switch (project) {
      case 'WIKIPEDIA':
        return <Globe className="h-4 w-4" />;
      case 'COMMONS':
        return <BookOpen className="h-4 w-4" />;
      case 'WIKIDATA':
        return <Target className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categoryMap: Record<string, string> = {
      'EDITING_BASICS': 'Editing Basics',
      'WIKITEXT_MARKUP': 'Wikitext Markup',
      'CITATION_SOURCING': 'Citations & Sources',
      'CONTENT_POLICIES': 'Content Policies',
      'CONFLICT_RESOLUTION': 'Conflict Resolution',
      'ADVANCED_EDITING': 'Advanced Editing',
      'COMMONS_MEDIA': 'Media & Commons',
      'WIKIDATA_EDITING': 'Wikidata',
      'ARTICLE_CREATION': 'Article Creation'
    };
    return categoryMap[category] || category;
  };

  const filterCoursesByTab = (courses: WikipediaCourse[]) => {
    switch (activeTab) {
      case 'beginner':
        return courses.filter(course => course.level === 'BEGINNER');
      case 'intermediate':
        return courses.filter(course => course.level === 'INTERMEDIATE');
      case 'advanced':
        return courses.filter(course => course.level === 'ADVANCED');
      case 'sister-projects':
        return courses.filter(course => course.wikipediaProject !== 'WIKIPEDIA');
      default:
        return courses;
    }
  };

  const filteredCourses = filterCoursesByTab(courses);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Wikipedia Learning Paths</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Master Wikipedia editing through structured courses designed by experienced editors. 
          From basic editing to advanced techniques and sister projects.
        </p>
      </div>

      {/* Learning Path Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="sister-projects">Sister Projects</TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="mt-6">
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
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="EDITING_BASICS">Editing Basics</SelectItem>
                  <SelectItem value="WIKITEXT_MARKUP">Wikitext Markup</SelectItem>
                  <SelectItem value="CITATION_SOURCING">Citations & Sources</SelectItem>
                  <SelectItem value="CONTENT_POLICIES">Content Policies</SelectItem>
                  <SelectItem value="CONFLICT_RESOLUTION">Conflict Resolution</SelectItem>
                  <SelectItem value="ADVANCED_EDITING">Advanced Editing</SelectItem>
                  <SelectItem value="COMMONS_MEDIA">Media & Commons</SelectItem>
                  <SelectItem value="WIKIDATA_EDITING">Wikidata</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  <SelectItem value="WIKIPEDIA">Wikipedia</SelectItem>
                  <SelectItem value="COMMONS">Wikimedia Commons</SelectItem>
                  <SelectItem value="WIKIDATA">Wikidata</SelectItem>
                  <SelectItem value="WIKTIONARY">Wiktionary</SelectItem>
                  <SelectItem value="WIKIBOOKS">Wikibooks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Course Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{filteredCourses.length}</div>
                <div className="text-sm text-muted-foreground">Available Courses</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold">
                  {filteredCourses.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Enrollments</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold">
                  {filteredCourses.reduce((sum, course) => sum + course.estimatedHours, 0)}h
                </div>
                <div className="text-sm text-muted-foreground">Total Learning Time</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold">
                  {filteredCourses.filter(course => course.hasAssessment).length}
                </div>
                <div className="text-sm text-muted-foreground">Certified Courses</div>
              </CardContent>
            </Card>
          </div>

          {/* Courses Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
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
              {filteredCourses.map((course) => (
                <Card key={course.id} className="group hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader className="p-6">
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
                        {course.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {getCategoryDisplayName(course.category)}
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

                    {/* Difficulty Rating */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Difficulty</span>
                        <span>{course.difficultyRating}/10</span>
                      </div>
                      <Progress value={course.difficultyRating * 10} className="h-2" />
                    </div>

                    {/* Prerequisites */}
                    {course.prerequisites && course.prerequisites.length > 0 && (
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-orange-600 mb-1">
                          <Lock className="h-3 w-3" />
                          <span className="font-medium">Prerequisites required</span>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Complete {course.prerequisites.length} prerequisite course{course.prerequisites.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}

                    {/* Learning Objectives Preview */}
                    {course.learningObjectives && course.learningObjectives.length > 0 && (
                      <div className="text-sm">
                        <div className="font-medium mb-1">You'll learn to:</div>
                        <ul className="text-muted-foreground text-xs space-y-1">
                          {course.learningObjectives.slice(0, 2).map((objective, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
                              <span className="line-clamp-1">{objective}</span>
                            </li>
                          ))}
                          {course.learningObjectives.length > 2 && (
                            <li className="text-blue-600">+{course.learningObjectives.length - 2} more objectives</li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Instructor and Rating */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.instructor}</span>
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
                        onClick={() => enrollMutation.mutate(course.id)}
                        disabled={enrollMutation.isPending}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Enroll Now
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/course/${course.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
    </div>
  );
};

export default WikipediaCourseBrowser;

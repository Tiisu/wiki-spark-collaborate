import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Users,
  Clock,
  Plus,
  CheckSquare,
  Square,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { courseApi, CreateCourseData } from '@/lib/api';
import EditCourseForm from '@/components/admin/EditCourseForm';
import CourseContentManager from '@/components/admin/CourseContentManager';

interface InstructorCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  totalLessons?: number;
  estimatedHours?: number;
  tags?: string[];
  price?: number;
  duration?: number;
  enrollmentCount?: number;
}

const InstructorCourseManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCourse, setEditingCourse] = useState<InstructorCourse | null>(null);
  const [managingContent, setManagingContent] = useState<InstructorCourse | null>(null);

  // Bulk operations state
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<'publish' | 'unpublish' | 'delete' | null>(null);

  // Fetch instructor's courses
  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['instructor-courses', currentPage, statusFilter, categoryFilter, levelFilter, sortBy, sortOrder],
    queryFn: async () => {
      const result = await courseApi.getInstructorCourses({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(levelFilter !== 'all' && { level: levelFilter }),
        sortBy,
        sortOrder
      });
      console.log('Instructor courses data:', result);
      return result;
    }
  });

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return courseApi.deleteCourse(courseId);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Toggle publish status mutation
  const togglePublishMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return courseApi.togglePublish(courseId);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course status updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async ({ operation, courseIds }: { operation: string; courseIds: string[] }) => {
      const promises = courseIds.map(courseId => {
        switch (operation) {
          case 'publish':
          case 'unpublish':
            return courseApi.togglePublish(courseId);
          case 'delete':
            return courseApi.deleteCourse(courseId);
          default:
            throw new Error('Invalid operation');
        }
      });
      return Promise.all(promises);
    },
    onSuccess: (_, { operation, courseIds }) => {
      const operationText = operation === 'delete' ? 'deleted' :
                           operation === 'publish' ? 'published' : 'unpublished';
      toast({
        title: 'Success',
        description: `${courseIds.length} course(s) ${operationText} successfully`,
      });
      setSelectedCourses(new Set());
      setBulkOperation(null);
      setShowBulkDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const courses = coursesData?.courses || [];
  const pagination = coursesData?.pagination;

  // Filter courses based on search term and other filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === '' ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      deleteMutation.mutate(courseId);
    }
  };

  const handleTogglePublish = (courseId: string) => {
    togglePublishMutation.mutate(courseId);
  };

  // Bulk operation handlers
  const handleSelectCourse = (courseId: string, checked: boolean) => {
    const newSelected = new Set(selectedCourses);
    if (checked) {
      newSelected.add(courseId);
    } else {
      newSelected.delete(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourses(new Set(filteredCourses.map(course => course.id)));
    } else {
      setSelectedCourses(new Set());
    }
  };

  const handleBulkOperation = (operation: 'publish' | 'unpublish' | 'delete') => {
    if (selectedCourses.size === 0) {
      toast({
        title: 'Error',
        description: 'Please select courses to perform bulk operation',
        variant: 'destructive',
      });
      return;
    }

    if (operation === 'delete') {
      setShowBulkDeleteDialog(true);
    } else {
      setBulkOperation(operation);
      bulkOperationMutation.mutate({
        operation,
        courseIds: Array.from(selectedCourses)
      });
    }
  };

  const confirmBulkDelete = () => {
    bulkOperationMutation.mutate({
      operation: 'delete',
      courseIds: Array.from(selectedCourses)
    });
  };

  if (editingCourse) {
    return (
      <EditCourseForm
        course={editingCourse}
        onClose={() => setEditingCourse(null)}
        onSuccess={() => {
          setEditingCourse(null);
          queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
        }}
      />
    );
  }

  if (managingContent) {
    return (
      <CourseContentManager
        courseId={managingContent.id}
        courseTitle={managingContent.title}
        onClose={() => setManagingContent(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Failed to load courses. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">My Courses</CardTitle>
          <CardDescription>
            Manage your Wikipedia education courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="space-y-4 mb-6">
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
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Wikipedia Basics">Wikipedia Basics</SelectItem>
                    <SelectItem value="Advanced Editing">Advanced Editing</SelectItem>
                    <SelectItem value="Content Creation">Content Creation</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[120px]">
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
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="updatedAt">Updated Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="enrollmentCount">Enrollments</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Desc</SelectItem>
                  <SelectItem value="asc">Asc</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Operations Toolbar */}
          {selectedCourses.size > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900">
                  {selectedCourses.size} course(s) selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCourses(new Set())}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('publish')}
                  disabled={bulkOperationMutation.isPending}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Publish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('unpublish')}
                  disabled={bulkOperationMutation.isPending}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  Unpublish
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkOperation('delete')}
                  disabled={bulkOperationMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {filteredCourses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No courses match your search criteria.' : 'You haven\'t created any courses yet.'}
              </p>
              {!searchTerm && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-4">
                {filteredCourses.map((course: InstructorCourse) => (
                  <Card key={course.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">
                          {course.title}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {course.category} • {course.level}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={course.isPublished ? "default" : "secondary"}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrollmentCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {course.totalLessons || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.estimatedHours || 0}h
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingCourse(course)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Course
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setManagingContent(course)}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Manage Content
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTogglePublish(course.id)}>
                            {course.isPublished ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedCourses.size === filteredCourses.length && filteredCourses.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="min-w-[200px]">Course</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[100px] hidden lg:table-cell">Students</TableHead>
                      <TableHead className="min-w-[100px] hidden md:table-cell">Lessons</TableHead>
                      <TableHead className="min-w-[100px] hidden xl:table-cell">Duration</TableHead>
                      <TableHead className="text-right min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCourses.map((course: InstructorCourse) => (
                      <TableRow key={course.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCourses.has(course.id)}
                            onCheckedChange={(checked) => handleSelectCourse(course.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="min-w-[200px]">
                          <div>
                            <div className="font-semibold text-sm">
                              {course.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {course.category} • {course.level}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.isPublished ? "default" : "secondary"}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrollmentCount || 0}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {course.totalLessons || 0}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.estimatedHours || 0}h
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingCourse(course)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Course
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setManagingContent(course)}>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Manage Content
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePublish(course.id)}>
                                {course.isPublished ? (
                                  <>
                                    <EyeOff className="mr-2 h-4 w-4" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteCourse(course.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCourses.size} course(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBulkDelete}
              disabled={bulkOperationMutation.isPending}
            >
              {bulkOperationMutation.isPending ? 'Deleting...' : 'Delete Courses'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorCourseManagement;

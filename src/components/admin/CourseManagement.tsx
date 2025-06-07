import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Search,
  Filter,
  Plus
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
import { useToast } from '@/hooks/use-toast';
import { adminApi, courseApi, CreateCourseData } from '@/lib/api';
import EditCourseForm from './EditCourseForm';
import CreateCourseForm from './CreateCourseForm';

interface AdminCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  instructor?: string;
  totalLessons?: number;
  estimatedHours?: number;
  tags?: string[];
  price?: number;
  duration?: number;
}

const CourseManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: coursesData, isLoading, error } = useQuery({
    queryKey: ['admin-courses', currentPage, statusFilter],
    queryFn: async () => {
      const result = await adminApi.getCourses({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter })
      });
      console.log('Admin courses data:', result);
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
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Toggle publish mutation
  const togglePublishMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return courseApi.togglePublish(courseId);
    },
    onSuccess: (data) => {
      toast({
        title: 'Success',
        description: `Course ${data.isPublished ? 'published' : 'unpublished'} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ courseId, courseData }: { courseId: string; courseData: Partial<CreateCourseData> }) => {
      return courseApi.updateCourse(courseId, courseData);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      setShowEditDialog(false);
      setEditingCourse(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleEditCourse = (course: AdminCourse) => {
    setEditingCourse(course);
    setShowEditDialog(true);
  };

  const handleUpdateCourse = (courseData: Partial<CreateCourseData>) => {
    if (editingCourse) {
      updateCourseMutation.mutate({
        courseId: editingCourse.id,
        courseData
      });
    }
  };

  console.log('coursesData structure:', coursesData);
  const courses = coursesData?.courses || [];
  const pagination = coursesData?.pagination;
  console.log('Extracted courses:', courses);

  const filteredCourses = courses.filter((course: AdminCourse) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log('Filtered courses:', filteredCourses);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ADVANCED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>
              Manage all courses on the platform
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Course
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Courses Table */}
        {isLoading ? (
          <div className="text-center py-8">Loading courses...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading courses: {error.message}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No courses found. Total courses from API: {courses?.length || 0}
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course: AdminCourse) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{course.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {course.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(course.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => togglePublishMutation.mutate(course.id)}
                            disabled={togglePublishMutation.isPending}
                          >
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
                          <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
                                deleteMutation.mutate(course.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2">
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
      </CardContent>

      {/* Create Course Dialog */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Create New Course</h2>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                ×
              </Button>
            </div>
            <div className="p-4">
              <CreateCourseForm onSuccess={() => setShowCreateForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Course Dialog */}
      {editingCourse && (
        <EditCourseForm
          course={editingCourse}
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingCourse(null);
          }}
          onSubmit={handleUpdateCourse}
          isLoading={updateCourseMutation.isPending}
        />
      )}
    </Card>
  );
};

export default CourseManagement;

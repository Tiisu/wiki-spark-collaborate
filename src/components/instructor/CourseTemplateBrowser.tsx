import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Users, 
  BookOpen,
  Star,
  ArrowLeft
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { courseTemplateApi, CourseTemplate } from '@/lib/api';

interface CourseTemplateBrowserProps {
  onClose: () => void;
  onCourseCreated?: () => void;
}

const CourseTemplateBrowser: React.FC<CourseTemplateBrowserProps> = ({
  onClose,
  onCourseCreated
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<CourseTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');

  // Fetch templates
  const { data: templatesData, isLoading, error } = useQuery({
    queryKey: ['course-templates', searchTerm, categoryFilter, levelFilter],
    queryFn: () => courseTemplateApi.getTemplates({
      search: searchTerm || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      level: levelFilter !== 'all' ? levelFilter : undefined,
      limit: 20
    }),
  });

  // Create course from template mutation
  const createCourseMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; templateId: string }) =>
      courseTemplateApi.createCourseFromTemplate(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course created from template successfully!',
      });
      setShowCreateDialog(false);
      setSelectedTemplate(null);
      setCourseTitle('');
      setCourseDescription('');
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      onCourseCreated?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create course from template',
        variant: 'destructive',
      });
    }
  });

  const templates = templatesData?.templates || [];

  const handleUseTemplate = (template: CourseTemplate) => {
    setSelectedTemplate(template);
    setCourseTitle(`${template.name} - Copy`);
    setCourseDescription(template.description);
    setShowCreateDialog(true);
  };

  const handleCreateCourse = () => {
    if (!selectedTemplate || !courseTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a course title',
        variant: 'destructive',
      });
      return;
    }

    createCourseMutation.mutate({
      title: courseTitle.trim(),
      description: courseDescription.trim() || undefined,
      templateId: selectedTemplate._id
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Failed to load templates. Please try again.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">Course Templates</h2>
            <p className="text-sm text-muted-foreground">
              Choose a template to quickly create a new course
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
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

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'No templates match your search criteria.' : 'No templates available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      by {template.createdBy.firstName} {template.createdBy.lastName}
                    </CardDescription>
                  </div>
                  {template.isPublic && (
                    <Badge variant="secondary" className="ml-2">
                      Public
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {template.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {template.modules.length} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.round(template.estimatedDuration / 60)}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {template.usageCount} uses
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge variant="outline">{template.category}</Badge>
                    <Badge variant="outline">{template.level}</Badge>
                  </div>
                  <Button size="sm" onClick={() => handleUseTemplate(template)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Course from Template</DialogTitle>
            <DialogDescription>
              Create a new course based on "{selectedTemplate?.name}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="courseTitle">Course Title</Label>
              <Input
                id="courseTitle"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                placeholder="Enter course title"
              />
            </div>
            <div>
              <Label htmlFor="courseDescription">Course Description (Optional)</Label>
              <Input
                id="courseDescription"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Enter course description"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCourse}
              disabled={createCourseMutation.isPending || !courseTitle.trim()}
            >
              {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseTemplateBrowser;

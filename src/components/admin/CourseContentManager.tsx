import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  HelpCircle,
  ClipboardList,
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { moduleApi, lessonApi, ModuleData, LessonData, CreateModuleData, CreateLessonData } from '@/lib/api';
import ModuleForm from './ModuleForm';
import LessonForm from './LessonForm';

interface CourseContentManagerProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
}

const getLessonTypeIcon = (type: string) => {
  switch (type) {
    case 'TEXT':
      return <FileText className="h-4 w-4" />;
    case 'VIDEO':
      return <Video className="h-4 w-4" />;
    case 'QUIZ':
      return <HelpCircle className="h-4 w-4" />;
    case 'ASSIGNMENT':
      return <ClipboardList className="h-4 w-4" />;
    case 'INTERACTIVE':
      return <Zap className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const CourseContentManager: React.FC<CourseContentManagerProps> = ({
  courseId,
  courseTitle,
  onClose
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleData | null>(null);
  const [showCreateLesson, setShowCreateLesson] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<LessonData | null>(null);

  // Fetch modules
  const { data: modulesData, isLoading: modulesLoading } = useQuery({
    queryKey: ['course-modules', courseId],
    queryFn: () => moduleApi.getModules(courseId),
  });

  // Fetch lessons for expanded modules
  const expandedModuleIds = Array.from(expandedModules);
  const lessonQueries = useQuery({
    queryKey: ['course-lessons', courseId, expandedModuleIds],
    queryFn: async () => {
      const lessonsData: Record<string, LessonData[]> = {};
      
      for (const moduleId of expandedModuleIds) {
        try {
          const response = await lessonApi.getLessons(courseId, moduleId);
          lessonsData[moduleId] = response.lessons;
        } catch (error) {
          console.error(`Failed to fetch lessons for module ${moduleId}:`, error);
          lessonsData[moduleId] = [];
        }
      }
      
      return lessonsData;
    },
    enabled: expandedModuleIds.length > 0,
  });

  // Create module mutation
  const createModuleMutation = useMutation({
    mutationFn: (moduleData: CreateModuleData) => moduleApi.createModule(courseId, moduleData),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Module created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
      setShowCreateModule(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update module mutation
  const updateModuleMutation = useMutation({
    mutationFn: ({ moduleId, moduleData }: { moduleId: string; moduleData: Partial<CreateModuleData> }) =>
      moduleApi.updateModule(courseId, moduleId, moduleData),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Module updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
      setEditingModule(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete module mutation
  const deleteModuleMutation = useMutation({
    mutationFn: (moduleId: string) => moduleApi.deleteModule(courseId, moduleId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Module deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Toggle module publish mutation
  const toggleModulePublishMutation = useMutation({
    mutationFn: (moduleId: string) => moduleApi.togglePublish(courseId, moduleId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Module publish status updated',
      });
      queryClient.invalidateQueries({ queryKey: ['course-modules', courseId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Create lesson mutation
  const createLessonMutation = useMutation({
    mutationFn: ({ moduleId, lessonData }: { moduleId: string; lessonData: CreateLessonData }) =>
      lessonApi.createLesson(courseId, moduleId, lessonData),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lesson created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
      setShowCreateLesson(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update lesson mutation
  const updateLessonMutation = useMutation({
    mutationFn: ({ moduleId, lessonId, lessonData }: {
      moduleId: string;
      lessonId: string;
      lessonData: Partial<CreateLessonData>
    }) => lessonApi.updateLesson(courseId, moduleId, lessonId, lessonData),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lesson updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
      setEditingLesson(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete lesson mutation
  const deleteLessonMutation = useMutation({
    mutationFn: ({ moduleId, lessonId }: { moduleId: string; lessonId: string }) =>
      lessonApi.deleteLesson(courseId, moduleId, lessonId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lesson deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Toggle lesson publish mutation
  const toggleLessonPublishMutation = useMutation({
    mutationFn: ({ moduleId, lessonId }: { moduleId: string; lessonId: string }) => 
      lessonApi.togglePublish(courseId, moduleId, lessonId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Lesson publish status updated',
      });
      queryClient.invalidateQueries({ queryKey: ['course-lessons', courseId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleDeleteModule = (module: ModuleData) => {
    if (window.confirm(`Are you sure you want to delete "${module.title}"? This will also delete all lessons in this module.`)) {
      deleteModuleMutation.mutate(module.id);
    }
  };

  const handleDeleteLesson = (moduleId: string, lesson: LessonData) => {
    if (window.confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
      deleteLessonMutation.mutate({ moduleId, lessonId: lesson.id });
    }
  };

  const handleCreateModule = (moduleData: CreateModuleData) => {
    createModuleMutation.mutate(moduleData);
  };

  const handleUpdateModule = (moduleData: CreateModuleData) => {
    if (editingModule) {
      updateModuleMutation.mutate({
        moduleId: editingModule.id,
        moduleData
      });
    }
  };

  const handleCreateLesson = (lessonData: CreateLessonData) => {
    if (showCreateLesson) {
      createLessonMutation.mutate({
        moduleId: showCreateLesson,
        lessonData
      });
    }
  };

  const handleUpdateLesson = (lessonData: CreateLessonData) => {
    if (editingLesson) {
      updateLessonMutation.mutate({
        moduleId: editingLesson.moduleId,
        lessonId: editingLesson.id,
        lessonData
      });
    }
  };

  const modules = modulesData?.modules || [];
  const lessons = lessonQueries.data || {};

  if (modulesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Course Content Manager
          </h2>
          <p className="text-muted-foreground mt-1">
            Managing content for: <span className="font-medium">{courseTitle}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModule(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Module
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start building your course by adding modules and lessons.
              </p>
              <Button onClick={() => setShowCreateModule(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create First Module
              </Button>
            </CardContent>
          </Card>
        ) : (
          modules.map((module) => (
            <Card key={module.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleModuleExpansion(module.id)}
                      className="p-1"
                    >
                      {expandedModules.has(module.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {module.title}
                        <Badge variant={module.isPublished ? "default" : "secondary"}>
                          {module.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </CardTitle>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {module.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Order: {module.order} • {module.lessonCount} lesson{module.lessonCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleModulePublishMutation.mutate(module.id)}
                      disabled={toggleModulePublishMutation.isPending}
                    >
                      {module.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingModule(module)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModule(module)}
                      disabled={deleteModuleMutation.isPending}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateLesson(module.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Lesson
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Lessons */}
              {expandedModules.has(module.id) && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    {lessons[module.id]?.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No lessons in this module yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateLesson(module.id)}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add First Lesson
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {lessons[module.id]?.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {getLessonTypeIcon(lesson.type)}
                              <div>
                                <h4 className="font-medium flex items-center gap-2">
                                  {lesson.title}
                                  <Badge variant={lesson.isPublished ? "default" : "secondary"} className="text-xs">
                                    {lesson.isPublished ? "Published" : "Draft"}
                                  </Badge>
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.type} • Order: {lesson.order}
                                  {lesson.duration && ` • ${lesson.duration} min`}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleLessonPublishMutation.mutate({ 
                                  moduleId: module.id, 
                                  lessonId: lesson.id 
                                })}
                                disabled={toggleLessonPublishMutation.isPending}
                              >
                                {lesson.isPublished ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingLesson(lesson)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLesson(module.id, lesson)}
                                disabled={deleteLessonMutation.isPending}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Module Forms */}
      <ModuleForm
        isOpen={showCreateModule}
        onClose={() => setShowCreateModule(false)}
        onSubmit={handleCreateModule}
        isLoading={createModuleMutation.isPending}
        existingOrders={modules.map(m => m.order)}
      />

      <ModuleForm
        module={editingModule || undefined}
        isOpen={!!editingModule}
        onClose={() => setEditingModule(null)}
        onSubmit={handleUpdateModule}
        isLoading={updateModuleMutation.isPending}
        existingOrders={modules.filter(m => m.id !== editingModule?.id).map(m => m.order)}
      />

      {/* Lesson Forms */}
      <LessonForm
        isOpen={!!showCreateLesson}
        onClose={() => setShowCreateLesson(null)}
        onSubmit={handleCreateLesson}
        isLoading={createLessonMutation.isPending}
        existingOrders={showCreateLesson ? (lessons[showCreateLesson] || []).map(l => l.order) : []}
      />

      <LessonForm
        lesson={editingLesson || undefined}
        isOpen={!!editingLesson}
        onClose={() => setEditingLesson(null)}
        onSubmit={handleUpdateLesson}
        isLoading={updateLessonMutation.isPending}
        existingOrders={editingLesson ?
          (lessons[editingLesson.moduleId] || [])
            .filter(l => l.id !== editingLesson.id)
            .map(l => l.order) : []
        }
      />
    </div>
  );
};

export default CourseContentManager;

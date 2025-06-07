import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, BookOpen, Tag, DollarSign, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { courseApi, CreateCourseData } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface CreateCourseFormProps {
  onSuccess?: () => void;
}

const CreateCourseForm: React.FC<CreateCourseFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CreateCourseData>();

  const createCourseMutation = useMutation({
    mutationFn: async (data: CreateCourseData) => {
      return courseApi.createCourse(data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Course created successfully!',
      });
      reset();
      setTags([]);
      // Invalidate admin courses query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      // Call the onSuccess callback if provided
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error('Course creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create course',
        variant: 'destructive',
      });
    }
  });

  const onSubmit = (data: CreateCourseData) => {
    // Check authentication
    if (!isAuthenticated || !user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create courses',
        variant: 'destructive',
      });
      return;
    }

    // Ensure all required fields are present
    if (!data.level) {
      toast({
        title: 'Error',
        description: 'Please select a difficulty level',
        variant: 'destructive',
      });
      return;
    }

    // Convert string values to numbers and ensure proper types
    const courseData: CreateCourseData = {
      title: data.title,
      description: data.description,
      level: data.level,
      category: data.category,
      tags,
      price: data.price && !isNaN(Number(data.price)) ? Number(data.price) : 0,
      duration: data.duration && !isNaN(Number(data.duration)) ? Number(data.duration) : undefined
    };

    console.log('Submitting course data:', courseData);

    createCourseMutation.mutate(courseData);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Create New Course
        </CardTitle>
        <CardDescription>
          Create a new course for the Wiki Spark Collaborate platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Course title is required' })}
                placeholder="Enter course title"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                {...register('category', { required: 'Category is required' })}
                placeholder="e.g., Wikipedia Editing, Research"
              />
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Describe what students will learn in this course"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Level and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level *</Label>
              <Select onValueChange={(value) => setValue('level', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {errors.level && (
                <p className="text-sm text-red-600">{errors.level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Duration (minutes)
              </Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', {
                  min: 1,
                  valueAsNumber: true
                })}
                placeholder="e.g., 120"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Price (USD)
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', {
                  min: 0,
                  valueAsNumber: true
                })}
                placeholder="0.00 (free)"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags (press Enter)"
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add Tag
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setTags([]);
              }}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={createCourseMutation.isPending}
              className="min-w-[120px]"
            >
              {createCourseMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Course'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateCourseForm;

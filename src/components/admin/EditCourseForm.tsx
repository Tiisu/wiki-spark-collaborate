import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, BookOpen, X, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateCourseData } from '@/lib/api';

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

const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  price: z.number().min(0, 'Price must be 0 or greater').optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
});

interface EditCourseFormProps {
  course: AdminCourse;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseData: Partial<CreateCourseData>) => void;
  isLoading: boolean;
}

const EditCourseForm: React.FC<EditCourseFormProps> = ({
  course,
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [tags, setTags] = useState<string[]>(course.tags || []);
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CreateCourseData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
      price: course.price || 0,
      duration: course.duration || undefined
    }
  });

  // Reset form when course changes
  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
        price: course.price || 0,
        duration: course.duration || undefined
      });
      setTags(course.tags || []);
    }
  }, [course, reset]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFormSubmit = (data: CreateCourseData) => {
    const courseData: Partial<CreateCourseData> = {
      title: data.title,
      description: data.description,
      level: data.level,
      category: data.category,
      tags,
      price: data.price && !isNaN(Number(data.price)) ? Number(data.price) : 0,
      duration: data.duration && !isNaN(Number(data.duration)) ? Number(data.duration) : undefined
    };

    onSubmit(courseData);
  };

  const selectedLevel = watch('level');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Edit Course
          </DialogTitle>
          <DialogDescription>
            Update the course information below
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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

          {/* Level and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="level">Difficulty Level *</Label>
              <Select
                value={selectedLevel}
                onValueChange={(value) => setValue('level', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
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
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register('duration', { valueAsNumber: true })}
                placeholder="e.g., 120"
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                'Update Course'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCourseForm;

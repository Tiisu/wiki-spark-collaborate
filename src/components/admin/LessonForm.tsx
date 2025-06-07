import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, FileText, Video, HelpCircle, ClipboardList, Zap } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateLessonData, LessonData } from '@/lib/api';

const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['TEXT', 'VIDEO', 'INTERACTIVE', 'QUIZ', 'ASSIGNMENT']),
  videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  order: z.number().min(1, 'Order must be at least 1'),
});

interface LessonFormProps {
  lesson?: LessonData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lessonData: CreateLessonData) => void;
  isLoading: boolean;
  existingOrders: number[];
}

const lessonTypes = [
  { value: 'TEXT', label: 'Text Content', icon: FileText },
  { value: 'VIDEO', label: 'Video Lesson', icon: Video },
  { value: 'INTERACTIVE', label: 'Interactive Content', icon: Zap },
  { value: 'QUIZ', label: 'Quiz', icon: HelpCircle },
  { value: 'ASSIGNMENT', label: 'Assignment', icon: ClipboardList },
];

const LessonForm: React.FC<LessonFormProps> = ({
  lesson,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  existingOrders
}) => {
  const isEditing = !!lesson;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<CreateLessonData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || '',
      content: lesson?.content || '',
      type: lesson?.type || 'TEXT',
      videoUrl: lesson?.videoUrl || '',
      duration: lesson?.duration || undefined,
      order: lesson?.order || Math.max(...existingOrders, 0) + 1
    }
  });

  React.useEffect(() => {
    if (lesson) {
      reset({
        title: lesson.title,
        content: lesson.content,
        type: lesson.type,
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration || undefined,
        order: lesson.order
      });
    } else {
      reset({
        title: '',
        content: '',
        type: 'TEXT',
        videoUrl: '',
        duration: undefined,
        order: Math.max(...existingOrders, 0) + 1
      });
    }
  }, [lesson, reset, existingOrders]);

  const handleFormSubmit = (data: CreateLessonData) => {
    // Clean up the data
    const cleanData = {
      ...data,
      videoUrl: data.videoUrl || undefined,
      duration: data.duration || undefined
    };
    onSubmit(cleanData);
  };

  const selectedType = watch('type');
  const orderValue = watch('order');
  const isOrderConflict = !isEditing && existingOrders.includes(orderValue);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the lesson information below'
              : 'Add a new lesson to this module'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Lesson Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="e.g., Creating Your First Wikipedia Article"
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Lesson Type *</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson type" />
                </SelectTrigger>
                <SelectContent>
                  {lessonTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              {...register('content')}
              placeholder="Enter the lesson content. You can use markdown formatting."
              rows={8}
              className="font-mono text-sm"
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Supports markdown formatting for rich text content
            </p>
          </div>

          {/* Video URL (conditional) */}
          {selectedType === 'VIDEO' && (
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                {...register('videoUrl')}
                placeholder="https://youtube.com/watch?v=..."
                type="url"
              />
              {errors.videoUrl && (
                <p className="text-sm text-red-600">{errors.videoUrl.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                YouTube, Vimeo, or direct video file URLs are supported
              </p>
            </div>
          )}

          {/* Duration and Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register('duration', { valueAsNumber: true })}
                placeholder="e.g., 15"
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Estimated time to complete this lesson
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order *</Label>
              <Input
                id="order"
                type="number"
                min="1"
                {...register('order', { valueAsNumber: true })}
                placeholder="1"
              />
              {errors.order && (
                <p className="text-sm text-red-600">{errors.order.message}</p>
              )}
              {isOrderConflict && (
                <p className="text-sm text-amber-600">
                  ⚠️ A lesson with order {orderValue} already exists in this module.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Order within this module
              </p>
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
              disabled={isLoading || isOrderConflict}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Lesson' : 'Create Lesson'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonForm;

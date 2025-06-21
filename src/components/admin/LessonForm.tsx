import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, FileText, Video, HelpCircle, ClipboardList, Zap, FolderOpen, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateLessonData, LessonData, LessonType } from '@/lib/api';

// Import type-specific form components
import TextLessonForm from '@/components/lesson-forms/TextLessonForm';
import VideoLessonForm from '@/components/lesson-forms/VideoLessonForm';
import QuizLessonForm from '@/components/lesson-forms/QuizLessonForm';

// Enhanced lesson schema to support all lesson types
const lessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['TEXT', 'VIDEO', 'QUIZ']),
  videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  duration: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  order: z.number().min(1, 'Order must be at least 1'),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.string()
  })).optional(),
  wikipediaExercise: z.object({
    articleTitle: z.string().optional(),
    initialContent: z.string().optional(),
    targetContent: z.string().optional(),
    instructions: z.string(),
    editingMode: z.enum(['sandbox', 'guided', 'live']),
    allowedActions: z.array(z.string()),
    successCriteria: z.array(z.object({
      type: z.enum(['contains', 'format', 'structure', 'links', 'citations']),
      description: z.string(),
      required: z.boolean()
    }))
  }).optional()
}).refine((data) => {
  // Custom validation for quiz lessons
  if (data.type === 'QUIZ') {
    try {
      const quizData = JSON.parse(data.content);
      if (!quizData.questions || quizData.questions.length === 0) {
        return false;
      }

      // Validate each question has required fields
      for (let i = 0; i < quizData.questions.length; i++) {
        const question = quizData.questions[i];
        if (!question.question || question.question.trim() === '') {
          return false;
        }
        if (!question.correctAnswer || question.correctAnswer.trim() === '') {
          return false;
        }
        // For multiple choice, ensure the correct answer is one of the options
        if (question.type === 'MULTIPLE_CHOICE') {
          if (!question.options || !question.options.includes(question.correctAnswer)) {
            return false;
          }
        }
      }

      return true;
    } catch {
      return false;
    }
  }
  return true;
}, {
  message: 'All quiz questions must have question text and correct answers',
  path: ['content']
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
  {
    value: 'TEXT',
    label: 'Text Content',
    icon: FileText,
    description: 'Rich text lessons with formatting and multimedia',
    color: 'lesson-text',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-800'
  },
  {
    value: 'VIDEO',
    label: 'Video Lesson',
    icon: Video,
    description: 'Video content with interactive elements and transcripts',
    color: 'lesson-video',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  {
    value: 'QUIZ',
    label: 'Interactive Quiz',
    icon: HelpCircle,
    description: 'Engaging quizzes with multiple question types and feedback',
    color: 'lesson-quiz',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
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
      description: lesson?.description || '',
      content: lesson?.content || '',
      type: lesson?.type || 'TEXT',
      videoUrl: lesson?.videoUrl || '',
      duration: lesson?.duration || undefined,
      order: lesson?.order || Math.max(...existingOrders, 0) + 1,
      resources: lesson?.resources || []
    }
  });

  React.useEffect(() => {
    if (lesson) {
      reset({
        title: lesson.title,
        description: lesson.description || '',
        content: lesson.content,
        type: lesson.type,
        videoUrl: lesson.videoUrl || '',
        duration: lesson.duration || undefined,
        order: lesson.order,
        resources: lesson.resources || [],
        wikipediaExercise: lesson.wikipediaExercise,
        interactiveElements: lesson.interactiveElements || [],
        assessmentCriteria: lesson.assessmentCriteria || []
      });
    } else {
      reset({
        title: '',
        description: '',
        content: '',
        type: 'TEXT',
        videoUrl: '',
        duration: undefined,
        order: Math.max(...existingOrders, 0) + 1,
        resources: [],
        wikipediaExercise: undefined,
        interactiveElements: [],
        assessmentCriteria: []
      });
    }
  }, [lesson, reset, existingOrders]);

  const handleFormSubmit = (data: CreateLessonData) => {
    // Clean up the data based on lesson type
    const cleanData: CreateLessonData = {
      ...data,
      videoUrl: data.videoUrl || undefined,
      duration: data.duration || undefined,
      description: data.description || undefined
    };

    // Only include type-specific fields if they exist
    if (data.resources && data.resources.length > 0) {
      cleanData.resources = data.resources;
    }
    if (data.wikipediaExercise) {
      cleanData.wikipediaExercise = data.wikipediaExercise;
    }
    if (data.interactiveElements && data.interactiveElements.length > 0) {
      cleanData.interactiveElements = data.interactiveElements;
    }
    if (data.assessmentCriteria && data.assessmentCriteria.length > 0) {
      cleanData.assessmentCriteria = data.assessmentCriteria;
    }

    onSubmit(cleanData);
  };

  const selectedType = watch('type');
  const orderValue = watch('order');
  const contentValue = watch('content');
  const isOrderConflict = !isEditing && existingOrders.includes(orderValue);

  // Check if quiz is valid for submission
  const isQuizValid = React.useMemo(() => {
    if (selectedType !== 'QUIZ') return true;

    try {
      const quizData = JSON.parse(contentValue || '{}');
      if (!quizData.questions || quizData.questions.length === 0) {
        return false;
      }

      return quizData.questions.every((q: any) =>
        q.question && q.question.trim() !== '' &&
        q.correctAnswer && q.correctAnswer.trim() !== ''
      );
    } catch {
      return false;
    }
  }, [selectedType, contentValue]);

  // Get the selected lesson type info
  const selectedTypeInfo = lessonTypes.find(type => type.value === selectedType);

  const renderTypeSpecificForm = () => {
    const commonProps = { register, setValue, watch, errors };

    switch (selectedType) {
      case 'TEXT':
        return <TextLessonForm {...commonProps} />;
      case 'VIDEO':
        return <VideoLessonForm {...commonProps} />;
      case 'QUIZ':
        return <QuizLessonForm {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedTypeInfo?.icon && <selectedTypeInfo.icon className="h-5 w-5" />}
            {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the lesson information below'
              : selectedTypeInfo?.description || 'Add a new lesson to this module'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Lesson Information */}
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
                onValueChange={(value) => setValue('type', value as LessonType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lesson type" />
                </SelectTrigger>
                <SelectContent>
                  {lessonTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value} className="p-4">
                        <div className="flex items-start gap-3 w-full">
                          <div className={cn(
                            "p-2 rounded-lg",
                            type.bgColor
                          )}>
                            <Icon className={cn("h-5 w-5", `text-${type.color}`)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {type.label}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {type.description}
                            </div>
                          </div>
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

          {/* Order Field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="order">Lesson Order *</Label>
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

          {/* Type-Specific Form Content */}
          {renderTypeSpecificForm()}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
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
              disabled={isLoading || isOrderConflict || !isQuizValid}
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
            {selectedType === 'QUIZ' && !isQuizValid && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Please complete all quiz questions before creating the lesson
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LessonForm;

import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FileText, BookOpen } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { CreateLessonData } from '@/lib/api';

interface TextLessonFormProps {
  register: UseFormRegister<CreateLessonData>;
  setValue: UseFormSetValue<CreateLessonData>;
  watch: UseFormWatch<CreateLessonData>;
  errors: FieldErrors<CreateLessonData>;
}

const TextLessonForm: React.FC<TextLessonFormProps> = ({
  register,
  setValue,
  watch,
  errors
}) => {
  const content = watch('content');
  const description = watch('description');

  return (
    <div className="space-y-6">
      {/* Lesson Description */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lesson Overview
          </CardTitle>
          <CardDescription>
            Provide a brief description of what students will learn in this lesson
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="e.g., In this lesson, students will learn the basics of Wikipedia editing, including how to format text, add links, and cite sources."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This description will be shown to students before they start the lesson
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Rich Text Content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lesson Content
          </CardTitle>
          <CardDescription>
            Create rich, formatted content for your text lesson
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={content || ''}
            onChange={(value) => setValue('content', value)}
            label="Lesson Content *"
            error={errors.content?.message}
            placeholder="Start writing your lesson content here. Use the formatting tools to create engaging, well-structured content for your students."
            height="400px"
          />
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Additional Settings</CardTitle>
          <CardDescription>
            Configure additional options for this text lesson
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Reading Time (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register('duration', { valueAsNumber: true })}
                placeholder="e.g., 10"
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                How long should students expect to spend reading this lesson?
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-sm font-medium">✓ Free & Open Access</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All lessons on WikiWalkthrough are free and open to everyone
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextLessonForm;

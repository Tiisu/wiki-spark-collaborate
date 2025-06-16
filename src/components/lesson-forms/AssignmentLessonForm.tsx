import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ClipboardList, Plus, Trash2, Target, Calendar } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { CreateLessonData, AssessmentCriterion } from '@/lib/api';

interface AssignmentLessonFormProps {
  register: UseFormRegister<CreateLessonData>;
  setValue: UseFormSetValue<CreateLessonData>;
  watch: UseFormWatch<CreateLessonData>;
  errors: FieldErrors<CreateLessonData>;
}

const AssignmentLessonForm: React.FC<AssignmentLessonFormProps> = ({
  register,
  setValue,
  watch,
  errors
}) => {
  const [criteria, setCriteria] = useState<AssessmentCriterion[]>([]);
  const content = watch('content');

  const addCriterion = () => {
    const newCriterion: AssessmentCriterion = {
      criterion: '',
      weight: 25,
      description: ''
    };
    setCriteria([...criteria, newCriterion]);
  };

  const updateCriterion = (index: number, field: keyof AssessmentCriterion, value: any) => {
    const updatedCriteria = [...criteria];
    updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
    setCriteria(updatedCriteria);
  };

  const removeCriterion = (index: number) => {
    const updatedCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(updatedCriteria);
  };

  // Update form data when criteria change
  React.useEffect(() => {
    setValue('assessmentCriteria', criteria);
  }, [criteria, setValue]);

  const totalWeight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);

  return (
    <div className="space-y-6">
      {/* Assignment Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Assignment Overview
          </CardTitle>
          <CardDescription>
            Define the assignment requirements and expectations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Assignment Summary</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Provide a brief summary of what students need to accomplish in this assignment..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Time (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register('duration', { valueAsNumber: true })}
                placeholder="e.g., 2"
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                How long should students expect to spend on this assignment?
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-sm font-medium">✓ Free & Open Access</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All assignments are freely available to all learners
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Assignment Instructions</CardTitle>
          <CardDescription>
            Provide detailed instructions for completing the assignment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={content || ''}
            onChange={(value) => setValue('content', value)}
            label="Instructions *"
            error={errors.content?.message}
            placeholder="Provide clear, step-by-step instructions for the assignment. Include any resources, examples, or guidelines students will need."
            height="400px"
          />
        </CardContent>
      </Card>

      {/* Assessment Criteria */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Assessment Criteria
            {criteria.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                (Total: {totalWeight}%)
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Define how the assignment will be evaluated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {criteria.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No assessment criteria defined</p>
              <Button onClick={addCriterion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Assessment Criterion
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {criteria.map((criterion, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Criterion {index + 1}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCriterion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label>Criterion Name</Label>
                        <Input
                          value={criterion.criterion}
                          onChange={(e) => updateCriterion(index, 'criterion', e.target.value)}
                          placeholder="e.g., Content Quality"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Weight (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={criterion.weight}
                          onChange={(e) => updateCriterion(index, 'weight', Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={criterion.description}
                        onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                        placeholder="Describe what will be evaluated for this criterion..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={addCriterion} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Criterion
              </Button>

              {totalWeight !== 100 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 text-sm">
                    ⚠️ Total weight is {totalWeight}%. Consider adjusting weights to total 100%.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Guidelines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Submission Guidelines</CardTitle>
          <CardDescription>
            Additional information about how students should submit their work
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Submission Process</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Students will submit their work through the platform</li>
              <li>• Submissions can include text, files, and links</li>
              <li>• Instructors will review and provide feedback</li>
              <li>• Students can resubmit if allowed by course settings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentLessonForm;

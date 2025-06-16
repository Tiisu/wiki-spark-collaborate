import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Plus, Trash2, Target, Settings, BookOpen } from 'lucide-react';
import { CreateLessonData, WikipediaExercise, InteractiveElement } from '@/lib/api';

interface InteractiveLessonFormProps {
  register: UseFormRegister<CreateLessonData>;
  setValue: UseFormSetValue<CreateLessonData>;
  watch: UseFormWatch<CreateLessonData>;
  errors: FieldErrors<CreateLessonData>;
}

const InteractiveLessonForm: React.FC<InteractiveLessonFormProps> = ({
  register,
  setValue,
  watch,
  errors
}) => {
  const [wikipediaExercise, setWikipediaExercise] = useState<WikipediaExercise>({
    instructions: '',
    editingMode: 'sandbox',
    allowedActions: [],
    successCriteria: []
  });

  const [interactiveElements, setInteractiveElements] = useState<InteractiveElement[]>([]);

  const allowedActionOptions = [
    { value: 'format', label: 'Text Formatting (bold, italic, etc.)' },
    { value: 'link', label: 'Adding Links' },
    { value: 'cite', label: 'Adding Citations' },
    { value: 'structure', label: 'Page Structure (headings, sections)' },
    { value: 'image', label: 'Adding Images' },
    { value: 'template', label: 'Using Templates' }
  ];

  const addSuccessCriterion = () => {
    const newCriterion = {
      type: 'contains' as const,
      description: '',
      required: true
    };
    setWikipediaExercise(prev => ({
      ...prev,
      successCriteria: [...prev.successCriteria, newCriterion]
    }));
  };

  const updateSuccessCriterion = (index: number, field: string, value: any) => {
    const updatedCriteria = [...wikipediaExercise.successCriteria];
    updatedCriteria[index] = { ...updatedCriteria[index], [field]: value };
    setWikipediaExercise(prev => ({
      ...prev,
      successCriteria: updatedCriteria
    }));
  };

  const removeSuccessCriterion = (index: number) => {
    const updatedCriteria = wikipediaExercise.successCriteria.filter((_, i) => i !== index);
    setWikipediaExercise(prev => ({
      ...prev,
      successCriteria: updatedCriteria
    }));
  };

  const addInteractiveElement = () => {
    const newElement: InteractiveElement = {
      type: 'tooltip',
      trigger: '',
      content: '',
      position: 'auto'
    };
    setInteractiveElements([...interactiveElements, newElement]);
  };

  const updateInteractiveElement = (index: number, field: keyof InteractiveElement, value: any) => {
    const updatedElements = [...interactiveElements];
    updatedElements[index] = { ...updatedElements[index], [field]: value };
    setInteractiveElements(updatedElements);
  };

  const removeInteractiveElement = (index: number) => {
    const updatedElements = interactiveElements.filter((_, i) => i !== index);
    setInteractiveElements(updatedElements);
  };

  // Update form data when exercise data changes
  React.useEffect(() => {
    setValue('wikipediaExercise', wikipediaExercise);
    setValue('interactiveElements', interactiveElements);
  }, [wikipediaExercise, interactiveElements, setValue]);

  return (
    <div className="space-y-6">
      {/* Exercise Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Interactive Exercise Overview
          </CardTitle>
          <CardDescription>
            Configure the basic settings for your interactive Wikipedia exercise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Exercise Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what students will learn and practice in this interactive exercise..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Time (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register('duration', { valueAsNumber: true })}
                placeholder="e.g., 30"
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-sm font-medium">✓ Free & Open Access</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All interactive exercises are freely available to everyone
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wikipedia Exercise Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Wikipedia Exercise Settings
          </CardTitle>
          <CardDescription>
            Configure the Wikipedia editing exercise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="articleTitle">Article Title (Optional)</Label>
              <Input
                id="articleTitle"
                value={wikipediaExercise.articleTitle || ''}
                onChange={(e) => setWikipediaExercise(prev => ({
                  ...prev,
                  articleTitle: e.target.value
                }))}
                placeholder="e.g., Climate Change"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for sandbox practice
              </p>
            </div>

            <div className="space-y-2">
              <Label>Editing Mode</Label>
              <Select
                value={wikipediaExercise.editingMode}
                onValueChange={(value: 'sandbox' | 'guided' | 'live') => 
                  setWikipediaExercise(prev => ({ ...prev, editingMode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox (Safe Practice)</SelectItem>
                  <SelectItem value="guided">Guided (Step-by-step)</SelectItem>
                  <SelectItem value="live">Live (Real Wikipedia)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Exercise Instructions *</Label>
            <Textarea
              value={wikipediaExercise.instructions}
              onChange={(e) => setWikipediaExercise(prev => ({
                ...prev,
                instructions: e.target.value
              }))}
              placeholder="Provide clear instructions for what students should do in this exercise..."
              rows={4}
            />
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Allowed Actions</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {allowedActionOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.value}
                    checked={wikipediaExercise.allowedActions.includes(option.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setWikipediaExercise(prev => ({
                          ...prev,
                          allowedActions: [...prev.allowedActions, option.value]
                        }));
                      } else {
                        setWikipediaExercise(prev => ({
                          ...prev,
                          allowedActions: prev.allowedActions.filter(action => action !== option.value)
                        }));
                      }
                    }}
                  />
                  <Label htmlFor={option.value} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Initial Content (Optional)</Label>
              <Textarea
                value={wikipediaExercise.initialContent || ''}
                onChange={(e) => setWikipediaExercise(prev => ({
                  ...prev,
                  initialContent: e.target.value
                }))}
                placeholder="Starting content for the exercise..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Target Content (Optional)</Label>
              <Textarea
                value={wikipediaExercise.targetContent || ''}
                onChange={(e) => setWikipediaExercise(prev => ({
                  ...prev,
                  targetContent: e.target.value
                }))}
                placeholder="What the final content should look like..."
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Criteria */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Success Criteria ({wikipediaExercise.successCriteria.length})
          </CardTitle>
          <CardDescription>
            Define what students need to accomplish to complete the exercise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {wikipediaExercise.successCriteria.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No success criteria defined</p>
              <Button onClick={addSuccessCriterion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Success Criterion
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {wikipediaExercise.successCriteria.map((criterion, index) => (
                <Card key={index} className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium">Criterion {index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSuccessCriterion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={criterion.type}
                          onValueChange={(value) => updateSuccessCriterion(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contains">Contains Text</SelectItem>
                            <SelectItem value="format">Proper Formatting</SelectItem>
                            <SelectItem value="structure">Page Structure</SelectItem>
                            <SelectItem value="links">Has Links</SelectItem>
                            <SelectItem value="citations">Has Citations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={criterion.description}
                          onChange={(e) => updateSuccessCriterion(index, 'description', e.target.value)}
                          placeholder="Describe what needs to be accomplished..."
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-2">
                      <Checkbox
                        id={`required_${index}`}
                        checked={criterion.required}
                        onCheckedChange={(checked) => updateSuccessCriterion(index, 'required', checked)}
                      />
                      <Label htmlFor={`required_${index}`} className="text-sm">
                        Required for completion
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button onClick={addSuccessCriterion} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Criterion
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveLessonForm;

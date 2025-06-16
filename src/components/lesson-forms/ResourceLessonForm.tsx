import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Plus, Trash2, ExternalLink, FileText, Video, Image, Download } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { CreateLessonData, ResourceItem } from '@/lib/api';

interface ResourceLessonFormProps {
  register: UseFormRegister<CreateLessonData>;
  setValue: UseFormSetValue<CreateLessonData>;
  watch: UseFormWatch<CreateLessonData>;
  errors: FieldErrors<CreateLessonData>;
}

const ResourceLessonForm: React.FC<ResourceLessonFormProps> = ({
  register,
  setValue,
  watch,
  errors
}) => {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const content = watch('content');

  const resourceTypes = [
    { value: 'article', label: 'Article/Blog Post', icon: FileText },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'document', label: 'Document/PDF', icon: Download },
    { value: 'image', label: 'Image/Infographic', icon: Image },
    { value: 'website', label: 'Website/Tool', icon: ExternalLink },
    { value: 'other', label: 'Other', icon: FolderOpen }
  ];

  const addResource = () => {
    const newResource: ResourceItem = {
      title: '',
      url: '',
      type: 'article'
    };
    setResources([...resources, newResource]);
  };

  const updateResource = (index: number, field: keyof ResourceItem, value: string) => {
    const updatedResources = [...resources];
    updatedResources[index] = { ...updatedResources[index], [field]: value };
    setResources(updatedResources);
  };

  const removeResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
  };

  // Update form data when resources change
  React.useEffect(() => {
    setValue('resources', resources);
  }, [resources, setValue]);

  const getResourceIcon = (type: string) => {
    const resourceType = resourceTypes.find(rt => rt.value === type);
    return resourceType ? resourceType.icon : FolderOpen;
  };

  return (
    <div className="space-y-6">
      {/* Resource Collection Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Resource Collection Overview
          </CardTitle>
          <CardDescription>
            Create a curated collection of learning resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Collection Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe this collection of resources and how students should use them..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Review Time (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                {...register('duration', { valueAsNumber: true })}
                placeholder="e.g., 45"
              />
              {errors.duration && (
                <p className="text-sm text-red-600">{errors.duration.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                How long should students spend reviewing these resources?
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <span className="text-sm font-medium">✓ Free & Open Access</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All learning resources are freely available to everyone
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Introduction & Context */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Introduction & Context</CardTitle>
          <CardDescription>
            Provide context and guidance for using these resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={content || ''}
            onChange={(value) => setValue('content', value)}
            label="Introduction Text"
            error={errors.content?.message}
            placeholder="Introduce the resource collection. Explain how students should approach these materials and what they should focus on while reviewing them."
            height="300px"
          />
        </CardContent>
      </Card>

      {/* Resource List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Resources ({resources.length})
          </CardTitle>
          <CardDescription>
            Add and organize the learning resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resources.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <FolderOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">No resources added yet</p>
              <Button onClick={addResource}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Resource
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {resources.map((resource, index) => {
                const IconComponent = getResourceIcon(resource.type);
                return (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <IconComponent className="h-4 w-4" />
                          Resource {index + 1}
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeResource(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Resource Title</Label>
                          <Input
                            value={resource.title}
                            onChange={(e) => updateResource(index, 'title', e.target.value)}
                            placeholder="e.g., Wikipedia Style Guide"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Resource Type</Label>
                          <Select
                            value={resource.type}
                            onValueChange={(value) => updateResource(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {resourceTypes.map((type) => {
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
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>URL</Label>
                        <Input
                          value={resource.url}
                          onChange={(e) => updateResource(index, 'url', e.target.value)}
                          placeholder="https://..."
                          type="url"
                        />
                      </div>

                      {/* Resource Preview */}
                      {resource.url && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ExternalLink className="h-4 w-4" />
                            <span className="truncate">{resource.url}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              <Button onClick={addResource} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Another Resource
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Usage Guidelines</CardTitle>
          <CardDescription>
            Tips for students on how to effectively use these resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Best Practices for Resource Review</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Take notes while reviewing each resource</li>
              <li>• Look for connections between different materials</li>
              <li>• Focus on practical applications to Wikipedia editing</li>
              <li>• Don't hesitate to revisit resources as needed</li>
              <li>• Consider how these resources apply to your current projects</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceLessonForm;

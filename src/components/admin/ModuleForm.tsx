import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateModuleData, ModuleData } from '@/lib/api';

const moduleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  order: z.number().min(1, 'Order must be at least 1'),
});

interface ModuleFormProps {
  module?: ModuleData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moduleData: CreateModuleData) => void;
  isLoading: boolean;
  existingOrders: number[];
}

const ModuleForm: React.FC<ModuleFormProps> = ({
  module,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  existingOrders
}) => {
  const isEditing = !!module;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateModuleData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: module?.title || '',
      description: module?.description || '',
      order: module?.order || Math.max(...existingOrders, 0) + 1
    }
  });

  React.useEffect(() => {
    if (module) {
      reset({
        title: module.title,
        description: module.description || '',
        order: module.order
      });
    } else {
      reset({
        title: '',
        description: '',
        order: Math.max(...existingOrders, 0) + 1
      });
    }
  }, [module, reset, existingOrders]);

  const handleFormSubmit = (data: CreateModuleData) => {
    onSubmit(data);
  };

  const orderValue = watch('order');
  const isOrderConflict = !isEditing && existingOrders.includes(orderValue);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {isEditing ? 'Edit Module' : 'Create New Module'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the module information below'
              : 'Add a new module to organize your course content'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Module Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Introduction to Wikipedia"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of what this module covers (optional)"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Order */}
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
                ⚠️ A module with order {orderValue} already exists. This will cause conflicts.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Determines the order in which modules appear in the course
            </p>
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
                isEditing ? 'Update Module' : 'Create Module'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModuleForm;

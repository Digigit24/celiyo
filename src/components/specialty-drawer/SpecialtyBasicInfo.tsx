// src/components/specialty-drawer/SpecialtyBasicInfo.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { createSpecialty, updateSpecialty } from '@/services/doctor.service';
import type { Specialty } from '@/types/doctor.types';
import { format } from 'date-fns';

const specialtySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  code: z.string().min(1, 'Code is required').max(20, 'Code too long'),
  description: z.string().optional(),
  department: z.string().optional(),
  is_active: z.boolean(),
});

type SpecialtyFormData = z.infer<typeof specialtySchema>;

interface SpecialtyBasicInfoProps {
  specialty: Specialty | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess: () => void;
  onClose: () => void;
}

export default function SpecialtyBasicInfo({ 
  specialty, 
  mode, 
  onSuccess, 
  onClose 
}: SpecialtyBasicInfoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReadOnly = mode === 'view';
  const isCreateMode = mode === 'create';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SpecialtyFormData>({
    resolver: zodResolver(specialtySchema),
    defaultValues: isCreateMode ? {
      name: '',
      code: '',
      description: '',
      department: '',
      is_active: true,
    } : {},
  });

  // Load specialty data into form
  useEffect(() => {
    if (specialty && !isCreateMode) {
      setValue('name', specialty.name);
      setValue('code', specialty.code);
      setValue('description', specialty.description || '');
      setValue('department', specialty.department || '');
      setValue('is_active', specialty.is_active);
    }
  }, [specialty, isCreateMode, setValue]);

  const onSubmit = async (data: SpecialtyFormData) => {
    setIsSubmitting(true);
    try {
      if (isCreateMode) {
        await createSpecialty(data);
        toast.success('Specialty created successfully');
      } else {
        await updateSpecialty(specialty!.id, data);
        toast.success('Specialty updated successfully');
      }
      
      onSuccess();
      if (isCreateMode) {
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save specialty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'PPp');
    } catch {
      return '-';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Specialty Name *
            </Label>
            <Input
              id="name"
              {...register('name')}
              disabled={isReadOnly}
              placeholder="e.g., Cardiology"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">
              Specialty Code *
            </Label>
            <Input
              id="code"
              {...register('code')}
              disabled={isReadOnly || !isCreateMode} // Code can't be changed after creation
              placeholder="e.g., CARD"
              className="font-mono uppercase"
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase();
                setValue('code', e.target.value);
              }}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code.message}</p>
            )}
            {!isCreateMode && (
              <p className="text-xs text-muted-foreground">
                Code cannot be changed after creation
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            {...register('department')}
            disabled={isReadOnly}
            placeholder="e.g., Cardiovascular Sciences"
          />
          {errors.department && (
            <p className="text-sm text-destructive">{errors.department.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Optional: Organizational department or unit
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            disabled={isReadOnly}
            placeholder="Brief description of this medical specialty..."
            rows={4}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label htmlFor="is_active" className="text-base">
              Active Status
            </Label>
            <p className="text-sm text-muted-foreground">
              {watch('is_active') 
                ? 'This specialty is active and can be assigned to doctors' 
                : 'This specialty is inactive and hidden from selection'
              }
            </p>
          </div>
          <Switch
            id="is_active"
            checked={watch('is_active')}
            onCheckedChange={(checked) => setValue('is_active', checked)}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Metadata - Only show in view/edit mode */}
      {!isCreateMode && specialty && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold">Metadata</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Specialty ID:</span>
              <p className="font-medium">{specialty.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Doctors Linked:</span>
              <p className="font-medium">{specialty.doctors_count || 0} doctors</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created At:</span>
              <p className="font-medium">{formatDate(specialty.created_at)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <p className="font-medium">{formatDate(specialty.updated_at)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isCreateMode ? 'Creating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isCreateMode ? 'Create Specialty' : 'Save Changes'}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>💡 Tip:</strong> Specialty codes should be short (3-5 characters) and unique. 
          Use standard medical specialty codes when possible (e.g., CARD for Cardiology, ORTHO for Orthopedics).
        </p>
      </div>
    </form>
  );
}
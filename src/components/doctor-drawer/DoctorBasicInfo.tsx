// src/components/doctor-drawer/DoctorBasicInfo.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Save, X } from 'lucide-react';
import { createDoctor, updateDoctor } from '@/services/doctor.service';
import { useSpecialties } from '@/hooks/useDoctors';
import type { Doctor, DoctorCreateData, DoctorUpdateData } from '@/types/doctor.types';
import { Badge } from '@/components/ui/badge';

const doctorSchema = z.object({
  // User fields (only for create mode)
  email: z.string().email('Invalid email').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  password_confirm: z.string().optional(),
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  
  // License fields
  medical_license_number: z.string().optional(),
  license_issuing_authority: z.string().optional(),
  license_issue_date: z.string().optional(),
  license_expiry_date: z.string().optional(),
  
  // Professional fields
  qualifications: z.string().optional(),
  specialty_ids: z.array(z.number()).optional(),
  years_of_experience: z.number().min(0).optional(),
  
  // Fees
  consultation_fee: z.number().min(0).optional(),
  follow_up_fee: z.number().min(0).optional(),
  consultation_duration: z.number().min(5).optional(),
  
  // Availability
  is_available_online: z.boolean().optional(),
  is_available_offline: z.boolean().optional(),
  
  // Status
  status: z.enum(['active', 'on_leave', 'inactive']).optional(),
}).refine((data) => {
  if (data.password && data.password_confirm) {
    return data.password === data.password_confirm;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ['password_confirm'],
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorBasicInfoProps {
  doctor: Doctor | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess: () => void;
  onClose: () => void;
}

export default function DoctorBasicInfo({ doctor, mode, onSuccess, onClose }: DoctorBasicInfoProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);
  const { specialties, isLoading: specialtiesLoading } = useSpecialties();
  
  const isReadOnly = mode === 'view';
  const isCreateMode = mode === 'create';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: isCreateMode ? {
      consultation_duration: 15,
      years_of_experience: 0,
      consultation_fee: 500,
      follow_up_fee: 300,
      is_available_online: false,
      is_available_offline: true,
      status: 'active',
    } : {},
  });

  // Load doctor data into form
  useEffect(() => {
    if (doctor && !isCreateMode) {
      setValue('qualifications', doctor.qualifications || '');
      setValue('years_of_experience', doctor.years_of_experience);
      setValue('consultation_fee', parseFloat(doctor.consultation_fee));
      setValue('follow_up_fee', parseFloat(doctor.follow_up_fee));
      setValue('consultation_duration', doctor.consultation_duration);
      setValue('is_available_online', doctor.is_available_online);
      setValue('is_available_offline', doctor.is_available_offline);
      setValue('status', doctor.status);
      
      // Set selected specialties
      const specialtyIds = doctor.specialties.map(s => s.id);
      setSelectedSpecialties(specialtyIds);
      setValue('specialty_ids', specialtyIds);
    }
  }, [doctor, isCreateMode, setValue]);

  const handleSpecialtyToggle = (specialtyId: number) => {
    if (isReadOnly) return;
    
    setSelectedSpecialties(prev => {
      const newSelection = prev.includes(specialtyId)
        ? prev.filter(id => id !== specialtyId)
        : [...prev, specialtyId];
      setValue('specialty_ids', newSelection);
      return newSelection;
    });
  };

  const onSubmit = async (data: DoctorFormData) => {
    setIsSubmitting(true);
    try {
      if (isCreateMode) {
        // Create new doctor
        const createData: DoctorCreateData = {
          email: data.email!,
          username: data.username!,
          password: data.password!,
          password_confirm: data.password_confirm!,
          first_name: data.first_name!,
          last_name: data.last_name!,
          phone: data.phone || '',
          medical_license_number: data.medical_license_number || '',
          license_issuing_authority: data.license_issuing_authority || '',
          license_issue_date: data.license_issue_date || '',
          license_expiry_date: data.license_expiry_date || '',
          qualifications: data.qualifications || '',
          specialty_ids: selectedSpecialties,
          years_of_experience: data.years_of_experience || 0,
          consultation_fee: data.consultation_fee || 500,
          follow_up_fee: data.follow_up_fee || 300,
          consultation_duration: data.consultation_duration || 15,
        };
        
        await createDoctor(createData);
        toast.success('Doctor registered successfully');
      } else {
        // Update existing doctor
        const updateData: DoctorUpdateData = {
          qualifications: data.qualifications,
          specialty_ids: selectedSpecialties,
          years_of_experience: data.years_of_experience,
          consultation_fee: data.consultation_fee,
          follow_up_fee: data.follow_up_fee,
          consultation_duration: data.consultation_duration,
          status: data.status,
        };
        
        await updateDoctor(doctor!.id, updateData);
        toast.success('Doctor updated successfully');
      }
      
      onSuccess();
      if (isCreateMode) {
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* User Information - Only show in create mode */}
      {isCreateMode && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">User Account</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  {...register('first_name')}
                  disabled={isReadOnly}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  {...register('last_name')}
                  disabled={isReadOnly}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={isReadOnly}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  {...register('username')}
                  disabled={isReadOnly}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+91 XXXXX XXXXX"
                disabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  disabled={isReadOnly}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm">Confirm Password *</Label>
                <Input
                  id="password_confirm"
                  type="password"
                  {...register('password_confirm')}
                  disabled={isReadOnly}
                />
                {errors.password_confirm && (
                  <p className="text-sm text-destructive">{errors.password_confirm.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t pt-6" />
        </>
      )}

      {/* Display user info in view/edit mode */}
      {!isCreateMode && doctor && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold">User Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-medium">{doctor.user.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Username:</span>
              <p className="font-medium">{doctor.user.username}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Name:</span>
              <p className="font-medium">{doctor.user.first_name} {doctor.user.last_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Role:</span>
              <p className="font-medium">{doctor.user.groups.join(', ')}</p>
            </div>
          </div>
        </div>
      )}

      {/* License Information */}
      {isCreateMode && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">License Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="medical_license_number">Medical License Number</Label>
            <Input
              id="medical_license_number"
              {...register('medical_license_number')}
              disabled={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_issuing_authority">Issuing Authority</Label>
            <Input
              id="license_issuing_authority"
              {...register('license_issuing_authority')}
              disabled={isReadOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="license_issue_date">Issue Date</Label>
              <Input
                id="license_issue_date"
                type="date"
                {...register('license_issue_date')}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_expiry_date">Expiry Date</Label>
              <Input
                id="license_expiry_date"
                type="date"
                {...register('license_expiry_date')}
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>
      )}

      {/* Professional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Professional Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="qualifications">Qualifications</Label>
          <Textarea
            id="qualifications"
            {...register('qualifications')}
            placeholder="MBBS, MD (Medicine), DM (Cardiology)"
            disabled={isReadOnly}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Specialties {!isReadOnly && '*'}</Label>
          {specialtiesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading specialties...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-[60px]">
              {specialties.map((specialty) => (
                <Badge
                  key={specialty.id}
                  variant={selectedSpecialties.includes(specialty.id) ? 'default' : 'outline'}
                  className={`cursor-pointer ${isReadOnly ? 'cursor-default' : ''}`}
                  onClick={() => handleSpecialtyToggle(specialty.id)}
                >
                  {specialty.name}
                  {selectedSpecialties.includes(specialty.id) && !isReadOnly && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          )}
          {selectedSpecialties.length === 0 && !isReadOnly && (
            <p className="text-sm text-muted-foreground">Click to select specialties</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="years_of_experience">Years of Experience</Label>
          <Input
            id="years_of_experience"
            type="number"
            min="0"
            {...register('years_of_experience', { valueAsNumber: true })}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Consultation Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Consultation Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
            <Input
              id="consultation_fee"
              type="number"
              min="0"
              step="0.01"
              {...register('consultation_fee', { valueAsNumber: true })}
              disabled={isReadOnly}
            />
            {errors.consultation_fee && (
              <p className="text-sm text-destructive">{errors.consultation_fee.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="follow_up_fee">Follow-up Fee (₹)</Label>
            <Input
              id="follow_up_fee"
              type="number"
              min="0"
              step="0.01"
              {...register('follow_up_fee', { valueAsNumber: true })}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="consultation_duration">Consultation Duration (minutes)</Label>
          <Input
            id="consultation_duration"
            type="number"
            min="5"
            step="5"
            {...register('consultation_duration', { valueAsNumber: true })}
            disabled={isReadOnly}
          />
        </div>

        <div className="space-y-3">
          <Label>Availability Type</Label>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_available_online"
                checked={watch('is_available_online')}
                onCheckedChange={(checked) => setValue('is_available_online', checked as boolean)}
                disabled={isReadOnly}
              />
              <Label htmlFor="is_available_online" className="font-normal cursor-pointer">
                Available Online
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_available_offline"
                checked={watch('is_available_offline')}
                onCheckedChange={(checked) => setValue('is_available_offline', checked as boolean)}
                disabled={isReadOnly}
              />
              <Label htmlFor="is_available_offline" className="font-normal cursor-pointer">
                Available Offline
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Status - Only in edit mode */}
      {!isCreateMode && (
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={watch('status')}
            onValueChange={(value) => setValue('status', value as 'active' | 'on_leave' | 'inactive')}
            disabled={isReadOnly}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
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
                {isCreateMode ? 'Register Doctor' : 'Save Changes'}
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
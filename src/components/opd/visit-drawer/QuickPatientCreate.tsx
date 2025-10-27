// src/components/opd/visit-drawer/QuickPatientCreate.tsx
import { useState, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createPatient } from '@/services/patient.service';
import type { PatientCreateData, PatientGender } from '@/types/patient.types';

export interface QuickPatientCreateRef {
  submitForm: () => Promise<void>;
}

interface QuickPatientCreateProps {
  onSuccess: (patientId: number) => void;
  onCancel: () => void;
  onSaveStart?: () => void;
  onSaveEnd?: () => void;
}

const QuickPatientCreate = forwardRef<QuickPatientCreateRef, QuickPatientCreateProps>(
  ({ onSuccess, onCancel, onSaveStart, onSaveEnd }, ref) => {
    const [formData, setFormData] = useState<PatientCreateData>({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'male',
      mobile_primary: '',
      country: 'India',
    });

    const handleSubmit = async () => {
      // Validation
      if (!formData.first_name.trim()) {
        toast.error('First name is required');
        return;
      }
      if (!formData.last_name.trim()) {
        toast.error('Last name is required');
        return;
      }
      if (!formData.date_of_birth) {
        toast.error('Date of birth is required');
        return;
      }
      if (!formData.mobile_primary.trim()) {
        toast.error('Primary mobile number is required');
        return;
      }

      onSaveStart?.();
      try {
        const response = await createPatient(formData);
        toast.success('Patient registered successfully');
        onSuccess(response.id);
      } catch (error: any) {
        toast.error('Failed to register patient', {
          description: error?.response?.data?.message || error?.message || 'Please try again',
        });
        throw error;
      } finally {
        onSaveEnd?.();
      }
    };

    // Expose submit method via ref
    useImperativeHandle(ref, () => ({
      submitForm: handleSubmit,
    }));

    return (
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
              ℹ️
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Quick Patient Registration
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Fill in the essential details below to quickly register a new patient. 
                You can add more details later from the Patients section.
              </p>
            </div>
          </div>
        </div>

        {/* Essential Fields */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                placeholder="Enter first name"
                required
              />
            </div>

            <div>
              <Label htmlFor="last_name">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                placeholder="Enter last name"
                required
              />
            </div>

            <div>
              <Label htmlFor="date_of_birth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  setFormData({ ...formData, date_of_birth: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="gender">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value: PatientGender) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobile_primary">
                Primary Mobile <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mobile_primary"
                value={formData.mobile_primary}
                onChange={(e) =>
                  setFormData({ ...formData, mobile_primary: e.target.value })
                }
                placeholder="Enter mobile number"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="patient@example.com"
              />
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Additional Details (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobile_secondary">Secondary Mobile</Label>
              <Input
                id="mobile_secondary"
                value={formData.mobile_secondary || ''}
                onChange={(e) =>
                  setFormData({ ...formData, mobile_secondary: e.target.value })
                }
                placeholder="Alternate number"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="Enter city"
              />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 rounded-lg">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>💡 Note:</strong> This is a quick registration form with only essential fields. 
            After creating the visit, you can add more patient details like address, emergency contacts, 
            and insurance information from the Patients section.
          </p>
        </div>
      </div>
    );
  }
);

QuickPatientCreate.displayName = 'QuickPatientCreate';

export default QuickPatientCreate;
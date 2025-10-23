// src/components/patient-drawer/PatientBasicInfo.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createPatient, updatePatient } from '@/services/patient.service';
import type {
  PatientDetail,
  PatientCreateData,
  PatientGender,
  BloodGroup,
  MaritalStatus,
  PatientStatus,
} from '@/types/patient.types';

interface PatientBasicInfoProps {
  patient: PatientDetail | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess: () => void;
  onClose: () => void;
}

export default function PatientBasicInfo({
  patient,
  mode,
  onSuccess,
  onClose,
}: PatientBasicInfoProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PatientCreateData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    mobile_primary: '',
    country: 'India',
  });

  useEffect(() => {
    if (patient && mode !== 'create') {
      setFormData({
        first_name: patient.first_name,
        last_name: patient.last_name,
        middle_name: patient.middle_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        mobile_primary: patient.mobile_primary,
        mobile_secondary: patient.mobile_secondary,
        email: patient.email,
        address_line1: patient.address_line1,
        address_line2: patient.address_line2,
        city: patient.city,
        state: patient.state,
        pincode: patient.pincode,
        country: patient.country,
        blood_group: patient.blood_group,
        height: patient.height,
        weight: patient.weight,
        marital_status: patient.marital_status,
        occupation: patient.occupation,
        emergency_contact_name: patient.emergency_contact_name,
        emergency_contact_phone: patient.emergency_contact_phone,
        emergency_contact_relation: patient.emergency_contact_relation,
        insurance_provider: patient.insurance_provider,
        insurance_policy_number: patient.insurance_policy_number,
        insurance_expiry_date: patient.insurance_expiry_date,
        status: patient.status,
      });
    }
  }, [patient, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (mode === 'create') {
        await createPatient(formData);
        toast.success('Patient registered successfully');
      } else {
        await updatePatient(patient!.id, formData);
        toast.success('Patient updated successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
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
              required
              disabled={isReadOnly}
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
              required
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="middle_name">Middle Name</Label>
            <Input
              id="middle_name"
              value={formData.middle_name || ''}
              onChange={(e) =>
                setFormData({ ...formData, middle_name: e.target.value })
              }
              disabled={isReadOnly}
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
              disabled={isReadOnly}
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
              disabled={isReadOnly}
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

          <div>
            <Label htmlFor="blood_group">Blood Group</Label>
            <Select
              value={formData.blood_group || ''}
              onValueChange={(value: BloodGroup) =>
                setFormData({ ...formData, blood_group: value })
              }
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[]).map(
                  (bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="marital_status">Marital Status</Label>
            <Select
              value={formData.marital_status || ''}
              onValueChange={(value: MaritalStatus) =>
                setFormData({ ...formData, marital_status: value })
              }
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
                <SelectItem value="widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={formData.occupation || ''}
              onChange={(e) =>
                setFormData({ ...formData, occupation: e.target.value })
              }
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      <Separator />

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
              required
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="mobile_secondary">Secondary Mobile</Label>
            <Input
              id="mobile_secondary"
              value={formData.mobile_secondary || ''}
              onChange={(e) =>
                setFormData({ ...formData, mobile_secondary: e.target.value })
              }
              disabled={isReadOnly}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Address */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              value={formData.address_line1 || ''}
              onChange={(e) =>
                setFormData({ ...formData, address_line1: e.target.value })
              }
              disabled={isReadOnly}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              value={formData.address_line2 || ''}
              onChange={(e) =>
                setFormData({ ...formData, address_line2: e.target.value })
              }
              disabled={isReadOnly}
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
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state || ''}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              value={formData.pincode || ''}
              onChange={(e) =>
                setFormData({ ...formData, pincode: e.target.value })
              }
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Medical Info */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              step="0.01"
              value={formData.height || ''}
              onChange={(e) =>
                setFormData({ ...formData, height: e.target.value })
              }
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              value={formData.weight || ''}
              onChange={(e) =>
                setFormData({ ...formData, weight: e.target.value })
              }
              disabled={isReadOnly}
            />
          </div>

          {patient?.bmi && (
            <div className="md:col-span-2">
              <Label>BMI</Label>
              <div className="text-lg font-semibold">{patient.bmi}</div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="emergency_contact_name">Name</Label>
            <Input
              id="emergency_contact_name"
              value={formData.emergency_contact_name || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergency_contact_name: e.target.value,
                })
              }
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="emergency_contact_phone">Phone</Label>
            <Input
              id="emergency_contact_phone"
              value={formData.emergency_contact_phone || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergency_contact_phone: e.target.value,
                })
              }
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="emergency_contact_relation">Relation</Label>
            <Input
              id="emergency_contact_relation"
              value={formData.emergency_contact_relation || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergency_contact_relation: e.target.value,
                })
              }
              disabled={isReadOnly}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Insurance */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Insurance Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="insurance_provider">Provider</Label>
            <Input
              id="insurance_provider"
              value={formData.insurance_provider || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  insurance_provider: e.target.value,
                })
              }
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="insurance_policy_number">Policy Number</Label>
            <Input
              id="insurance_policy_number"
              value={formData.insurance_policy_number || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  insurance_policy_number: e.target.value,
                })
              }
              disabled={isReadOnly}
            />
          </div>

          <div>
            <Label htmlFor="insurance_expiry_date">Expiry Date</Label>
            <Input
              id="insurance_expiry_date"
              type="date"
              value={formData.insurance_expiry_date || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  insurance_expiry_date: e.target.value,
                })
              }
              disabled={isReadOnly}
            />
          </div>

          {patient && (
            <div>
              <Label>Status</Label>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  patient.is_insurance_valid
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {patient.is_insurance_valid ? 'Valid' : 'Expired'}
              </div>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Status */}
      {mode !== 'create' && (
        <div>
          <Label htmlFor="status">Patient Status</Label>
          <Select
            value={formData.status || 'active'}
            onValueChange={(value: PatientStatus) =>
              setFormData({ ...formData, status: value })
            }
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="deceased">Deceased</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Action Buttons */}
      {!isReadOnly && (
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : mode === 'create' ? 'Register' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      )}
    </form>
  );
}
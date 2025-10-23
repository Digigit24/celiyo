// src/components/patient-drawer/AllergyForm.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  AllergyCreateData,
  PatientAllergy,
  AllergyType,
  AllergySeverity,
} from '@/types/patient.types';

interface AllergyFormProps {
  patientId: number;
  allergy?: PatientAllergy | null;
  onSubmit: (data: AllergyCreateData) => void;
  onCancel: () => void;
  saving: boolean;
}

export default function AllergyForm({
  patientId,
  allergy,
  onSubmit,
  onCancel,
  saving,
}: AllergyFormProps) {
  const [formData, setFormData] = useState<AllergyCreateData>({
    patient: patientId,
    allergy_type: 'drug',
    allergen: '',
    severity: 'mild',
    symptoms: '',
    is_active: true,
  });

  useEffect(() => {
    if (allergy) {
      setFormData({
        patient: patientId,
        allergy_type: allergy.allergy_type,
        allergen: allergy.allergen,
        severity: allergy.severity,
        symptoms: allergy.symptoms,
        treatment: allergy.treatment,
        is_active: allergy.is_active,
      });
    }
  }, [allergy, patientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-muted/50">
      <h4 className="font-semibold mb-4">
        {allergy ? 'Edit Allergy' : 'Add New Allergy'}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="allergy_type">
            Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.allergy_type}
            onValueChange={(value: AllergyType) =>
              setFormData({ ...formData, allergy_type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="drug">Drug/Medication</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="environmental">Environmental</SelectItem>
              <SelectItem value="contact">Contact</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="allergen">
            Allergen <span className="text-red-500">*</span>
          </Label>
          <Input
            id="allergen"
            placeholder="e.g., Penicillin, Peanuts"
            value={formData.allergen}
            onChange={(e) =>
              setFormData({ ...formData, allergen: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="severity">
            Severity <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.severity}
            onValueChange={(value: AllergySeverity) =>
              setFormData({ ...formData, severity: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
              <SelectItem value="life_threatening">Life Threatening</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2 pt-6">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_active: checked as boolean })
            }
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Active Allergy
          </Label>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="symptoms">
            Symptoms <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="symptoms"
            placeholder="Describe symptoms experienced..."
            value={formData.symptoms}
            onChange={(e) =>
              setFormData({ ...formData, symptoms: e.target.value })
            }
            required
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="treatment">Treatment/Management</Label>
          <Textarea
            id="treatment"
            placeholder="Treatment or management notes..."
            value={formData.treatment || ''}
            onChange={(e) =>
              setFormData({ ...formData, treatment: e.target.value })
            }
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Saving...' : allergy ? 'Update' : 'Add'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
// src/components/patient-drawer/MedicationForm.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type {
  MedicationCreateData,
  PatientMedication,
} from '@/types/patient.types';

interface MedicationFormProps {
  patientId: number;
  medication?: PatientMedication | null;
  onSubmit: (data: MedicationCreateData) => void;
  onCancel: () => void;
  saving: boolean;
}

export default function MedicationForm({
  patientId,
  medication,
  onSubmit,
  onCancel,
  saving,
}: MedicationFormProps) {
  const [formData, setFormData] = useState<MedicationCreateData>({
    patient: patientId,
    medication_name: '',
    is_active: true,
  });

  useEffect(() => {
    if (medication) {
      setFormData({
        patient: patientId,
        medication_name: medication.medication_name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        start_date: medication.start_date,
        end_date: medication.end_date,
        prescribed_by: medication.prescribed_by,
        is_active: medication.is_active,
        notes: medication.notes,
      });
    }
  }, [medication, patientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-muted/50">
      <h4 className="font-semibold mb-4">
        {medication ? 'Edit Medication' : 'Add New Medication'}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="medication_name">
            Medication Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="medication_name"
            placeholder="e.g., Metformin 500mg"
            value={formData.medication_name}
            onChange={(e) =>
              setFormData({ ...formData, medication_name: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="dosage">Dosage</Label>
          <Input
            id="dosage"
            placeholder="e.g., 500mg"
            value={formData.dosage || ''}
            onChange={(e) =>
              setFormData({ ...formData, dosage: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="frequency">Frequency</Label>
          <Input
            id="frequency"
            placeholder="e.g., Twice daily"
            value={formData.frequency || ''}
            onChange={(e) =>
              setFormData({ ...formData, frequency: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date || ''}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date || ''}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="prescribed_by">Prescribed By</Label>
          <Input
            id="prescribed_by"
            placeholder="Doctor name"
            value={formData.prescribed_by || ''}
            onChange={(e) =>
              setFormData({ ...formData, prescribed_by: e.target.value })
            }
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_active: checked as boolean })
            }
          />
          <Label htmlFor="is_active" className="cursor-pointer">
            Currently Taking
          </Label>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes..."
            value={formData.notes || ''}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Saving...' : medication ? 'Update' : 'Add'}
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
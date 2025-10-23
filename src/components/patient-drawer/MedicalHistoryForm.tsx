// src/components/patient-drawer/MedicalHistoryForm.tsx
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
import type {
  MedicalHistoryCreateData,
  PatientMedicalHistory,
  MedicalHistoryStatus,
} from '@/types/patient.types';

interface MedicalHistoryFormProps {
  patientId: number;
  history?: PatientMedicalHistory | null;
  onSubmit: (data: MedicalHistoryCreateData) => void;
  onCancel: () => void;
  saving: boolean;
}

export default function MedicalHistoryForm({
  patientId,
  history,
  onSubmit,
  onCancel,
  saving,
}: MedicalHistoryFormProps) {
  const [formData, setFormData] = useState<MedicalHistoryCreateData>({
    patient: patientId,
    condition: '',
    status: 'active',
  });

  useEffect(() => {
    if (history) {
      setFormData({
        patient: patientId,
        condition: history.condition,
        diagnosed_date: history.diagnosed_date,
        status: history.status,
        notes: history.notes,
      });
    }
  }, [history, patientId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-muted/50">
      <h4 className="font-semibold mb-4">
        {history ? 'Edit Medical Condition' : 'Add Medical Condition'}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="condition">
            Condition/Diagnosis <span className="text-red-500">*</span>
          </Label>
          <Input
            id="condition"
            placeholder="e.g., Diabetes Type 2, Hypertension"
            value={formData.condition}
            onChange={(e) =>
              setFormData({ ...formData, condition: e.target.value })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="diagnosed_date">Diagnosed Date</Label>
          <Input
            id="diagnosed_date"
            type="date"
            value={formData.diagnosed_date || ''}
            onChange={(e) =>
              setFormData({ ...formData, diagnosed_date: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status || 'active'}
            onValueChange={(value: MedicalHistoryStatus) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="chronic">Chronic</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional notes about the condition..."
            value={formData.notes || ''}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Saving...' : history ? 'Update' : 'Add'}
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
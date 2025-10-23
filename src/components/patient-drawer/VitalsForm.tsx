// src/components/patient-drawer/VitalsForm.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { VitalsCreateData } from '@/types/patient.types';

interface VitalsFormProps {
  patientId: number;
  onSubmit: (data: VitalsCreateData) => void;
  onCancel: () => void;
  saving: boolean;
}

export default function VitalsForm({
  patientId,
  onSubmit,
  onCancel,
  saving,
}: VitalsFormProps) {
  const [formData, setFormData] = useState<VitalsCreateData>({
    patient: patientId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 bg-muted/50">
      <h4 className="font-semibold mb-4">Record New Vitals</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="temperature">Temperature (°C)</Label>
          <Input
            id="temperature"
            type="number"
            step="0.1"
            placeholder="37.0"
            value={formData.temperature || ''}
            onChange={(e) =>
              setFormData({ ...formData, temperature: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="bp_sys">BP Systolic</Label>
          <Input
            id="bp_sys"
            type="number"
            placeholder="120"
            value={formData.blood_pressure_systolic || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                blood_pressure_systolic: Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="bp_dia">BP Diastolic</Label>
          <Input
            id="bp_dia"
            type="number"
            placeholder="80"
            value={formData.blood_pressure_diastolic || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                blood_pressure_diastolic: Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
          <Input
            id="heart_rate"
            type="number"
            placeholder="72"
            value={formData.heart_rate || ''}
            onChange={(e) =>
              setFormData({ ...formData, heart_rate: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <Label htmlFor="respiratory_rate">Respiratory Rate</Label>
          <Input
            id="respiratory_rate"
            type="number"
            placeholder="16"
            value={formData.respiratory_rate || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                respiratory_rate: Number(e.target.value),
              })
            }
          />
        </div>

        <div>
          <Label htmlFor="oxygen_saturation">SpO2 (%)</Label>
          <Input
            id="oxygen_saturation"
            type="number"
            step="0.1"
            placeholder="98"
            value={formData.oxygen_saturation || ''}
            onChange={(e) =>
              setFormData({ ...formData, oxygen_saturation: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="blood_glucose">Blood Glucose (mg/dL)</Label>
          <Input
            id="blood_glucose"
            type="number"
            step="0.1"
            placeholder="100"
            value={formData.blood_glucose || ''}
            onChange={(e) =>
              setFormData({ ...formData, blood_glucose: e.target.value })
            }
          />
        </div>

        <div className="md:col-span-3">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Additional observations..."
            value={formData.notes || ''}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="submit" size="sm" disabled={saving}>
          {saving ? 'Recording...' : 'Record'}
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
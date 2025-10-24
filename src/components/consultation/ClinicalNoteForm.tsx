// src/components/consultation/ClinicalNoteForm.tsx
import { useState } from 'react';
import { useCreateClinicalNote } from '@/hooks/useOPD';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import type { ClinicalNoteCreateData } from '@/types/opd.types';

interface ClinicalNoteFormProps {
  visitId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ClinicalNoteForm({ visitId, onSuccess, onCancel }: ClinicalNoteFormProps) {
  const { createClinicalNote, isCreating } = useCreateClinicalNote();
  const [formData, setFormData] = useState<ClinicalNoteCreateData>({
    visit: visitId,
    present_complaints: '',
    observation: '',
    diagnosis: '',
    investigation: '',
    treatment_plan: '',
    medicines_prescribed: '',
    doctor_advice: '',
    suggested_surgery_name: '',
    suggested_surgery_reason: '',
    next_followup_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClinicalNote(formData);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create clinical note:', error);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="present_complaints">Chief Complaints *</Label>
            <Textarea
              id="present_complaints"
              value={formData.present_complaints}
              onChange={(e) => setFormData({ ...formData, present_complaints: e.target.value })}
              placeholder="Patient's main complaints..."
              rows={3}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="observation">Clinical Observation</Label>
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) => setFormData({ ...formData, observation: e.target.value })}
              placeholder="Physical examination findings..."
              rows={3}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="diagnosis">Diagnosis *</Label>
            <Textarea
              id="diagnosis"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
              placeholder="Primary and differential diagnosis..."
              rows={2}
              required
            />
          </div>

          <div>
            <Label htmlFor="investigation">Investigations</Label>
            <Textarea
              id="investigation"
              value={formData.investigation}
              onChange={(e) => setFormData({ ...formData, investigation: e.target.value })}
              placeholder="Tests ordered..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="treatment_plan">Treatment Plan</Label>
            <Textarea
              id="treatment_plan"
              value={formData.treatment_plan}
              onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
              placeholder="Treatment approach..."
              rows={2}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="medicines_prescribed">Medicines Prescribed</Label>
            <Textarea
              id="medicines_prescribed"
              value={formData.medicines_prescribed}
              onChange={(e) => setFormData({ ...formData, medicines_prescribed: e.target.value })}
              placeholder="List of medicines with dosage..."
              rows={3}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="doctor_advice">Doctor's Advice</Label>
            <Textarea
              id="doctor_advice"
              value={formData.doctor_advice}
              onChange={(e) => setFormData({ ...formData, doctor_advice: e.target.value })}
              placeholder="Instructions for patient..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="suggested_surgery_name">Suggested Surgery (if any)</Label>
            <Input
              id="suggested_surgery_name"
              value={formData.suggested_surgery_name}
              onChange={(e) => setFormData({ ...formData, suggested_surgery_name: e.target.value })}
              placeholder="Surgery name..."
            />
          </div>

          <div>
            <Label htmlFor="suggested_surgery_reason">Surgery Reason</Label>
            <Input
              id="suggested_surgery_reason"
              value={formData.suggested_surgery_reason}
              onChange={(e) => setFormData({ ...formData, suggested_surgery_reason: e.target.value })}
              placeholder="Reason for surgery..."
            />
          </div>

          <div>
            <Label htmlFor="next_followup_date">Next Follow-up Date</Label>
            <Input
              id="next_followup_date"
              type="date"
              value={formData.next_followup_date}
              onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
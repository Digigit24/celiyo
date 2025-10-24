// src/components/consultation/VisitFindingForm.tsx
import { useState } from 'react';
import { useCreateVisitFinding } from '@/hooks/useOPD';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { VisitFindingCreateData, FindingType } from '@/types/opd.types';

interface VisitFindingFormProps {
  visitId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VisitFindingForm({ visitId, onSuccess, onCancel }: VisitFindingFormProps) {
  const { createVisitFinding, isCreating } = useCreateVisitFinding();
  const [formData, setFormData] = useState<VisitFindingCreateData>({
    visit: visitId,
    finding_type: 'examination',
    temperature: '',
    pulse: undefined,
    bp_systolic: undefined,
    bp_diastolic: undefined,
    weight: '',
    height: '',
    spo2: undefined,
    respiratory_rate: undefined,
    tongue: '',
    throat: '',
    cns: '',
    rs: '',
    cvs: '',
    pa: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVisitFinding(formData);
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create visit finding:', error);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="finding_type">Finding Type</Label>
          <Select
            value={formData.finding_type}
            onValueChange={(value: FindingType) => setFormData({ ...formData, finding_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="examination">Examination</SelectItem>
              <SelectItem value="investigation">Investigation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="temperature">Temperature (°F)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              placeholder="98.6"
            />
          </div>

          <div>
            <Label htmlFor="pulse">Pulse (bpm)</Label>
            <Input
              id="pulse"
              type="number"
              value={formData.pulse || ''}
              onChange={(e) => setFormData({ ...formData, pulse: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="72"
            />
          </div>

          <div>
            <Label htmlFor="bp_systolic">BP Systolic</Label>
            <Input
              id="bp_systolic"
              type="number"
              value={formData.bp_systolic || ''}
              onChange={(e) => setFormData({ ...formData, bp_systolic: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="120"
            />
          </div>

          <div>
            <Label htmlFor="bp_diastolic">BP Diastolic</Label>
            <Input
              id="bp_diastolic"
              type="number"
              value={formData.bp_diastolic || ''}
              onChange={(e) => setFormData({ ...formData, bp_diastolic: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="80"
            />
          </div>

          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="70"
            />
          </div>

          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              step="0.1"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="170"
            />
          </div>

          <div>
            <Label htmlFor="spo2">SpO2 (%)</Label>
            <Input
              id="spo2"
              type="number"
              value={formData.spo2 || ''}
              onChange={(e) => setFormData({ ...formData, spo2: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="98"
            />
          </div>

          <div>
            <Label htmlFor="respiratory_rate">Respiratory Rate</Label>
            <Input
              id="respiratory_rate"
              type="number"
              value={formData.respiratory_rate || ''}
              onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="16"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tongue">Tongue</Label>
            <Textarea
              id="tongue"
              value={formData.tongue}
              onChange={(e) => setFormData({ ...formData, tongue: e.target.value })}
              placeholder="Examination findings..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="throat">Throat</Label>
            <Textarea
              id="throat"
              value={formData.throat}
              onChange={(e) => setFormData({ ...formData, throat: e.target.value })}
              placeholder="Examination findings..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="cns">CNS</Label>
            <Textarea
              id="cns"
              value={formData.cns}
              onChange={(e) => setFormData({ ...formData, cns: e.target.value })}
              placeholder="Central nervous system findings..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="rs">RS (Respiratory)</Label>
            <Textarea
              id="rs"
              value={formData.rs}
              onChange={(e) => setFormData({ ...formData, rs: e.target.value })}
              placeholder="Respiratory system findings..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="cvs">CVS (Cardiovascular)</Label>
            <Textarea
              id="cvs"
              value={formData.cvs}
              onChange={(e) => setFormData({ ...formData, cvs: e.target.value })}
              placeholder="Cardiovascular findings..."
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="pa">PA (Per Abdomen)</Label>
            <Textarea
              id="pa"
              value={formData.pa}
              onChange={(e) => setFormData({ ...formData, pa: e.target.value })}
              placeholder="Abdominal examination findings..."
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? 'Saving...' : 'Save Finding'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
// src/components/patient-drawer/PatientVitalsTab.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  usePatientVitals,
  useRecordVitals,
} from '@/hooks/usePatients';
import VitalsForm from './VitalsForm';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PatientVitalsTabProps {
  patientId: number;
  readOnly: boolean;
}

export default function PatientVitalsTab({
  patientId,
  readOnly,
}: PatientVitalsTabProps) {
  const [showForm, setShowForm] = useState(false);
  const { vitals, count, isLoading, mutate } = usePatientVitals(patientId);
  const { trigger: recordVitals, isMutating } = useRecordVitals(patientId);

  const handleAddVitals = async (data: any) => {
    try {
      await recordVitals(data);
      toast.success('Vitals recorded successfully');
      mutate();
      setShowForm(false);
    } catch (error: any) {
      toast.error('Failed to record vitals');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vital Signs History</h3>
        {!readOnly && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Record Vitals
          </Button>
        )}
      </div>

      {showForm && (
        <VitalsForm
          patientId={patientId}
          onSubmit={handleAddVitals}
          onCancel={() => setShowForm(false)}
          saving={isMutating}
        />
      )}

      {vitals.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No vitals recorded yet
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Temp (°C)</TableHead>
                <TableHead>BP</TableHead>
                <TableHead>HR (bpm)</TableHead>
                <TableHead>RR</TableHead>
                <TableHead>SpO2 (%)</TableHead>
                <TableHead>Glucose</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vitals.map((vital) => (
                <TableRow key={vital.id}>
                  <TableCell>
                    {format(new Date(vital.recorded_at), 'dd MMM yyyy, HH:mm')}
                  </TableCell>
                  <TableCell>{vital.temperature || '-'}</TableCell>
                  <TableCell>{vital.blood_pressure || '-'}</TableCell>
                  <TableCell>{vital.heart_rate || '-'}</TableCell>
                  <TableCell>{vital.respiratory_rate || '-'}</TableCell>
                  <TableCell>{vital.oxygen_saturation || '-'}</TableCell>
                  <TableCell>{vital.blood_glucose || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {vital.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        Total Records: {count}
      </div>
    </div>
  );
}
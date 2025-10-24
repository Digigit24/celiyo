// src/components/consultation/HistoryTab.tsx
import type { PatientDetail } from '@/types/patient.types';
import { Card } from '@/components/ui/card';

interface HistoryTabProps {
  patient: PatientDetail;
}

export default function HistoryTab({ patient }: HistoryTabProps) {
  return (
    <Card className="p-6">
      <p className="text-muted-foreground">
        History tab content will be implemented here.
        This will show past visits, billing history, and vitals trends.
      </p>
    </Card>
  );
}
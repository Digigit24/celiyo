// src/components/consultation/ProfileTab.tsx
import type { PatientDetail } from '@/types/patient.types';
import { Card } from '@/components/ui/card';

interface ProfileTabProps {
  patient: PatientDetail;
  onUpdate: (patient: PatientDetail) => void;
}

export default function ProfileTab({ patient, onUpdate }: ProfileTabProps) {
  return (
    <Card className="p-6">
      <p className="text-muted-foreground">
        Profile tab content will be implemented here.
        This will show full patient details with edit functionality.
      </p>
    </Card>
  );
}
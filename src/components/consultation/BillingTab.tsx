// src/components/consultation/BillingTab.tsx
import type { Visit } from '@/types/opd.types';
import type { PatientDetail } from '@/types/patient.types';
import { Card } from '@/components/ui/card';

interface BillingTabProps {
  visit: Visit;
  patient: PatientDetail;
}

export default function BillingTab({ visit, patient }: BillingTabProps) {
  return (
    <Card className="p-6">
      <p className="text-muted-foreground">
        Billing tab content will be implemented here.
        This will show OPD bills, procedure bills, and payment recording.
      </p>
    </Card>
  );
}
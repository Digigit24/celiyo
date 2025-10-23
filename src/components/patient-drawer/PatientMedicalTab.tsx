// src/components/patient-drawer/PatientMedicalTab.tsx
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MedicalHistorySection from './MedicalHistorySection';
import MedicationsSection from './MedicationsSection';

interface PatientMedicalTabProps {
  patientId: number;
  readOnly: boolean;
}

export default function PatientMedicalTab({
  patientId,
  readOnly,
}: PatientMedicalTabProps) {
  return (
    <Tabs defaultValue="history" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="history">Medical History</TabsTrigger>
        <TabsTrigger value="medications">Medications</TabsTrigger>
      </TabsList>

      <TabsContent value="history" className="mt-4">
        <MedicalHistorySection patientId={patientId} readOnly={readOnly} />
      </TabsContent>

      <TabsContent value="medications" className="mt-4">
        <MedicationsSection patientId={patientId} readOnly={readOnly} />
      </TabsContent>
    </Tabs>
  );
}
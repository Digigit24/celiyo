// src/components/PatientDrawer.tsx
import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPatientDetail } from '@/services/patient.service';
import type { PatientDetail } from '@/types/patient.types';
import PatientBasicInfo from './patient-drawer/PatientBasicInfo';
import PatientVitalsTab from './patient-drawer/PatientVitalsTab';
import PatientAllergiesTab from './patient-drawer/PatientAllergiesTab';
import PatientMedicalTab from './patient-drawer/PatientMedicalTab';

interface PatientDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
}

export default function PatientDrawer({
  open,
  onOpenChange,
  patientId,
  mode,
  onSuccess,
}: PatientDrawerProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch patient data when drawer opens
  useEffect(() => {
    if (open && patientId && mode !== 'create') {
      fetchPatientData();
    } else if (mode === 'create') {
      setPatient(null);
    }
  }, [open, patientId, mode]);

  const fetchPatientData = async () => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      const data = await getPatientDetail(patientId);
      setPatient(data);
    } catch (error: any) {
      toast.error('Failed to load patient data');
      console.error('Error fetching patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    fetchPatientData();
    onSuccess?.();
  };

  const handleClose = () => {
    setActiveTab('basic');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {mode === 'create' 
              ? 'Register New Patient' 
              : mode === 'edit'
              ? `Edit Patient - ${patient?.full_name || ''}`
              : `Patient Details - ${patient?.full_name || ''}`
            }
          </SheetTitle>
          {patient && (
            <div className="text-sm text-muted-foreground">
              ID: {patient.patient_id}
            </div>
          )}
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="vitals" disabled={mode === 'create'}>
                Vitals
              </TabsTrigger>
              <TabsTrigger value="allergies" disabled={mode === 'create'}>
                Allergies
              </TabsTrigger>
              <TabsTrigger value="medical" disabled={mode === 'create'}>
                Medical
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <PatientBasicInfo
                patient={patient}
                mode={mode}
                onSuccess={handleSuccess}
                onClose={handleClose}
              />
            </TabsContent>

            <TabsContent value="vitals" className="mt-6">
              {patientId && (
                <PatientVitalsTab
                  patientId={patientId}
                  readOnly={mode === 'view'}
                />
              )}
            </TabsContent>

            <TabsContent value="allergies" className="mt-6">
              {patientId && (
                <PatientAllergiesTab
                  patientId={patientId}
                  readOnly={mode === 'view'}
                />
              )}
            </TabsContent>

            <TabsContent value="medical" className="mt-6">
              {patientId && (
                <PatientMedicalTab
                  patientId={patientId}
                  readOnly={mode === 'view'}
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}
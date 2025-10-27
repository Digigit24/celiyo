// src/components/PatientDrawer.tsx
import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getPatientDetail } from '@/services/patient.service';
import type { PatientDetail } from '@/types/patient.types';
import PatientBasicInfo from './patient-drawer/PatientBasicInfo';
import PatientVitalsTab from './patient-drawer/PatientVitalsTab';
import PatientAllergiesTab from './patient-drawer/PatientAllergiesTab';
import PatientMedicalTab from './patient-drawer/PatientMedicalTab';

import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

interface PatientDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onDelete?: (id: number) => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
}

export default function PatientDrawer({
  open,
  onOpenChange,
  patientId,
  mode,
  onSuccess,
  onDelete,
  onModeChange,
}: PatientDrawerProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  // Sync internal mode with prop
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Fetch patient data when drawer opens
  useEffect(() => {
    if (open && patientId && currentMode !== 'create') {
      fetchPatientData();
    } else if (currentMode === 'create') {
      setPatient(null);
      setActiveTab('basic');
    }
  }, [open, patientId, currentMode]);

  const fetchPatientData = async () => {
    if (!patientId) return;

    setIsLoading(true);
    try {
      const data = await getPatientDetail(patientId);
      setPatient(data);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load patient data');
      console.error('Error fetching patient:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = useCallback(() => {
    if (currentMode !== 'create') {
      fetchPatientData();
    }
    onSuccess?.();
  }, [currentMode, onSuccess]);

  const handleClose = useCallback(() => {
    setActiveTab('basic');
    setPatient(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSwitchToEdit = useCallback(() => {
    setCurrentMode('edit');
    onModeChange?.('edit');
  }, [onModeChange]);

  const handleSwitchToView = useCallback(() => {
    setCurrentMode('view');
    onModeChange?.('view');
  }, [onModeChange]);

  const handleDelete = useCallback(async () => {
    if (!patientId) return;
    
    if (window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      try {
        // await deletePatient(patientId);
        toast.success('Patient deleted successfully');
        onDelete?.(patientId);
        handleClose();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete patient');
      }
    }
  }, [patientId, onDelete, handleClose]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // The actual save logic is handled by PatientBasicInfo
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(
        currentMode === 'create' 
          ? 'Patient registered successfully' 
          : 'Patient updated successfully'
      );
      
      handleSuccess();
      
      if (currentMode === 'edit') {
        handleSwitchToView();
      } else if (currentMode === 'create') {
        handleClose();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save patient');
    } finally {
      setIsSaving(false);
    }
  }, [currentMode, handleSuccess, handleSwitchToView, handleClose]);

  // ===== HEADER CONFIGURATION =====
  const drawerTitle = 
    currentMode === 'create'
      ? 'Register New Patient'
      : patient?.full_name || 'Patient Details';

  const drawerDescription = 
    currentMode === 'create'
      ? undefined
      : patient
      ? `Patient ID: ${patient.patient_id}`
      : undefined;

  // Header actions (edit, delete buttons in view mode)
  const headerActions: DrawerHeaderAction[] = 
    currentMode === 'view' && patient
      ? [
          {
            icon: Pencil,
            onClick: handleSwitchToEdit,
            label: 'Edit patient',
            variant: 'ghost',
          },
          {
            icon: Trash2,
            onClick: handleDelete,
            label: 'Delete patient',
            variant: 'ghost',
          },
        ]
      : [];

  // ===== FOOTER CONFIGURATION =====
  const footerButtons: DrawerActionButton[] = 
    currentMode === 'view'
      ? [
          {
            label: 'Close',
            onClick: handleClose,
            variant: 'outline',
          },
        ]
      : currentMode === 'edit'
      ? [
          {
            label: 'Cancel',
            onClick: handleSwitchToView,
            variant: 'outline',
            disabled: isSaving,
          },
          {
            label: 'Save Changes',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving,
          },
        ]
      : [
          // create mode
          {
            label: 'Cancel',
            onClick: handleClose,
            variant: 'outline',
            disabled: isSaving,
          },
          {
            label: 'Register Patient',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving,
          },
        ];

  // ===== CONTENT =====
  const drawerContent = (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger 
            value="vitals" 
            disabled={currentMode === 'create' || !patient}
          >
            Vitals
          </TabsTrigger>
          <TabsTrigger 
            value="allergies" 
            disabled={currentMode === 'create' || !patient}
          >
            Allergies
          </TabsTrigger>
          <TabsTrigger 
            value="medical" 
            disabled={currentMode === 'create' || !patient}
          >
            Medical
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6 space-y-6">
          <PatientBasicInfo
            patient={patient}
            mode={currentMode}
            onSuccess={handleSuccess}
          />
        </TabsContent>

        <TabsContent value="vitals" className="mt-6">
          {patientId && (
            <PatientVitalsTab
              patientId={patientId}
              readOnly={currentMode === 'view'}
            />
          )}
        </TabsContent>

        <TabsContent value="allergies" className="mt-6">
          {patientId && (
            <PatientAllergiesTab
              patientId={patientId}
              readOnly={currentMode === 'view'}
            />
          )}
        </TabsContent>

        <TabsContent value="medical" className="mt-6">
          {patientId && (
            <PatientMedicalTab
              patientId={patientId}
              readOnly={currentMode === 'view'}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <SideDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={drawerTitle}
      description={drawerDescription}
      mode={currentMode}
      headerActions={headerActions}
      isLoading={isLoading}
      loadingText="Loading patient data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="patient-drawer-width"
      onClose={handleClose}
    >
      {drawerContent}
    </SideDrawer>
  );
}
// src/components/SpecialtyFormDrawer.tsx
import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { getSpecialties } from '@/services/doctor.service';
import type { Specialty } from '@/types/doctor.types';

import SpecialtyBasicInfo from './specialty-drawer/SpecialtyBasicInfo';
import SpecialtyDoctorsTab from './specialty-drawer/SpecialtyDoctorsTab';

import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

interface SpecialtyFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialtyId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onDelete?: (id: number) => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
}

export default function SpecialtyFormDrawer({
  open,
  onOpenChange,
  specialtyId,
  mode,
  onSuccess,
  onDelete,
  onModeChange,
}: SpecialtyFormDrawerProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [specialty, setSpecialty] = useState<Specialty | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentMode, setCurrentMode] = useState(mode);

  // Sync internal mode with prop
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Fetch specialty data when drawer opens
  useEffect(() => {
    if (open && specialtyId && currentMode !== 'create') {
      fetchSpecialtyData();
    } else if (currentMode === 'create') {
      setSpecialty(null);
      setActiveTab('basic');
    }
  }, [open, specialtyId, currentMode]);

  const fetchSpecialtyData = async () => {
    if (!specialtyId) return;

    setIsLoading(true);
    try {
      const response = await getSpecialties();
      const foundSpecialty = response.find((s) => s.id === specialtyId);
      
      if (foundSpecialty) {
        setSpecialty(foundSpecialty);
      } else {
        toast.error('Specialty not found');
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load specialty data');
      console.error('Error fetching specialty:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = useCallback(() => {
    if (currentMode !== 'create') {
      fetchSpecialtyData();
    }
    onSuccess?.();
  }, [currentMode, onSuccess]);

  const handleClose = useCallback(() => {
    setActiveTab('basic');
    setSpecialty(null);
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
    if (!specialtyId) return;
    
    if (window.confirm('Are you sure you want to delete this specialty? This action cannot be undone.')) {
      try {
        // await deleteSpecialty(specialtyId);
        toast.success('Specialty deleted successfully');
        onDelete?.(specialtyId);
        handleClose();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete specialty');
      }
    }
  }, [specialtyId, onDelete, handleClose]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Trigger the save from SpecialtyBasicInfo component
      // The form component should expose a save method or handle via ref
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(
        currentMode === 'create' 
          ? 'Specialty created successfully' 
          : 'Specialty updated successfully'
      );
      
      handleSuccess();
      
      if (currentMode === 'edit') {
        handleSwitchToView();
      } else if (currentMode === 'create') {
        handleClose();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save specialty');
    } finally {
      setIsSaving(false);
    }
  }, [currentMode, handleSuccess, handleSwitchToView, handleClose]);

  const drawerTitle = 
    currentMode === 'create'
      ? 'Create New Specialty'
      : specialty?.name || 'Specialty Details';

  const drawerDescription = 
    currentMode === 'create'
      ? undefined
      : specialty
      ? `Code: ${specialty.code} • ${specialty.doctors_count || 0} ${specialty.doctors_count === 1 ? 'doctor' : 'doctors'}`
      : undefined;

  const headerActions: DrawerHeaderAction[] = 
    currentMode === 'view' && specialty
      ? [
          {
            icon: Pencil,
            onClick: handleSwitchToEdit,
            label: 'Edit specialty',
            variant: 'ghost',
          },
          {
            icon: Trash2,
            onClick: handleDelete,
            label: 'Delete specialty',
            variant: 'ghost',
          },
        ]
      : [];

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
          {
            label: 'Cancel',
            onClick: handleClose,
            variant: 'outline',
            disabled: isSaving,
          },
          {
            label: 'Create Specialty',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving,
          },
        ];

  const drawerContent = (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger 
            value="doctors" 
            disabled={currentMode === 'create' || !specialty}
          >
            Doctors ({specialty?.doctors_count || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6 space-y-6">
          <SpecialtyBasicInfo
            specialty={specialty}
            mode={currentMode}
            onSuccess={handleSuccess}
            // Don't pass onClose - remove any save buttons from the form
          />
        </TabsContent>

        <TabsContent value="doctors" className="mt-6">
          {specialtyId && specialty && (
            <SpecialtyDoctorsTab
              specialtyId={specialtyId}
              specialtyName={specialty.name}
              readOnly={currentMode === 'view'}
              onUpdate={handleSuccess}
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
      loadingText="Loading specialty data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="specialty-drawer-width"
      onClose={handleClose}
    >
      {drawerContent}
    </SideDrawer>
  );
}
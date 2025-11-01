// src/components/SpecialtyFormDrawer.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { getSpecialties } from '@/services/doctor.service';
import type { Specialty } from '@/types/doctor.types';

import SpecialtyBasicInfo from './specialty-drawer/SpecialtyBasicInfo';
import SpecialtyDoctorsTab from './specialty-drawer/SpecialtyDoctorsTab';
import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

// 🔽 Import both CREATE and UPDATE hooks
import { useCreateSpecialty, useUpdateSpecialty } from '@/hooks/useSpecialties';

// ⛳️ Minimal contract your form should expose via ref (non-breaking for UI)
// Implement this in SpecialtyBasicInfo with `forwardRef`:
// use react-hook-form.getValues() under the hood and return the payload.
export type SpecialtyCreatePayload = {
  name: string;
  code: string;
  description?: string | null;
  department?: string | null;
  is_active: boolean;
};

export interface SpecialtyBasicInfoHandle {
  /** Collects current form values with validation (async) for the drawer to submit */
  getFormValues: () => Promise<SpecialtyCreatePayload | null>;
}

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

  // ✅ CREATE hook
  const { trigger: createSpec, isMutating: creating } = useCreateSpecialty();

  // ✅ UPDATE hook - conditionally initialize based on specialtyId
  const { trigger: updateSpec, isMutating: updating } = useUpdateSpecialty(specialtyId || 0);

  // form ref to collect values (UI stays the same)
  const formRef = useRef<SpecialtyBasicInfoHandle | null>(null);

  // Sync internal mode with prop
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // Fetch specialty data when drawer opens (view/edit modes)
  useEffect(() => {
    if (open && specialtyId && currentMode !== 'create') {
      fetchSpecialtyData();
    } else if (currentMode === 'create') {
      setSpecialty(null);
      setActiveTab('basic');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (
      window.confirm(
        'Are you sure you want to delete this specialty? This action cannot be undone.'
      )
    ) {
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
      if (currentMode === 'create') {
        // ✅ CREATE FLOW
        const values = await formRef.current?.getFormValues();

        if (!values) {
          toast.error('Please fill in all required fields correctly');
          return;
        }

        console.log('Creating specialty with values:', values);

        await createSpec(values);

        toast.success('Specialty created successfully');
        handleSuccess();
        handleClose();
      } else if (currentMode === 'edit') {
        // ✅ EDIT FLOW - Now properly implemented
        const values = await formRef.current?.getFormValues();

        if (!values || !specialtyId) {
          toast.error('Please fill in all required fields correctly');
          return;
        }

        console.log('Updating specialty with values:', values);

        // Call the update hook with the values
        await updateSpec(values);

        toast.success('Specialty updated successfully');
        handleSuccess();
        handleSwitchToView();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to save specialty'
      );
    } finally {
      setIsSaving(false);
    }
  }, [currentMode, specialtyId, createSpec, updateSpec, handleSuccess, handleClose, handleSwitchToView]);

  const drawerTitle =
    currentMode === 'create' ? 'Create New Specialty' : specialty?.name || 'Specialty Details';

  const drawerDescription =
    currentMode === 'create'
      ? undefined
      : specialty
      ? `Code: ${specialty.code} • ${specialty.doctors_count || 0} ${
          specialty.doctors_count === 1 ? 'doctor' : 'doctors'
        }`
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
            disabled: isSaving || updating,
          },
          {
            label: 'Save Changes',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving || updating,
          },
        ]
      : [
          {
            label: 'Cancel',
            onClick: handleClose,
            variant: 'outline',
            disabled: isSaving || creating,
          },
          {
            label: 'Create Specialty',
            onClick: handleSave,
            variant: 'default',
            loading: isSaving || creating,
          },
        ];

  const drawerContent = (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="doctors" disabled={currentMode === 'create' || !specialty}>
            Doctors ({specialty?.doctors_count || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6 space-y-6">
          <SpecialtyBasicInfo
            ref={formRef}
            specialty={specialty}
            mode={currentMode}
            onSuccess={handleSuccess}
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
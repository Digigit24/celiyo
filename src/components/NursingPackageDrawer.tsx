// src/components/NursingPackageDrawer.tsx
import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useNursingCarePackage, 
  useCreateNursingCarePackage, 
  useUpdateNursingCarePackage,
  useDeleteNursingCarePackage 
} from '@/hooks/useServices';
import type { NursingCarePackage } from '@/types/service.types';
import NursingPackageForm from './nursing-package-drawer/NursingPackageForm';

import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

interface NursingPackageDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
}

export default function NursingPackageDrawer({
  open,
  onOpenChange,
  packageId,
  mode,
  onSuccess,
  onModeChange,
}: NursingPackageDrawerProps) {
  const [currentMode, setCurrentMode] = useState(mode);

  // Fetch package data when drawer opens
  const { nursingPackage, isLoading: isFetching } = useNursingCarePackage(
    currentMode !== 'create' ? packageId : null
  );

  // Mutations
  const { createNursingPackage, isCreating } = useCreateNursingCarePackage();
  const { updateNursingPackage, isUpdating } = useUpdateNursingCarePackage(packageId || 0);
  const { deleteNursingPackage, isDeleting } = useDeleteNursingCarePackage();

  // Sync internal mode with prop
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  const handleSuccess = useCallback(() => {
    onSuccess?.();
  }, [onSuccess]);

  const handleClose = useCallback(() => {
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
    if (!packageId) return;
    
    if (window.confirm('Are you sure you want to delete this nursing package? This action cannot be undone.')) {
      try {
        await deleteNursingPackage({ id: packageId });
        toast.success('Nursing package deleted successfully');
        handleSuccess();
        handleClose();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete package');
      }
    }
  }, [packageId, deleteNursingPackage, handleSuccess, handleClose]);

  const handleSave = useCallback(async (formData: any) => {
    try {
      if (currentMode === 'create') {
        await createNursingPackage(formData);
        toast.success('Nursing package created successfully');
        handleSuccess();
        handleClose();
      } else if (currentMode === 'edit' && packageId) {
        await updateNursingPackage(formData);
        toast.success('Nursing package updated successfully');
        handleSuccess();
        handleSwitchToView();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save package');
      throw error; // Re-throw so form can handle it
    }
  }, [currentMode, packageId, createNursingPackage, updateNursingPackage, handleSuccess, handleClose, handleSwitchToView]);

  // ===== HEADER CONFIGURATION =====
  const drawerTitle = 
    currentMode === 'create'
      ? 'Create New Nursing Package'
      : nursingPackage?.name || 'Package Details';

  const drawerDescription = 
    currentMode === 'create'
      ? undefined
      : nursingPackage
      ? `Code: ${nursingPackage.code} • ${nursingPackage.category?.name || 'No Category'}`
      : undefined;

  // Header actions (edit, delete buttons in view mode)
  const headerActions: DrawerHeaderAction[] = 
    currentMode === 'view' && nursingPackage
      ? [
          {
            icon: Pencil,
            onClick: handleSwitchToEdit,
            label: 'Edit package',
            variant: 'ghost',
          },
          {
            icon: Trash2,
            onClick: handleDelete,
            label: 'Delete package',
            variant: 'ghost',
            disabled: isDeleting,
          },
        ]
      : [];

  // ===== FOOTER CONFIGURATION =====
  const isSaving = isCreating || isUpdating;

  const footerButtons: DrawerActionButton[] = 
    currentMode === 'view'
      ? [
          {
            label: 'Close',
            onClick: handleClose,
            variant: 'outline',
          },
        ]
      : []; // Form will have its own submit buttons

  // ===== CONTENT =====
  const drawerContent = (
    <div className="space-y-6">
      <NursingPackageForm
        package={nursingPackage}
        mode={currentMode}
        onSubmit={handleSave}
        onCancel={currentMode === 'edit' ? handleSwitchToView : handleClose}
        isSubmitting={isSaving}
      />
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
      isLoading={isFetching}
      loadingText="Loading package data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="nursing-package-drawer-width"
      onClose={handleClose}
    >
      {drawerContent}
    </SideDrawer>
  );
}
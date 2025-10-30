// src/components/HomeHealthcareDrawer.tsx
import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useHomeHealthcareService, 
  useCreateHomeHealthcareService, 
  useUpdateHomeHealthcareService,
  useDeleteHomeHealthcareService 
} from '@/hooks/useServices';
import type { HomeHealthcareService } from '@/types/service.types';
import HomeHealthcareForm from './home-healthcare-drawer/HomeHealthcareForm';

import { SideDrawer, type DrawerActionButton, type DrawerHeaderAction } from '@/components/SideDrawer';

interface HomeHealthcareDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: number | null;
  mode: 'view' | 'edit' | 'create';
  onSuccess?: () => void;
  onModeChange?: (mode: 'view' | 'edit' | 'create') => void;
}

export default function HomeHealthcareDrawer({
  open,
  onOpenChange,
  serviceId,
  mode,
  onSuccess,
  onModeChange,
}: HomeHealthcareDrawerProps) {
  const [currentMode, setCurrentMode] = useState(mode);

  // Fetch service data when drawer opens
  const { homeHealthcareService, isLoading: isFetching } = useHomeHealthcareService(
    currentMode !== 'create' ? serviceId : null
  );

  // Mutations
  const { createHomeHealthcareService, isCreating } = useCreateHomeHealthcareService();
  const { updateHomeHealthcareService, isUpdating } = useUpdateHomeHealthcareService(serviceId || 0);
  const { deleteHomeHealthcareService, isDeleting } = useDeleteHomeHealthcareService();

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
    if (!serviceId) return;
    
    if (window.confirm('Are you sure you want to delete this home healthcare service? This action cannot be undone.')) {
      try {
        await deleteHomeHealthcareService({ id: serviceId });
        toast.success('Home healthcare service deleted successfully');
        handleSuccess();
        handleClose();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete service');
      }
    }
  }, [serviceId, deleteHomeHealthcareService, handleSuccess, handleClose]);

  const handleSave = useCallback(async (formData: any) => {
    try {
      if (currentMode === 'create') {
        await createHomeHealthcareService(formData);
        toast.success('Home healthcare service created successfully');
        handleSuccess();
        handleClose();
      } else if (currentMode === 'edit' && serviceId) {
        await updateHomeHealthcareService(formData);
        toast.success('Home healthcare service updated successfully');
        handleSuccess();
        handleSwitchToView();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save service');
      throw error; // Re-throw so form can handle it
    }
  }, [currentMode, serviceId, createHomeHealthcareService, updateHomeHealthcareService, handleSuccess, handleClose, handleSwitchToView]);

  // ===== HEADER CONFIGURATION =====
  const drawerTitle = 
    currentMode === 'create'
      ? 'Create New Home Healthcare Service'
      : homeHealthcareService?.name || 'Service Details';

  const drawerDescription = 
    currentMode === 'create'
      ? undefined
      : homeHealthcareService
      ? `Code: ${homeHealthcareService.code} • ${homeHealthcareService.category?.name || 'No Category'}`
      : undefined;

  // Header actions (edit, delete buttons in view mode)
  const headerActions: DrawerHeaderAction[] = 
    currentMode === 'view' && homeHealthcareService
      ? [
          {
            icon: Pencil,
            onClick: handleSwitchToEdit,
            label: 'Edit service',
            variant: 'ghost',
          },
          {
            icon: Trash2,
            onClick: handleDelete,
            label: 'Delete service',
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
      <HomeHealthcareForm
        service={homeHealthcareService}
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
      loadingText="Loading service data..."
      size="xl"
      footerButtons={footerButtons}
      footerAlignment="right"
      showBackButton={true}
      resizable={true}
      storageKey="home-healthcare-drawer-width"
      onClose={handleClose}
    >
      {drawerContent}
    </SideDrawer>
  );
}